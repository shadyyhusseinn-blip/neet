import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Types
export interface SystemLog {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  userId?: string;
  userEmail?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

export interface Backup {
  id?: string;
  timestamp: Timestamp;
  date: string;
  source: string;
  size: number;
  data: any;
  description: string;
  createdBy?: string;
  status: 'pending' | 'completed' | 'failed';
}

const db = getFirestore();

/**
 * Fetch system logs from the logs collection, ordered by timestamp descending
 * @param logType - Optional filter by log type (info, warning, error, success)
 * @param limit - Optional limit on number of logs to fetch
 * @returns Promise with array of system log documents
 */
export async function fetchSystemLogs(
  logType?: 'info' | 'warning' | 'error' | 'success',
  limit?: number
): Promise<SystemLog[]> {
  try {
    let logsQuery;
    const logsCollection = collection(db, 'logs');

    if (logType) {
      // Filter by log type and order by timestamp descending
      logsQuery = query(
        logsCollection,
        where('type', '==', logType),
        orderBy('timestamp', 'desc')
      );
    } else {
      // No filter, just order by timestamp descending
      logsQuery = query(
        logsCollection,
        orderBy('timestamp', 'desc')
      );
    }

    const querySnapshot = await getDocs(logsQuery);
    const logs: SystemLog[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      logs.push({
        id: doc.id,
        type: data.type || 'info',
        message: data.message || '',
        userId: data.userId,
        userEmail: data.userEmail,
        timestamp: data.timestamp || Timestamp.now(),
        metadata: data.metadata || {}
      });
    });

    // Apply limit if specified
    const limitedLogs = limit ? logs.slice(0, limit) : logs;

    console.log(`Fetched ${limitedLogs.length} logs${logType ? ` with type: ${logType}` : ''}`);
    return limitedLogs;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw new Error('فشل جلب سجلات النظام. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Add a new system log entry
 * @param logData - The log data to add
 * @returns Promise with the created log document ID
 */
export async function addSystemLog(logData: Omit<SystemLog, 'id' | 'timestamp'>): Promise<string> {
  try {
    const logWithTimestamp = {
      ...logData,
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'logs'), logWithTimestamp);
    console.log('System log added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding system log:', error);
    throw new Error('فشل إضافة سجل النظام. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Trigger a backup operation and add a new backup document
 * @param backupData - The backup data to store
 * @param description - Description of the backup
 * @param source - Source of the backup (e.g., 'manual', 'auto')
 * @param createdBy - User who triggered the backup
 * @returns Promise with the created backup document ID
 */
export async function triggerBackup(
  backupData: any,
  description: string,
  source: string = 'manual',
  createdBy?: string
): Promise<string> {
  try {
    // Calculate size of backup data
    const dataSize = JSON.stringify(backupData).length;

    const backupDocument: Omit<Backup, 'id'> = {
      timestamp: Timestamp.now(),
      date: new Date().toISOString(),
      source,
      size: dataSize,
      data: backupData,
      description,
      status: 'completed',
      createdBy
    };

    const docRef = await addDoc(collection(db, 'backups'), backupDocument);
    console.log('Backup created successfully with ID:', docRef.id);
    
    // Add a success log
    await addSystemLog({
      type: 'success',
      message: `Backup completed successfully. Size: ${dataSize} bytes`,
      userId: createdBy,
      metadata: {
        backupId: docRef.id,
        source,
        dataSize
      }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error triggering backup:', error);
    
    // Add an error log
    await addSystemLog({
      type: 'error',
      message: 'Backup operation failed',
      userId: createdBy,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw new Error('فشل إنشاء النسخة الاحتياطية. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Fetch all backups ordered by timestamp descending
 * @param limit - Optional limit on number of backups to fetch
 * @returns Promise with array of backup documents
 */
export async function fetchBackups(limit?: number): Promise<Backup[]> {
  try {
    const backupsCollection = collection(db, 'backups');
    const backupsQuery = query(backupsCollection, orderBy('timestamp', 'desc'));

    const querySnapshot = await getDocs(backupsQuery);
    const backups: Backup[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      backups.push({
        id: doc.id,
        timestamp: data.timestamp || Timestamp.now(),
        date: data.date || '',
        source: data.source || '',
        size: data.size || 0,
        data: data.data || {},
        description: data.description || '',
        createdBy: data.createdBy,
        status: data.status || 'completed'
      });
    });

    // Apply limit if specified
    const limitedBackups = limit ? backups.slice(0, limit) : backups;

    console.log(`Fetched ${limitedBackups.length} backups`);
    return limitedBackups;
  } catch (error) {
    console.error('Error fetching backups:', error);
    throw new Error('فشل جلب النسخ الاحتياطية. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Delete a backup document
 * @param backupId - The ID of the backup to delete
 * @returns Promise<void>
 */
export async function deleteBackup(backupId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const backupRef = doc(db, 'backups', backupId);
    
    await deleteDoc(backupRef);
    console.log('Backup deleted successfully:', backupId);
    
    // Add a log
    await addSystemLog({
      type: 'info',
      message: `Backup deleted: ${backupId}`,
      metadata: { backupId }
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    throw new Error('فشل حذف النسخة الاحتياطية. يرجى المحاولة مرة أخرى.');
  }
}
