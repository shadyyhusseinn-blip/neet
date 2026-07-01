import { get, set, clear } from 'idb-keyval';
import { Booking, Package, Expense, Revenue, Backup, BackupSettings, Customer, FixedExpense, Task, PaymentRecord, Offer, Supply, StudioSettings } from '../types';
import { firebaseService } from './firebase';
import { firestoreData } from './firestoreData';

// Helper function to log activity
const logActivity = (action: string, details: any) => {
  if (firebaseService.isReady()) {
    firestoreData.logActivity(action, details).catch(err => console.error('Activity log error:', err));
  }
};

const STORAGE_KEYS = {
  BOOKINGS: 'shadyBookings',
  TEMP_BOOKINGS: 'shadyTempBookings',
  EXPIRED_BOOKINGS: 'shadyExpiredBookings',
  CANCELLED_BOOKINGS: 'shadyCancelledBookings',
  POSTPONED_BOOKINGS: 'shadyPostponedBookings',
  PACKAGES: 'shadyPackages',
  EXPENSES: 'shadyAccountsExpenses',
  FIXED_EXPENSES: 'shadyFixedExpenses',
  REVENUES: 'shadyAccountsRevenues',
  CUSTOMERS: 'shadyCustomers',
  TASKS: 'shadyTasks',
  OFFERS: 'shadyOffers',
  BACKUPS: 'shadyBackups',
  BACKUP_SETTINGS: 'shadyBackupSettings',
  STUDIO_SETTINGS: 'shadyStudioSettings',
  PERSONAL_EXPENSES: 'shadyPersonalExpenses',
  SUPPLIES: 'shadySupplies',
  SHIFTS: 'shadyShifts',
};

// Event listeners for data synchronization
const syncListeners: Map<string, Set<() => void>> = new Map();

const DEFAULT_PACKAGES: Package[] = [
  { id: '1', name: 'الباقة الذهبية', price: 5000, description: 'تصوير يوم كامل - 200 صورة - ألبوم فاخر', category: 'photography', isActive: true }
];

