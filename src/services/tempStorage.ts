import { uploadImage, fileToBase64, deleteImage, getTransformedUrl } from './imagekit';

export interface TempUploadResult {
  url: string;
  fileId: string;
  thumbnailUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

/**
 * نظام تخزين مؤقت للصور باستخدام ImageKit
 * يستخدم كحل مؤقت إلى حين تفعيل Firebase Storage
 * مجاني حتى 20GB شهرياً
 */
export class TempStorageService {
  private static instance: TempStorageService;

  private constructor() {}

  static getInstance(): TempStorageService {
    if (!TempStorageService.instance) {
      TempStorageService.instance = new TempStorageService();
    }
    return TempStorageService.instance;
  }

  /**
   * رفع صورة مؤقتة
   */
  async uploadImage(file: File, folder: string = 'temp'): Promise<TempUploadResult> {
    try {
      const base64 = await fileToBase64(file);
      const fileName = `${Date.now()}_${file.name}`;
      
      const result = await uploadImage(base64, fileName, folder);
      
      return {
        url: result.url,
        fileId: result.fileId,
        thumbnailUrl: result.thumbnailUrl || result.url,
        name: result.name,
        size: result.size,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Temp upload error:', error);
      throw new Error('فشل رفع الصورة المؤقتة');
    }
  }

  /**
   * رفع صور متعددة مؤقتاً
   */
  async uploadMultipleImages(
    files: File[],
    folder: string = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<TempUploadResult[]> {
    const results: TempUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i], folder);
      results.push(result);
      
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }
    
    return results;
  }

  /**
   * حذف صورة مؤقتة
   */
  async deleteImage(fileId: string): Promise<void> {
    try {
      await deleteImage(fileId);
    } catch (error) {
      console.error('Delete temp image error:', error);
    }
  }

  /**
   * الحصول على رابط معاينة
   */
  getPreviewUrl(url: string, width: number = 800, quality: number = 80): string {
    if (url.includes('imagekit.io')) {
      return getTransformedUrl(url, [{ w: width, q: quality }]);
    }
    return url;
  }

  /**
   * الحصول على رابط مصغر
   */
  getThumbnailUrl(url: string, width: number = 300, quality: number = 70): string {
    if (url.includes('imagekit.io')) {
      return getTransformedUrl(url, [{ w: width, q: quality }]);
    }
    return url;
  }

  /**
   * الحصول على رابط بالجودة الأصلية
   */
  getOriginalUrl(url: string): string {
    return url;
  }
}

export const tempStorage = TempStorageService.getInstance();
