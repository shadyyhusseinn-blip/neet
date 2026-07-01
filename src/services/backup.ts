// Backup & Restore Service

export interface BackupConfig {
  autoBackup: boolean;
  backupInterval: number; // in hours
  maxBackups: number;
  encryptionEnabled: boolean;
  cloudBackup: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  size: number;
  type: 'full' | 'incremental';
  description: string;
  checksum: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: any;
}

export class BackupService {
  private static config: BackupConfig = {
    autoBackup: true,
    backupInterval: 24, // 24 hours
    maxBackups: 10,
    encryptionEnabled: true,
    cloudBackup: false,
  };

  private static backupIntervalId: number | null = null;

  // Initialize backup service
  static initialize(): void {
    if (this.config.autoBackup) {
      this.startAutoBackup();
    }
  }

  // Start automatic backup
  static startAutoBackup(): void {
    this.stopAutoBackup();
    this.backupIntervalId = window.setInterval(() => {
      this.createBackup('auto', 'نسخ احتياطي تلقائي');
    }, this.config.backupInterval * 60 * 60 * 1000);
  }

  // Stop automatic backup
  static stopAutoBackup(): void {
    if (this.backupIntervalId) {
      clearInterval(this.backupIntervalId);
      this.backupIntervalId = null;
    }
  }

  // Create backup
  static async createBackup(
    type: 'manual' | 'auto' | 'scheduled',
    description: string
  ): Promise<BackupMetadata> {
    try {
      // Collect all data
      const data = await this.collectData();

      // Create metadata
      const metadata: BackupMetadata = {
        id: this.generateBackupId(),
        timestamp: Date.now(),
        size: JSON.stringify(data).length,
        type: type === 'auto' ? 'incremental' : 'full',
        description,
        checksum: this.calculateChecksum(data),
      };

      // Create backup object
      const backup: BackupData = {
        metadata,
        data,
      };

      // Encrypt if enabled
      let backupToStore = backup;
      if (this.config.encryptionEnabled) {
        backupToStore = this.encryptBackup(backup);
      }

      // Store backup
      await this.storeBackup(backupToStore);

      // Clean old backups
      await this.cleanOldBackups();

      // Log backup
      console.log('Backup created:', metadata);

      return metadata;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  // Collect all application data
  private static async collectData(): Promise<any> {
    const data: any = {};

    // Collect localStorage data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('backup_')) {
        data[key] = localStorage.getItem(key);
      }
    }

    // Collect sessionStorage data
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        data[`session_${key}`] = sessionStorage.getItem(key);
      }
    }

    // Collect IndexedDB data (if any)
    // This would require additional implementation

    return data;
  }

  // Generate backup ID
  private static generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate checksum
  private static calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // Encrypt backup
  private static encryptBackup(backup: BackupData): BackupData {
    const encryptionKey = this.getEncryptionKey();
    const encryptedData = this.encrypt(JSON.stringify(backup.data), encryptionKey);
    
    return {
      ...backup,
      data: encryptedData,
    };
  }

  // Decrypt backup
  private static decryptBackup(backup: BackupData): BackupData {
    const encryptionKey = this.getEncryptionKey();
    const decryptedData = this.decrypt(backup.data as string, encryptionKey);
    
    return {
      ...backup,
      data: JSON.parse(decryptedData),
    };
  }

  // Simple encryption (XOR - use proper encryption in production)
  private static encrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }

  // Simple decryption
  private static decrypt(encrypted: string, key: string): string {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  // Get encryption key
  private static getEncryptionKey(): string {
    // In production, this should be a secure key from the server
    return 'backup-encryption-key-change-in-production';
  }

  // Store backup
  private static async storeBackup(backup: BackupData): Promise<void> {
    const key = `backup_${backup.metadata.id}`;
    localStorage.setItem(key, JSON.stringify(backup));

    // If cloud backup is enabled, upload to cloud
    if (this.config.cloudBackup) {
      await this.uploadToCloud(backup);
    }
  }

  // Upload backup to cloud
  private static async uploadToCloud(backup: BackupData): Promise<void> {
    // In production, this would upload to AWS S3, Google Drive, etc.
    console.log('Uploading backup to cloud:', backup.metadata.id);
  }

  // Clean old backups
  private static async cleanOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    
    if (backups.length > this.config.maxBackups) {
      // Sort by timestamp (oldest first)
      backups.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest backups
      const toRemove = backups.slice(0, backups.length - this.config.maxBackups);
      
      for (const backup of toRemove) {
        await this.deleteBackup(backup.id);
      }
    }
  }

  // List all backups
  static async listBackups(): Promise<BackupMetadata[]> {
    const backups: BackupMetadata[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('backup_')) {
        try {
          const backupStr = localStorage.getItem(key);
          if (backupStr) {
            const backup: BackupData = JSON.parse(backupStr);
            backups.push(backup.metadata);
          }
        } catch (error) {
          console.error('Error parsing backup:', key, error);
        }
      }
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => b.timestamp - a.timestamp);

    return backups;
  }

  // Restore from backup
  static async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const key = `backup_${backupId}`;
      const backupStr = localStorage.getItem(key);

      if (!backupStr) {
        throw new Error('Backup not found');
      }

      let backup: BackupData = JSON.parse(backupStr);

      // Decrypt if encrypted
      if (this.config.encryptionEnabled) {
        backup = this.decryptBackup(backup);
      }

      // Verify checksum
      const currentChecksum = this.calculateChecksum(backup.data);
      if (currentChecksum !== backup.metadata.checksum) {
        throw new Error('Backup checksum mismatch');
      }

      // Restore data
      await this.restoreData(backup.data);

      console.log('Backup restored:', backup.metadata);

      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  // Restore data
  private static async restoreData(data: any): Promise<void> {
    // Clear existing data (except backups)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('backup_')) {
        localStorage.removeItem(key);
      }
    }

    // Restore data
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('session_')) {
        const sessionKey = key.replace('session_', '');
        sessionStorage.setItem(sessionKey, value as string);
      } else {
        localStorage.setItem(key, value as string);
      }
    }
  }

  // Delete backup
  static async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const key = `backup_${backupId}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Delete backup failed:', error);
      return false;
    }
  }

  // Download backup as file
  static async downloadBackup(backupId: string): Promise<void> {
    try {
      const key = `backup_${backupId}`;
      const backupStr = localStorage.getItem(key);

      if (!backupStr) {
        throw new Error('Backup not found');
      }

      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backupId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download backup failed:', error);
      throw error;
    }
  }

  // Upload backup from file
  static async uploadBackup(file: File): Promise<BackupMetadata> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupStr = e.target?.result as string;
          const backup: BackupData = JSON.parse(backupStr);
          
          // Store backup
          await this.storeBackup(backup);
          
          resolve(backup.metadata);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Get backup statistics
  static async getBackupStatistics(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: BackupMetadata | null;
    newestBackup: BackupMetadata | null;
  }> {
    const backups = await this.listBackups();
    
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1] : null,
      newestBackup: backups.length > 0 ? backups[0] : null,
    };
  }

  // Update configuration
  static updateConfig(config: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart auto backup if interval changed
    if (config.backupInterval && this.config.autoBackup) {
      this.startAutoBackup();
    }
  }

  // Get configuration
  static getConfig(): BackupConfig {
    return { ...this.config };
  }
}

export const backupService = BackupService;