export const storage = {
  async clearAll(): Promise<void> {
    localStorage.clear();
    await clear();
  },
  get<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`❌ Failed to parse ${key} from LocalStorage:`, e);
      return null;
    }
  },

  async set<T>(key: string, value: T, skipGuard = false): Promise<void> {
    if (value === undefined || value === null) {
      console.error(`❌ Attempted to save null/undefined for key: ${key}`);
      return;
    }

    const oldValue = localStorage.getItem(key);
    let stringified: string;
    
    try {
      stringified = JSON.stringify(value);
      // Basic integrity check: don't save empty arrays if they were populated before
      if (!skipGuard && Array.isArray(value) && value.length === 0 && oldValue && JSON.parse(oldValue).length > 5) {
        console.warn(`⚠️ Potential data loss prevented for ${key}. Attempted to save empty array over large dataset.`);
        return; // Prevent overwrite
      }
    } catch (e) {
      console.error(`❌ Serialization failed for ${key}:`, e);
      return;
    }
    
    // 1. Save to localStorage (Fast access)
    try {
      localStorage.setItem(key, stringified);
    } catch (e) {
      console.error(`❌ LocalStorage quota exceeded or failed for ${key}:`, e);
      storage.toast('فشل الحفظ في الذاكرة السريعة. يرجى مسح بعض البيانات.', 'error');
    }
    
    // 2. Save to IndexedDB (Persistence - Mirroring)
    try {
      await set(key, value);
    } catch (e) {
      console.warn(`❌ Failed to mirror ${key} to IndexedDB:`, e);
    }
    
    // 3. Trigger Auto-Backup to File System (if configured)
    if (Object.values(STORAGE_KEYS).includes(key) && key !== STORAGE_KEYS.BACKUPS && key !== STORAGE_KEYS.BACKUP_SETTINGS) {
      storage.triggerAutoBackup();
    }
    
    // Trigger sync event for cross-tab synchronization
    window.dispatchEvent(new CustomEvent('shady-data-sync', { 
      detail: { key, oldValue, newValue: stringified } 
    }));
    
    // Notify listeners for this key
    const listeners = syncListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  },

  // Check for data loss and automatically recover from IndexedDB if localStorage is empty
  async checkDataLossAndPrompt(): Promise<void> {
    console.log('🔄 Checking for data loss and integrity...');
    const localBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const isLocalEmpty = !localBookings || localBookings === '[]' || localBookings === 'null';
    
    try {
      const dbBookings = await get(STORAGE_KEYS.BOOKINGS);
      const isDbPopulated = dbBookings && Array.isArray(dbBookings) && dbBookings.length > 0;
      
      if (isLocalEmpty && isDbPopulated) {
        console.warn('⚠️ Data loss detected in LocalStorage. Auto-recovering from IndexedDB...');
        await storage.recoverFromIndexedDB();
        storage.toast('تم استعادة البيانات المفقودة تلقائياً من قاعدة البيانات الداخلية', 'success');
      } else if (isLocalEmpty) {
        // Truly empty or first run
        console.log('ℹ️ System initialized. No previous data found.');
      }
    } catch (e) {
      console.error('Failed to check IndexedDB for data loss', e);
    }
  },

  // Manual Recovery function: Restores localStorage from IndexedDB
  async recoverFromIndexedDB(): Promise<void> {
    console.log('🔄 Restoring from IndexedDB...');
    let recoveredCount = 0;
    
    for (const key of Object.values(STORAGE_KEYS)) {
        try {
          const dbData = await get(key);
          if (dbData) {
            localStorage.setItem(key, JSON.stringify(dbData));
            recoveredCount++;
            console.log(`✅ Recovered ${key} from IndexedDB`);
          }
        } catch (e) {
          console.error(`❌ Recovery failed for ${key}:`, e);
        }
    }
    
    if (recoveredCount > 0) {
      console.log(`📦 Recovery complete. Restored ${recoveredCount} tables.`);
      window.location.reload(); 
    }
  },

  // Subscribe to data changes for a specific key
  subscribe(key: string, callback: () => void): () => void {
    if (!syncListeners.has(key)) {
      syncListeners.set(key, new Set());
    }
    syncListeners.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = syncListeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          syncListeners.delete(key);
        }
      }
    };
  },

  // Subscribe to all data changes
  subscribeToAll(callback: (key: string) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>;
      callback(customEvent.detail.key);
    };
    
    window.addEventListener('shady-data-sync', handler);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('shady-data-sync', handler);
    };
  },

  // Listen for changes from other tabs/windows
  initCrossTabSync(): void {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('shady')) {
        // Notify listeners for this key
        const listeners = syncListeners.get(event.key);
        if (listeners) {
          listeners.forEach(listener => listener());
        }
      }
    });
  },

  getBookings(): Booking[] {
    return storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];
  },

  getTempBookings(): Booking[] {
    return storage.get<Booking[]>(STORAGE_KEYS.TEMP_BOOKINGS) || [];
  },

  getExpiredBookings(): Booking[] {
    return storage.get<Booking[]>(STORAGE_KEYS.EXPIRED_BOOKINGS) || [];
  },

  getCancelledBookings(): Booking[] {
    return storage.get<Booking[]>(STORAGE_KEYS.CANCELLED_BOOKINGS) || [];
  },

  getPostponedBookings(): Booking[] {
    return storage.get<Booking[]>(STORAGE_KEYS.POSTPONED_BOOKINGS) || [];
  },

  getAllBookings(): Booking[] {
    return [
      ...storage.getBookings(),
      ...storage.getTempBookings(),
      ...storage.getExpiredBookings(),
      ...storage.getCancelledBookings(),
      ...storage.getPostponedBookings(),
    ];
  },


  saveBooking(booking: Booking): void {
    // Sanitize numeric inputs to prevent NaN propagation
    booking.paidAmount = isNaN(booking.paidAmount) ? 0 : booking.paidAmount;
    booking.totalPrice = isNaN(booking.totalPrice) ? 0 : booking.totalPrice;
    booking.remainingAmount = isNaN(booking.remainingAmount) ? 0 : booking.remainingAmount;
    
    const isTemporary = !booking.paidAmount || booking.paidAmount === 0;
    
    if (isTemporary) {
      booking.status = 'temporary';
    } else {
      booking.status = 'confirmed';
      
      // Save as revenue if paid amount exists
      const revenue: Revenue = {
        id: Date.now().toString() + '-init',
        type: booking.remainingAmount === 0 ? 'full' : 'deposit',
        clientName: booking.clientName,
        bookingId: booking.id,
        amount: booking.paidAmount,
        totalAmount: booking.totalPrice,
        remaining: booking.remainingAmount,
        date: booking.date,
        paymentMethod: booking.paymentMethod || 'cash',
        notes: 'دفعة مقدمة (عربون) عند التعاقد',
        source: 'booking',
        createdAt: new Date().toISOString()
      };
      storage.saveRevenue(revenue);
      storage.showNotification('تأكيد حجز', `تم تأكيد حجز جديد لـ ${booking.clientName}`);
    }

    // Always update customer database, match by name if phone is missing
    storage.updateCustomerFromBooking(booking);
    
    // Log activity
    logActivity('booking_created', { bookingId: booking.id, clientName: booking.clientName, status: booking.status });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.saveBooking(booking).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  // Internal helper to find and update a booking in any list
  _findAndUpdateBooking(id: string, updateFn: (booking: Booking) => Booking | null): boolean {
    const listKeys = [
      STORAGE_KEYS.BOOKINGS,
      STORAGE_KEYS.TEMP_BOOKINGS,
      STORAGE_KEYS.EXPIRED_BOOKINGS,
      STORAGE_KEYS.CANCELLED_BOOKINGS,
      STORAGE_KEYS.POSTPONED_BOOKINGS,
    ];

    for (const key of listKeys) {
      const list = storage.get<Booking[]>(key) || [];
      const index = list.findIndex(b => b.id === id);
      if (index > -1) {
        const updated = updateFn(list[index]);
        if (updated) {
          list[index] = updated;
          storage.set(key, list);
          return true;
        }
      }
    }
    return false;
  },

  toggleDeliveryItem(bookingId: string, itemId: string): void {
    storage._findAndUpdateBooking(bookingId, (booking) => {
      if (!booking.deliveryItems) return null;
      
      const itemIndex = booking.deliveryItems.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        const item = booking.deliveryItems[itemIndex];
        item.isDelivered = !item.isDelivered;
        item.deliveredAt = item.isDelivered ? new Date().toISOString() : undefined;
        
        // If all items are delivered, maybe update workflow status to delivered?
        const allDelivered = booking.deliveryItems.every(i => i.isDelivered);
        if (allDelivered) {
          booking.workflowStatus = 'delivered';
          booking.deliveryDate = booking.deliveryDate || new Date().toISOString().split('T')[0];
        } else if (booking.workflowStatus === 'delivered') {
          booking.workflowStatus = 'ready'; // Move back if some items were unchecked
        }
        
        return booking;
      }
      return null;
    });
    storage.triggerAutoBackup();
  },

  addPaymentToBooking(bookingId: string, payment: { amount: number, date: string, method: string, notes?: string }): void {
    const success = storage._findAndUpdateBooking(bookingId, (booking) => {
      const paymentRecord: PaymentRecord = {
        ...payment,
        id: Date.now().toString()
      };
      
      booking.paymentHistory = booking.paymentHistory || [];
      booking.paymentHistory.push(paymentRecord);
      
      booking.paidAmount += payment.amount;
      booking.remainingAmount = Math.max(0, (booking.totalPrice - (booking.discount || 0)) - booking.paidAmount);
      
      // If it was temporary and now has payment, move to confirmed
      if (booking.status === 'temporary' && booking.paidAmount > 0) {
         booking.status = 'confirmed';
         // Note: We don't move it between lists here to avoid complexity in _findAndUpdateBooking,
         // instead we handle the move specifically if needed, but for now we update in place.
         // Actually, moving lists is important for UI tabs.
      }
      return booking;
    });

    if (success) {
      // Handle the revenue record and customer update
      const booking = storage.getAllBookings().find(b => b.id === bookingId);
      if (booking) {
        // Save revenue record
        const revenue: Revenue = {
          id: Date.now().toString() + '-pay',
          bookingId: booking.id,
          clientName: booking.clientName,
          amount: payment.amount,
          totalAmount: booking.totalPrice,
          remaining: booking.remainingAmount,
          date: payment.date,
          paymentMethod: payment.method,
          notes: payment.notes || 'دفعة مالية مضافة',
          type: booking.remainingAmount === 0 ? 'full' : 'partial',
          source: 'booking',
          createdAt: new Date().toISOString()
        };
        storage.saveRevenue(revenue);
        
        // Update customer total paid
        const customers = storage.getCustomers();
        const customerIndex = customers.findIndex(c => c.phone === booking.phone);
        if (customerIndex > -1) {
          customers[customerIndex].totalPaid += payment.amount;
          storage.set(STORAGE_KEYS.CUSTOMERS, customers);
        }
        
        // If it changed from temporary to confirmed, move it to the correct list
        if (booking.status === 'confirmed') {
          const temps = storage.getTempBookings();
          const inTemp = temps.find(b => b.id === bookingId);
          if (inTemp) {
            storage.set(STORAGE_KEYS.TEMP_BOOKINGS, temps.filter(b => b.id !== bookingId));
            const active = storage.getBookings();
            active.push(booking);
            storage.set(STORAGE_KEYS.BOOKINGS, active);
            storage.showNotification('تأكيد حجز', `تم دفع عربون وتحويل حجز ${booking.clientName} إلى الحجوزات المؤكدة`);
          }
        }
        
        storage.triggerAutoBackup();
      }
    }
  },

  updateCustomerFromBooking(booking: Booking): void {
    const customers = storage.getCustomers();
    let existingIndex = -1;
    
    if (booking.phone && booking.phone.trim()) {
       existingIndex = customers.findIndex(c => c.phone === booking.phone);
    } else if (booking.clientName && booking.clientName.trim() !== 'عميل مجهول') {
       existingIndex = customers.findIndex(c => c.name === booking.clientName);
    }
    
    if (existingIndex > -1) {
      const customer = customers[existingIndex];
      customer.name = booking.clientName; // Update name if changed
      customer.phone = booking.phone || customer.phone || '';
      customer.whatsappPhone = booking.whatsappPhone || customer.whatsappPhone || '';
      customer.totalBookings += 1;
      customer.totalPaid += (booking.paidAmount || 0);
      customer.lastBookingDate = booking.date;
      customers[existingIndex] = customer;
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: booking.clientName || 'عميل مجهول',
        phone: booking.phone || '',
        whatsappPhone: booking.whatsappPhone || '',
        totalBookings: 1,
        totalPaid: booking.paidAmount || 0,
        lastBookingDate: booking.date,
        createdAt: new Date().toISOString()
      };
      customers.push(newCustomer);
    }
    storage.set(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getCustomers(): Customer[] {
    return storage.get<Customer[]>(STORAGE_KEYS.CUSTOMERS) || [];
  },

  saveCustomer(customer: Customer): void {
    // Log activity
    logActivity('customer_saved', { customerId: customer.id, name: customer.name });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.saveCustomer(customer).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  saveTempBooking(booking: Booking): void {
    const tempBookings = storage.getTempBookings();
    tempBookings.push(booking);
    storage.set(STORAGE_KEYS.TEMP_BOOKINGS, tempBookings);
    storage.triggerAutoBackup();
  },

  updateBooking(id: string, updatedBooking: Booking): void {
    // Sanitize numeric inputs to prevent NaN propagation
    if (updatedBooking.paidAmount !== undefined) updatedBooking.paidAmount = isNaN(updatedBooking.paidAmount) ? 0 : updatedBooking.paidAmount;
    if (updatedBooking.totalPrice !== undefined) updatedBooking.totalPrice = isNaN(updatedBooking.totalPrice) ? 0 : updatedBooking.totalPrice;
    if (updatedBooking.remainingAmount !== undefined) updatedBooking.remainingAmount = isNaN(updatedBooking.remainingAmount) ? 0 : updatedBooking.remainingAmount;

    // Get current booking from Firestore for financial sync
    firestoreData.getBookingById(id).then(oldBooking => {
      if (oldBooking) {
        const oldPaid = oldBooking.paidAmount || 0;
        const newPaid = updatedBooking.paidAmount || 0;
        
        // Auto-sync financial changes to Revenues/Expenses
        if (newPaid > oldPaid) {
          const diff = newPaid - oldPaid;
          storage.saveRevenue({
            id: Date.now().toString() + Math.random(),
            amount: diff,
            notes: `تحديث حجز: ${updatedBooking.clientName} (مبلغ إضافي)`,
            clientName: updatedBooking.clientName,
            bookingId: updatedBooking.id,
            date: new Date().toISOString(),
            paymentMethod: 'cash',
            type: updatedBooking.remainingAmount === 0 ? 'full' : 'partial',
            source: 'booking',
            createdAt: new Date().toISOString()
          });
        } else if (newPaid < oldPaid) {
          const diff = oldPaid - newPaid;
          storage.saveExpense({
            id: Date.now().toString() + Math.random(),
            name: `تعديل حجز: ${updatedBooking.clientName}`,
            amount: diff,
            notes: `تخفيض المبلغ المدفوع`,
            date: new Date().toISOString(),
            category: 'other',
            createdAt: new Date().toISOString()
          });
        }

        // Log activity
        logActivity('booking_updated', { bookingId: id, clientName: updatedBooking.clientName });
        
        // Save to Firestore directly (Firestore handles offline persistence automatically)
        firestoreData.updateBooking(updatedBooking).catch(err => console.error('Firestore sync error:', err));
        
        storage.triggerAutoBackup();
      }
    }).catch(err => console.error('Error getting booking for update:', err));
  },

  deleteBooking(id: string): void {
    // Log activity
    logActivity('booking_deleted', { bookingId: id });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.deleteBooking(id).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  deleteAllBookings(): void {
    const allKeys = [
      STORAGE_KEYS.BOOKINGS,
      STORAGE_KEYS.TEMP_BOOKINGS,
      STORAGE_KEYS.EXPIRED_BOOKINGS,
      STORAGE_KEYS.CANCELLED_BOOKINGS,
      STORAGE_KEYS.POSTPONED_BOOKINGS,
    ];
    allKeys.forEach(key => storage.set(key, [], true));
    
    // Also remove all booking-related revenues
    storage.set(STORAGE_KEYS.REVENUES, [], true);
    
    storage.triggerAutoBackup();
  },

  updateWorkflowStatus(bookingId: string, status: Booking['workflowStatus']): void {
    // Get current bookings from Firestore and update
    firestoreData.getBookings().then(bookings => {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const updated = { ...booking, workflowStatus: status };
        firestoreData.updateBooking(updated).catch(err => console.error('Firestore sync error:', err));
      }
    }).catch(err => console.error('Error getting bookings:', err));
  },

  updateBookingStatus(bookingId: string, status: Booking['status']): void {
    // Get current bookings from Firestore and update status
    firestoreData.getBookings().then(bookings => {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const updated = { ...booking, status };
        firestoreData.updateBooking(updated).catch(err => console.error('Firestore sync error:', err));
      }
    }).catch(err => console.error('Error getting bookings:', err));
  },

  getPackages(): Package[] {
    const pkgs = storage.get<Package[]>(STORAGE_KEYS.PACKAGES);
    if (!pkgs) {
      storage.set(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
      return DEFAULT_PACKAGES;
    }
    return pkgs;
  },

  savePackage(pkg: Package): void {
    // Log activity
    logActivity('package_created', { packageId: pkg.id, name: pkg.name });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.savePackage(pkg).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  getExpenses(): Expense[] {
    return storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
  },

  saveExpense(expense: Expense): void {
    // Log activity
    logActivity('expense_created', { expenseId: expense.id, name: expense.name, amount: expense.amount });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.saveExpense(expense).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  deleteExpense(id: string): void {
    // Log activity
    logActivity('expense_deleted', { expenseId: id });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.deleteExpense(id).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  getRevenues(): Revenue[] {
    return storage.get<Revenue[]>(STORAGE_KEYS.REVENUES) || [];
  },

  saveRevenue(revenue: Revenue): void {
    // Log activity
    logActivity('revenue_created', { revenueId: revenue.id, clientName: revenue.clientName, amount: revenue.amount });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.saveRevenue(revenue).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  deleteRevenue(id: string): void {
    // Log activity
    logActivity('revenue_deleted', { revenueId: id });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.deleteRevenue(id).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  getPersonalExpenses(): any[] {
    return storage.get<any[]>(STORAGE_KEYS.PERSONAL_EXPENSES) || [];
  },

  savePersonalExpense(expense: any): void {
    const expenses = storage.getPersonalExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index > -1) {
      expenses[index] = expense;
    } else {
      expenses.push(expense);
    }
    storage.set(STORAGE_KEYS.PERSONAL_EXPENSES, expenses);
    storage.triggerAutoBackup();
  },

  deletePersonalExpense(id: string): void {
    const expenses = storage.getPersonalExpenses().filter(e => e.id !== id);
    storage.set(STORAGE_KEYS.PERSONAL_EXPENSES, expenses);
    storage.triggerAutoBackup();
  },

  getShifts(): any[] {
    return storage.get<any[]>(STORAGE_KEYS.SHIFTS) || [];
  },

  saveShift(shift: any): void {
    const shifts = storage.getShifts();
    const index = shifts.findIndex(s => s.id === shift.id);
    if (index > -1) {
      shifts[index] = shift;
    } else {
      shifts.push(shift);
    }
    storage.set(STORAGE_KEYS.SHIFTS, shifts);
    storage.triggerAutoBackup();
  },

  deleteShift(id: string): void {
    const shifts = storage.getShifts().filter(s => s.id !== id);
    storage.set(STORAGE_KEYS.SHIFTS, shifts);
    storage.triggerAutoBackup();
  },

  getFixedExpenses(): FixedExpense[] {
    return storage.get<FixedExpense[]>(STORAGE_KEYS.FIXED_EXPENSES) || [];
  },

  saveFixedExpense(expense: FixedExpense): void {
    const expenses = storage.getFixedExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index > -1) {
      expenses[index] = expense;
    } else {
      expenses.push(expense);
    }
    storage.set(STORAGE_KEYS.FIXED_EXPENSES, expenses);
    storage.triggerAutoBackup();
  },

  deleteFixedExpense(id: string): void {
    const expenses = storage.getFixedExpenses().filter(e => e.id !== id);
    storage.set(STORAGE_KEYS.FIXED_EXPENSES, expenses);
    storage.triggerAutoBackup();
  },

  getTasks(): Task[] {
    return storage.get<Task[]>(STORAGE_KEYS.TASKS) || [];
  },

  saveTask(task: Task): void {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    storage.set(STORAGE_KEYS.TASKS, tasks);
    storage.triggerAutoBackup();
  },

  deleteTask(id: string): void {
    const tasks = storage.getTasks().filter(t => t.id !== id);
    storage.set(STORAGE_KEYS.TASKS, tasks);
    storage.triggerAutoBackup();
  },

  getOffers(): Offer[] {
    return storage.get<Offer[]>(STORAGE_KEYS.OFFERS) || [];
  },

  saveOffer(offer: Offer): void {
    const offers = storage.getOffers();
    const index = offers.findIndex(o => o.id === offer.id);
    if (index > -1) {
      offers[index] = offer;
    } else {
      offers.push(offer);
    }
    storage.set(STORAGE_KEYS.OFFERS, offers);
    storage.triggerAutoBackup();
  },

  deleteOffer(id: string): void {
    const offers = storage.getOffers().filter(o => o.id !== id);
    storage.set(STORAGE_KEYS.OFFERS, offers);
    storage.triggerAutoBackup();
  },

  getSupplies(): Supply[] {
    return storage.get<Supply[]>(STORAGE_KEYS.SUPPLIES) || [];
  },

  saveSupply(supply: Supply): void {
    const supplies = storage.getSupplies();
    const index = supplies.findIndex(s => s.id === supply.id);
    if (index > -1) {
      supplies[index] = supply;
    } else {
      supplies.push(supply);
    }
    storage.set(STORAGE_KEYS.SUPPLIES, supplies);
    storage.triggerAutoBackup();
  },

  deleteSupply(id: string): void {
    const supplies = storage.getSupplies().filter(s => s.id !== id);
    storage.set(STORAGE_KEYS.SUPPLIES, supplies);
    storage.triggerAutoBackup();
  },

  deletePackage(id: string): void {
    // Log activity
    logActivity('package_deleted', { packageId: id });
    
    // Save to Firestore directly (Firestore handles offline persistence automatically)
    firestoreData.deletePackage(id).catch(err => console.error('Firestore sync error:', err));
    
    storage.triggerAutoBackup();
  },

  async showNotification(title: string, body: string): Promise<void> {
    // 1. Browser/Electron System Notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { 
          body, 
          icon: '/logo.png',
          silent: false,
          requireInteraction: false
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/logo.png' });
        }
      }
    }
    
    // 2. Internal Toast Notification
    this.toast(`${title}: ${body}`, 'info');
    
    // 3. Sound effect (if applicable)
    // Audio is handled by individual components or services
  },

  getBackups(): Backup[] {
    return storage.get<Backup[]>(STORAGE_KEYS.BACKUPS) || [];
  },

  saveBackup(backup: Backup): void {
    const backups = storage.getBackups();
    backups.unshift(backup);
    storage.set(STORAGE_KEYS.BACKUPS, backups);
  },

  getBackupSettings(): BackupSettings {
    return storage.get<BackupSettings>(STORAGE_KEYS.BACKUP_SETTINGS) || {
      autoBackup: false,
      frequency: 'daily',
      time: '00:00',
      maxBackups: 10
    };
  },

  saveBackupSettings(settings: BackupSettings): void {
    storage.set(STORAGE_KEYS.BACKUP_SETTINGS, settings);
  },

  getStudioSettings(): StudioSettings {
    const saved = storage.get<StudioSettings>(STORAGE_KEYS.STUDIO_SETTINGS);
    if (saved) return saved;
    return {
      name: 'Shady Hussein Studio',
      phone: '+20 100 000 0000',
      whatsapp: '+20 100 000 0000',
      address: 'القاهرة، مصر',
      facebook: 'shadyhussein',
      instagram: 'shadyhussein',
      currency: 'EGP',
      language: 'ar'
    };
  },

  saveStudioSettings(settings: StudioSettings): void {
    storage.set(STORAGE_KEYS.STUDIO_SETTINGS, settings);
    storage.triggerAutoBackup('تحديث إعدادات المصور');
  },

  toast(message: string, type: 'success' | 'info' | 'error' = 'success'): void {
    window.dispatchEvent(new CustomEvent('shady-toast', { 
      detail: { message, type } 
    }));
  },

  // Smart Local Backup Detection (Suggestion 3)
  async scanForUSBDrives(): Promise<string[]> {
    // Only works in Electron
    if (!(window as any).electronAPI?.isElectron) return [];
    
    const drives = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const foundDrives: string[] = [];
    
    for (const drive of drives) {
      try {
        const pathStr = `${drive}:\\`;
        if ((window as any).electronAPI.fsExistsSync(pathStr)) {
          foundDrives.push(pathStr);
        }
      } catch (e) {}
    }
    return foundDrives;
  },

  async backupToPath(targetPath: string): Promise<boolean> {
    if (!(window as any).electronAPI?.isElectron) return false;
    
    try {
      const data = {
        bookings: storage.getBookings(),
        tempBookings: storage.getTempBookings(),
        expiredBookings: storage.getExpiredBookings(),
        cancelledBookings: storage.getCancelledBookings(),
        postponedBookings: storage.getPostponedBookings(),
        packages: storage.getPackages(),
        revenues: storage.getRevenues(),
        expenses: storage.getExpenses(),
        fixedExpenses: storage.getFixedExpenses(),
        customers: storage.getCustomers(),
        tasks: storage.getTasks(),
        offers: storage.getOffers(),
        supplies: storage.getSupplies(),
        timestamp: new Date().toISOString()
      };

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `shady-studio-usb-backup-${dateStr}--${timeStr}.json`;
      const fullPath = (window as any).electronAPI.pathJoin(targetPath, fileName);
      
      // Ensure directory exists or is accessible
      (window as any).electronAPI.fsWriteFileSync(fullPath, JSON.stringify(data, null, 2));
      
      this.toast(`تم الحفظ بنجاح في ${fullPath}`, 'success');
      return true;
    } catch (err) {
      console.error('USB Backup failed:', err);
      this.toast('فشل الحفظ في الفلاشة. تأكد من توفر مساحة كافية.', 'error');
      return false;
    }
  },

  async triggerAutoBackup(operationName?: string): Promise<void> {
    try {
      const data = {
        bookings: storage.getBookings(),
        tempBookings: storage.getTempBookings(),
        expiredBookings: storage.getExpiredBookings(),
        cancelledBookings: storage.getCancelledBookings(),
        postponedBookings: storage.getPostponedBookings(),
        packages: storage.getPackages(),
        revenues: storage.getRevenues(),
        expenses: storage.getExpenses(),
        fixedExpenses: storage.getFixedExpenses(),
        customers: storage.getCustomers(),
        tasks: storage.getTasks(),
        offers: storage.getOffers(),
        supplies: storage.getSupplies(),
        timestamp: new Date().toISOString()
      };

      // Always save a fallback automatic backup to localStorage
      localStorage.setItem('shady_auto_backup', JSON.stringify(data));
      localStorage.setItem('shady_last_backup_time', new Date().toISOString());

      // If a directory is selected, save to file system
      const handle = await get('shadyBackupDir');
      if (handle) {
        window.dispatchEvent(new CustomEvent('shady-backup-status', { 
          detail: { status: 'syncing' } 
        }));

        const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
          const fileName = `shady-studio-backup-${dateStr}--${timeStr}.json`;
          const latestFileName = `shady-studio-latest.json`;
          
          const [fileHandle, latestHandle] = await Promise.all([
            (handle as any).getFileHandle(fileName, { create: true }),
            (handle as any).getFileHandle(latestFileName, { create: true })
          ]);

          const [writable, latestWritable] = await Promise.all([
            fileHandle.createWritable(),
            latestHandle.createWritable()
          ]);

          const jsonData = JSON.stringify(data, null, 2);
          await Promise.all([
            writable.write(jsonData),
            latestWritable.write(jsonData)
          ]);

          await Promise.all([
            writable.close(),
            latestWritable.close()
          ]);
          
          const settings = storage.getBackupSettings();
          const timestampStr = new Date().toISOString();
          storage.saveBackupSettings({ ...settings, lastBackupDate: timestampStr });

          // Log backup metadata for history (Without storing the huge data payload)
          const backups = storage.getBackups();
          backups.unshift({
             id: Date.now().toString(),
             timestamp: Date.now(),
             date: timestampStr,
             source: 'تلقائي (مجلد النظام)',
             size: jsonData.length,
             description: operationName || 'مزامنة دورية',
             data: null
          });
          if (backups.length > 50) backups.pop();
          localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));

          window.dispatchEvent(new CustomEvent('shady-backup-status', { 
            detail: { status: 'success', timestamp: timestampStr } 
          }));
        }
      }

      // Show the toast so the user knows it worked
      if (operationName) {
        // this.toast(`تم الحفظ تلقائياً: ${operationName}`, 'success');
      } else {
        // Since the user requested that auto backup happens on every action, we show a general toast
        // this.toast(`تم تحديث بيانات النظام والنسخ التلقائي بنجاح`, 'success');
      }

    } catch (err) {
      console.error('Auto-backup failed:', err);
      window.dispatchEvent(new CustomEvent('shady-backup-status', { 
        detail: { status: 'error', error: err } 
      }));
      this.toast('تم الحفظ داخلياً ولكن تعذر النسخ للمجلد الخارجي', 'info');
    }

    // --- Automatic Cloud Push ---
    const settings = storage.getBackupSettings();
    if (settings.cloudSyncUrl) {
      storage.syncToCloud(settings.cloudSyncUrl);
    }
  },

  async syncToCloud(url: string): Promise<boolean> {
    try {
      const settings = storage.getBackupSettings();
      if (!settings.cloudSyncSecret) return false;

      const data = {
        bookings: storage.getBookings(),
        tempBookings: storage.getTempBookings(),
        customers: storage.getCustomers(),
        revenues: storage.getRevenues(),
        expenses: storage.getExpenses(),
        fixedExpenses: storage.getFixedExpenses(),
        tasks: storage.getTasks(),
        offers: storage.getOffers(),
        packages: storage.getPackages(),
        timestamp: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: 'save', 
          secret: settings.cloudSyncSecret,
          payload: data 
        })
      });
      
      console.log('☁️ Secure Cloud Push Executed');
      return true;
    } catch (err) {
      console.error('Cloud Sync failed:', err);
      return false;
    }
  },

  async syncFromCloud(url: string): Promise<boolean> {
    try {
      const settings = storage.getBackupSettings();
      if (!settings.cloudSyncSecret) {
        storage.toast('يرجى ضبط كلمة السر السحابية أولاً', 'error');
        return false;
      }

      storage.toast('جاري جلب البيانات المؤمنة من السحابة...', 'info');
      const response = await fetch(`${url}?secret=${encodeURIComponent(settings.cloudSyncSecret)}`);
      const data = await response.json();
      
      if (data === "UNAUTHORIZED") {
        storage.toast('كلمة السر السحابية غير صحيحة', 'error');
        return false;
      }

      if (data && (data.bookings || data.customers)) {
        await storage.restoreData(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Cloud Fetch failed:', err);
      storage.toast('فشل جلب البيانات. تأكد من الرابط وكلمة السر.', 'error');
      return false;
    }
  },

  async setBackupDirectory(): Promise<boolean> {
    try {
      const handle = await (window as any).showDirectoryPicker();
      await set('shadyBackupDir', handle);
      this.toast('تم تفعيل نظام النسخ الاحتياطي السحابي/المحلي', 'success');
      return true;
    } catch (err: any) {
      console.error('Directory picker failed:', err);
      return false;
    }
  },

  async getBackupDirectory(): Promise<any> {
    return await get('shadyBackupDir');
  },

  async restoreData(data: any): Promise<void> {
    try {
      const promises = [];
      if (data.bookings) promises.push(storage.set(STORAGE_KEYS.BOOKINGS, data.bookings));
      if (data.tempBookings) promises.push(storage.set(STORAGE_KEYS.TEMP_BOOKINGS, data.tempBookings));
      if (data.expiredBookings) promises.push(storage.set(STORAGE_KEYS.EXPIRED_BOOKINGS, data.expiredBookings));
      if (data.cancelledBookings) promises.push(storage.set(STORAGE_KEYS.CANCELLED_BOOKINGS, data.cancelledBookings));
      if (data.postponedBookings) promises.push(storage.set(STORAGE_KEYS.POSTPONED_BOOKINGS, data.postponedBookings));
      if (data.packages) promises.push(storage.set(STORAGE_KEYS.PACKAGES, data.packages));
      if (data.revenues) promises.push(storage.set(STORAGE_KEYS.REVENUES, data.revenues));
      if (data.expenses) promises.push(storage.set(STORAGE_KEYS.EXPENSES, data.expenses));
      if (data.fixedExpenses) promises.push(storage.set(STORAGE_KEYS.FIXED_EXPENSES, data.fixedExpenses));
      if (data.customers) promises.push(storage.set(STORAGE_KEYS.CUSTOMERS, data.customers));
      if (data.tasks) promises.push(storage.set(STORAGE_KEYS.TASKS, data.tasks));
      if (data.offers) promises.push(storage.set(STORAGE_KEYS.OFFERS, data.offers));
      if (data.supplies) promises.push(storage.set(STORAGE_KEYS.SUPPLIES, data.supplies));

      await Promise.all(promises);
      this.toast('تم استعادة البيانات بنجاح', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('Restore failed:', err);
      this.toast('فشل استعادة البيانات', 'error');
    }
  },

  async saveFileToBackup(file: File, fileName: string): Promise<string | null> {
    try {
      const handle = await get('shadyBackupDir');
      if (!handle) return null;

      const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') return null;

      const fileHandle = await (handle as any).getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      
      return fileName;
    } catch (err) {
      console.error('Failed to save file to backup:', err);
      return null;
    }
  }
};
