// Unified Upload Service
// Smart routing for uploads: large files/images to Google Drive, small files to Firebase Storage

import { googleDriveService } from './googleDrive';
import { firebaseService } from './firebase';

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  provider: 'google-drive' | 'firebase';
  error?: string;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  compress?: boolean;
  createThumbnail?: boolean;
  folderId?: string; // For Google Drive
  firebasePath?: string; // For Firebase Storage
}

// Configuration thresholds
const CONFIG = {
  // File size thresholds (in bytes)
  FIREBASE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  GOOGLE_DRIVE_MIN_SIZE: 5 * 1024 * 1024, // 5MB
  
  // File types
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov'],
  DOCUMENT_TYPES: ['application/pdf', 'application/docx', 'application/doc'],
  CODE_TYPES: ['text/plain', 'text/javascript', 'text/html', 'text/css', 'application/json'],
  
  // Context-based routing
  GALLERY_FILES: ['gallery', 'client-gallery', 'portfolio'],
  PROFILE_FILES: ['profile', 'avatar'],
  TEMP_FILES: ['temp', 'cache'],
};

export class UnifiedUploadService {
  /**
   * Determine the best storage provider based on file characteristics
   */
  private static determineProvider(file: File, context: string = 'general'): 'google-drive' | 'firebase' {
    const fileSize = file.size;
    
    // Large files (> 5MB) go to Google Drive
    if (fileSize > CONFIG.GOOGLE_DRIVE_MIN_SIZE) {
      return 'google-drive';
    }
    
    // Gallery files go to Google Drive for better organization
    if (CONFIG.GALLERY_FILES.some(ctx => context.includes(ctx))) {
      return 'google-drive';
    }
    
    // Small images and documents go to Firebase Storage
    if (fileSize <= CONFIG.FIREBASE_MAX_SIZE) {
      return 'firebase';
    }
    
    // Default to Google Drive for larger files
    return 'google-drive';
  }
  
  /**
   * Upload file with automatic provider selection
   */
  static async uploadFile(
    file: File,
    options: UploadOptions = {},
    context: string = 'general'
  ): Promise<UploadResult> {
    try {
      const provider = this.determineProvider(file, context);
      
      console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to ${provider}`);
      
      if (provider === 'google-drive') {
        return await this.uploadToGoogleDrive(file, options);
      } else {
        return await this.uploadToFirebase(file, options);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        provider: 'firebase'
      };
    }
  }
  
  /**
   * Upload to Google Drive
   */
  private static async uploadToGoogleDrive(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      if (!options.folderId) {
        throw new Error('folderId is required for Google Drive uploads');
      }
      
      const driveFile = await googleDriveService.uploadFile(
        file,
        options.folderId,
        options.onProgress
      );
      
      return {
        success: true,
        url: driveFile.webContentLink,
        fileId: driveFile.id,
        provider: 'google-drive'
      };
    } catch (error) {
      console.error('Google Drive upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Upload to Firebase Storage
   */
  private static async uploadToFirebase(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      if (!options.firebasePath) {
        throw new Error('firebasePath is required for Firebase uploads');
      }
      
      const url = await firebaseService.uploadFile(options.firebasePath, file);
      
      return {
        success: true,
        url,
        provider: 'firebase'
      };
    } catch (error) {
      console.error('Firebase upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Batch upload multiple files with smart routing
   */
  static async batchUpload(
    files: File[],
    options: UploadOptions = {},
    context: string = 'general'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      // Progress callback for individual file
      const fileProgress = (progress: number) => {
        if (options.onProgress) {
          const overallProgress = ((i + progress / 100) / totalFiles) * 100;
          options.onProgress(overallProgress);
        }
      };
      
      try {
        const result = await this.uploadFile(file, { ...options, onProgress: fileProgress }, context);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
          provider: 'firebase'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Upload with compression (for images)
   */
  static async uploadWithCompression(
    file: File,
    options: UploadOptions = {},
    context: string = 'general'
  ): Promise<UploadResult> {
    const provider = this.determineProvider(file, context);
    
    // Only compress if going to Google Drive and it's an image
    if (provider === 'google-drive' && CONFIG.IMAGE_TYPES.includes(file.type)) {
      options.compress = true;
      options.createThumbnail = true;
    }
    
    return await this.uploadFile(file, options, context);
  }
  
  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    googleDrive: { connected: boolean; usedSpace?: number };
    firebase: { connected: boolean };
  }> {
    const googleDriveConnected = await googleDriveService.isAuthenticated();
    
    return {
      googleDrive: {
        connected: googleDriveConnected
      },
      firebase: {
        connected: firebaseService.isReady()
      }
    };
  }
}

export const unifiedUploadService = UnifiedUploadService;
