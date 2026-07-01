import { firebaseService } from './firebase';
import { firestoreData } from './firestoreData';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineSyncService {
  private pendingOperations: PendingOperation[] = [];
  private isSyncing = false;
  private maxRetries = 3;
  private syncedDataHashes: Map<string, string> = new Map(); // Track synced data hashes to avoid duplicates

  constructor() {
    this.loadPendingOperations();
    this.setupSyncOnConnect();
  }

  private loadPendingOperations() {
    try {
      const stored = localStorage.getItem('pendingOperations');
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
        console.log(`📦 Loaded ${this.pendingOperations.length} pending operations`);
      }
    } catch (error) {
      console.error('❌ Failed to load pending operations:', error);
    }
  }

  private savePendingOperations() {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('❌ Failed to save pending operations:', error);
    }
  }

  private setupSyncOnConnect() {
    // Listen for Firebase connection events
    window.addEventListener('firebase-connected', () => {
      console.log('🔗 Firebase connected, syncing pending operations...');
      this.syncPendingOperations();
    });

    // Also check periodically
    setInterval(() => {
      if (firebaseService.isReady() && this.pendingOperations.length > 0 && !this.isSyncing) {
        this.syncPendingOperations();
      }
    }, 30000); // Check every 30 seconds
  }

  addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) {
    // Generate a hash for the operation to avoid duplicates
    const dataHash = this.generateDataHash(operation.collection, operation.data.id, operation.type);
    
    // Check if this operation was already synced recently
    if (this.syncedDataHashes.has(dataHash)) {
      console.log(`⏭️ Skipping duplicate operation: ${operation.type} on ${operation.collection}`);
      return;
    }

    const pendingOp: PendingOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingOperations.push(pendingOp);
    this.savePendingOperations();
    console.log(`📝 Added pending operation: ${operation.type} on ${operation.collection}`);

    // Try to sync immediately if Firebase is ready
    if (firebaseService.isReady() && !this.isSyncing) {
      this.syncPendingOperations();
    }
  }

  private generateDataHash(collection: string, id: string, type: string): string {
    return `${collection}:${id}:${type}`;
  }

  async syncPendingOperations() {
    if (this.isSyncing || this.pendingOperations.length === 0 || !firebaseService.isReady()) {
      return;
    }

    this.isSyncing = true;
    console.log(`🔄 Syncing ${this.pendingOperations.length} pending operations...`);

    const operationsToRetry: PendingOperation[] = [];

    for (const operation of this.pendingOperations) {
      try {
        const success = await this.executeOperation(operation);
        if (success) {
          console.log(`✅ Synced operation: ${operation.type} on ${operation.collection}`);
          // Mark as synced to avoid duplicates
          const dataHash = this.generateDataHash(operation.collection, operation.data.id, operation.type);
          this.syncedDataHashes.set(dataHash, Date.now().toString());
        } else {
          operation.retryCount++;
          if (operation.retryCount < this.maxRetries) {
            operationsToRetry.push(operation);
            console.log(`⚠️ Operation failed, will retry (${operation.retryCount}/${this.maxRetries}): ${operation.type}`);
          } else {
            console.error(`❌ Operation failed after ${this.maxRetries} retries: ${operation.type}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error executing operation:`, error);
        operation.retryCount++;
        if (operation.retryCount < this.maxRetries) {
          operationsToRetry.push(operation);
        }
      }
    }

    this.pendingOperations = operationsToRetry;
    this.savePendingOperations();
    this.isSyncing = false;

    console.log(`🔄 Sync complete. ${operationsToRetry.length} operations remaining`);
  }

  private async executeOperation(operation: PendingOperation): Promise<boolean> {
    const { type, collection, data } = operation;

    switch (collection) {
      case 'bookings':
        if (type === 'create') {
          return await firestoreData.saveBooking(data);
        } else if (type === 'update') {
          return await firestoreData.updateBooking(data);
        } else if (type === 'delete') {
          return await firestoreData.deleteBooking(data.id);
        }
        break;

      case 'packages':
        if (type === 'create' || type === 'update') {
          return await firestoreData.savePackage(data);
        } else if (type === 'delete') {
          return await firestoreData.deletePackage(data.id);
        }
        break;

      case 'expenses':
        if (type === 'create' || type === 'update') {
          return await firestoreData.saveExpense(data);
        } else if (type === 'delete') {
          return await firestoreData.deleteExpense(data.id);
        }
        break;

      case 'revenues':
        if (type === 'create' || type === 'update') {
          return await firestoreData.saveRevenue(data);
        } else if (type === 'delete') {
          return await firestoreData.deleteRevenue(data.id);
        }
        break;

      case 'customers':
        if (type === 'create' || type === 'update') {
          return await firestoreData.saveCustomer(data);
        } else if (type === 'delete') {
          return await firestoreData.deleteCustomer(data.id);
        }
        break;

      default:
        console.warn(`⚠️ Unknown collection: ${collection}`);
        return false;
    }

    return false;
  }

  clearPendingOperations() {
    this.pendingOperations = [];
    this.savePendingOperations();
    console.log('🗑️ Cleared all pending operations');
  }

  getPendingCount(): number {
    return this.pendingOperations.length;
  }
}

export const offlineSync = new OfflineSyncService();
