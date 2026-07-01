import { firestoreData } from './firestoreData';
import { storage } from './storage';
import { Booking, Package, Expense, Revenue, Customer } from '../types';
import { firebaseService } from './firebase';

// Firestore Sync Service
// This service provides bidirectional sync between localStorage and Firestore
// It ensures that changes in either source are reflected in the other

class FirestoreSyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  // Start automatic sync
  startSync(intervalMs: number = 5000): void {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    console.log('🔄 Starting Firestore sync service');
    
    // Initial sync
    this.syncAll();
    
    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMs);
  }

  // Stop automatic sync
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isSyncing = false;
    console.log('🔌 Stopped Firestore sync service');
  }

  // Sync all data from Firestore to localStorage
  async syncAll(): Promise<void> {
    if (!firebaseService.isReady()) {
      console.warn('⚠️ Firebase not ready, skipping sync');
      return;
    }

    try {
      await this.syncBookings();
      await this.syncPackages();
      await this.syncExpenses();
      await this.syncRevenues();
      await this.syncCustomers();
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  }

  // Sync bookings
  private async syncBookings(): Promise<void> {
    try {
      const firestoreBookings = await firestoreData.getBookings();
      const localBookings = storage.getBookings();
      
      // Merge Firestore data into localStorage
      if (firestoreBookings.length > 0) {
        storage.set('shadyBookings', firestoreBookings);
        console.log(`✅ Synced ${firestoreBookings.length} bookings from Firestore`);
      }
    } catch (error) {
      console.error('❌ Failed to sync bookings:', error);
    }
  }

  // Sync packages
  private async syncPackages(): Promise<void> {
    try {
      const firestorePackages = await firestoreData.getPackages();
      
      if (firestorePackages.length > 0) {
        storage.set('shadyPackages', firestorePackages);
        console.log(`✅ Synced ${firestorePackages.length} packages from Firestore`);
      }
    } catch (error) {
      console.error('❌ Failed to sync packages:', error);
    }
  }

  // Sync expenses
  private async syncExpenses(): Promise<void> {
    try {
      const firestoreExpenses = await firestoreData.getExpenses();
      
      if (firestoreExpenses.length > 0) {
        storage.set('shadyAccountsExpenses', firestoreExpenses);
        console.log(`✅ Synced ${firestoreExpenses.length} expenses from Firestore`);
      }
    } catch (error) {
      console.error('❌ Failed to sync expenses:', error);
    }
  }

  // Sync revenues
  private async syncRevenues(): Promise<void> {
    try {
      const firestoreRevenues = await firestoreData.getRevenues();
      
      if (firestoreRevenues.length > 0) {
        storage.set('shadyAccountsRevenues', firestoreRevenues);
        console.log(`✅ Synced ${firestoreRevenues.length} revenues from Firestore`);
      }
    } catch (error) {
      console.error('❌ Failed to sync revenues:', error);
    }
  }

  // Sync customers
  private async syncCustomers(): Promise<void> {
    try {
      const firestoreCustomers = await firestoreData.getCustomers();
      
      if (firestoreCustomers.length > 0) {
        storage.set('shadyCustomers', firestoreCustomers);
        console.log(`✅ Synced ${firestoreCustomers.length} customers from Firestore`);
      }
    } catch (error) {
      console.error('❌ Failed to sync customers:', error);
    }
  }

  // Push local data to Firestore
  async pushLocalDataToFirestore(): Promise<void> {
    if (!firebaseService.isReady()) {
      console.warn('⚠️ Firebase not ready, cannot push data');
      return;
    }

    try {
      const bookings = storage.getBookings();
      const packages = storage.getPackages();
      const expenses = storage.getExpenses();
      const revenues = storage.getRevenues();
      const customers = storage.getCustomers();
      
      await firestoreData.syncAllData(bookings, packages, expenses, revenues, customers);
      console.log('✅ Pushed all local data to Firestore');
    } catch (error) {
      console.error('❌ Failed to push data to Firestore:', error);
    }
  }

  // Subscribe to real-time updates from Firestore
  subscribeToRealtimeUpdates(): void {
    if (!firebaseService.isReady()) {
      console.warn('⚠️ Firebase not ready, cannot subscribe to updates');
      return;
    }

    console.log('👂 Subscribing to real-time Firestore updates');
    
    // Subscribe to bookings
    firestoreData.subscribeToBookings((bookings) => {
      storage.set('shadyBookings', bookings);
      console.log(`📥 Real-time update: ${bookings.length} bookings`);
    });

    // Subscribe to packages
    firestoreData.subscribeToPackages((packages) => {
      storage.set('shadyPackages', packages);
      console.log(`📥 Real-time update: ${packages.length} packages`);
    });

    // Subscribe to expenses
    firestoreData.subscribeToExpenses((expenses) => {
      storage.set('shadyAccountsExpenses', expenses);
      console.log(`📥 Real-time update: ${expenses.length} expenses`);
    });

    // Subscribe to revenues
    firestoreData.subscribeToRevenues((revenues) => {
      storage.set('shadyAccountsRevenues', revenues);
      console.log(`📥 Real-time update: ${revenues.length} revenues`);
    });

    // Subscribe to customers
    firestoreData.subscribeToCustomers((customers) => {
      storage.set('shadyCustomers', customers);
      console.log(`📥 Real-time update: ${customers.length} customers`);
    });
  }

  // Unsubscribe from real-time updates
  unsubscribeFromRealtimeUpdates(): void {
    firestoreData.unsubscribeAll();
    console.log('🔌 Unsubscribed from real-time Firestore updates');
  }
}

export const firestoreSync = new FirestoreSyncService();
