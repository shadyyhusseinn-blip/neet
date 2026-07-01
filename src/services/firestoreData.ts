import { Booking, Package, Expense, Revenue, Customer, User, UserRole, Gallery, GalleryPhoto, Review } from '../types';
import { firebaseService } from './firebase';

class FirestoreDataService {
  private db = () => firebaseService.getDB();

  getDB() {
    return firebaseService.getDB();
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return firebaseService.getCollection('bookings');
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return firebaseService.getDocument('bookings', id);
  }

  async saveBooking(booking: Booking): Promise<boolean> {
    try {
      await firebaseService.setDocument('bookings', booking.id, booking);
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      return false;
    }
  }

  async updateBooking(booking: Booking): Promise<boolean> {
    try {
      await firebaseService.updateDocument('bookings', booking.id, booking);
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      return false;
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('bookings', id);
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }

  subscribeToBookings(callback: (bookings: Booking[]) => void): any {
    return firebaseService.onCollectionSnapshot('bookings', callback);
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    return firebaseService.getCollection('packages');
  }

  async savePackage(pkg: Package): Promise<boolean> {
    try {
      await firebaseService.setDocument('packages', pkg.id, pkg);
      return true;
    } catch (error) {
      console.error('Error saving package:', error);
      return false;
    }
  }

  async deletePackage(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('packages', id);
      return true;
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  }

  subscribeToPackages(callback: (packages: Package[]) => void): any {
    return firebaseService.onCollectionSnapshot('packages', callback);
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return firebaseService.getCollection('expenses');
  }

  async saveExpense(expense: Expense): Promise<boolean> {
    try {
      await firebaseService.setDocument('expenses', expense.id, expense);
      return true;
    } catch (error) {
      console.error('Error saving expense:', error);
      return false;
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('expenses', id);
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  subscribeToExpenses(callback: (expenses: Expense[]) => void): any {
    return firebaseService.onCollectionSnapshot('expenses', callback);
  }

  // Revenues
  async getRevenues(): Promise<Revenue[]> {
    return firebaseService.getCollection('revenues');
  }

  async saveRevenue(revenue: Revenue): Promise<boolean> {
    try {
      await firebaseService.setDocument('revenues', revenue.id, revenue);
      return true;
    } catch (error) {
      console.error('Error saving revenue:', error);
      return false;
    }
  }

  async deleteRevenue(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('revenues', id);
      return true;
    } catch (error) {
      console.error('Error deleting revenue:', error);
      return false;
    }
  }

  subscribeToRevenues(callback: (revenues: Revenue[]) => void): any {
    return firebaseService.onCollectionSnapshot('revenues', callback);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return firebaseService.getCollection('customers');
  }

  async saveCustomer(customer: Customer): Promise<boolean> {
    try {
      await firebaseService.setDocument('customers', customer.id, customer);
      return true;
    } catch (error) {
      console.error('Error saving customer:', error);
      return false;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('customers', id);
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  subscribeToCustomers(callback: (customers: Customer[]) => void): any {
    return firebaseService.onCollectionSnapshot('customers', callback);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return firebaseService.getCollection('users');
  }

  async getUserById(id: string): Promise<User | null> {
    return firebaseService.getDocument('users', id);
  }

  async forceLogoutUser(userId: string): Promise<boolean> {
    try {
      await firebaseService.updateDocument('users', userId, { forceLogout: true });
      return true;
    } catch (error) {
      console.error('Error force logging out user:', error);
      return false;
    }
  }

  async resetForceLogout(userId: string): Promise<boolean> {
    try {
      await firebaseService.updateDocument('users', userId, { forceLogout: false });
      return true;
    } catch (error) {
      console.error('Error resetting force logout:', error);
      return false;
    }
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = await firebaseService.queryCollection('users', 'phone', '==', phone);
    return users.length > 0 ? users[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await firebaseService.queryCollection('users', 'username', '==', username);
    return users.length > 0 ? users[0] : null;
  }

  async saveUser(user: User): Promise<boolean> {
    try {
      await firebaseService.setDocument('users', user.id, user);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      await firebaseService.updateDocument('users', userId, { role });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async toggleUserBlock(userId: string, isBlocked: boolean): Promise<boolean> {
    try {
      await firebaseService.updateDocument('users', userId, { isBlocked });
      return true;
    } catch (error) {
      console.error('Error toggling user block:', error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('users', id);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  subscribeToUsers(callback: (users: User[]) => void): any {
    return firebaseService.onCollectionSnapshot('users', callback);
  }

  // Galleries
  async getGalleries(): Promise<Gallery[]> {
    return firebaseService.getCollection('galleries');
  }

  async getGalleryById(id: string): Promise<Gallery | null> {
    return firebaseService.getDocument('galleries', id);
  }

  async saveGallery(gallery: Gallery): Promise<boolean> {
    try {
      await firebaseService.setDocument('galleries', gallery.id, gallery);
      return true;
    } catch (error) {
      console.error('Error saving gallery:', error);
      return false;
    }
  }

  async deleteGallery(id: string): Promise<boolean> {
    try {
      await firebaseService.deleteDocument('galleries', id);
      return true;
    } catch (error) {
      console.error('Error deleting gallery:', error);
      return false;
    }
  }

  subscribeToGalleries(callback: (galleries: Gallery[]) => void): any {
    return firebaseService.onCollectionSnapshot('galleries', callback);
  }

  // Utility methods
  async syncAllData(bookings: Booking[], packages: Package[], expenses: Expense[], revenues: Revenue[], customers: Customer[]): Promise<void> {
    // Batch sync all data to Firestore
    const promises = [
      ...bookings.map(b => this.saveBooking(b)),
      ...packages.map(p => this.savePackage(p)),
      ...expenses.map(e => this.saveExpense(e)),
      ...revenues.map(r => this.saveRevenue(r)),
      ...customers.map(c => this.saveCustomer(c))
    ];
    await Promise.all(promises);
  }

  async logActivity(action: string, details: any): Promise<boolean> {
    try {
      const activity = {
        id: Date.now().toString(),
        action,
        details,
        timestamp: new Date().toISOString(),
        deviceName: navigator.userAgent
      };
      await firebaseService.setDocument('activity_log', activity.id, activity);
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  unsubscribeAll(): void {
    // Unsubscribe from all real-time listeners
    // This would need to track all unsubscribe functions
  }

  unsubscribe(key: string): void {
    // Unsubscribe from a specific listener by key
  }

  extractDriveFolderId(): string | null {
    return null;
  }

  convertToDirectUrl(): string {
    return '';
  }

  async addReview(): Promise<boolean> {
    return false;
  }

  async getPageContent(): Promise<any> {
    return null;
  }

  async savePageContent(): Promise<boolean> {
    return false;
  }

  subscribeToPageContent(): any {
    return () => {};
  }
}

export const firestoreData = new FirestoreDataService();
