import { uploadImage, fileToBase64, deleteImage, getTransformedUrl } from './imagekit';

export interface LimitedUploadResult {
  url: string;
  fileId: string;
  thumbnailUrl: string;
  name: string;
  size: number;
}

/**
 * نظام تخزين محدود للصور - 5GB كحد أقصى
 * يستخدم للتأكد من عمل الموقع قبل شراء مساحة أكبر
 */
export class LimitedStorageService {
  private static instance: LimitedStorageService;
  private readonly MAX_STORAGE_GB = 5;
  private readonly MAX_STORAGE_BYTES = this.MAX_STORAGE_GB * 1024 * 1024 * 1024;
  private currentUsage: number = 0;

  private constructor() {
    this.loadUsageFromStorage();
  }

  static getInstance(): LimitedStorageService {
    if (!LimitedStorageService.instance) {
      LimitedStorageService.instance = new LimitedStorageService();
    }
    return LimitedStorageService.instance;
  }

  /**
   * تحميل الاستخدام الحالي من localStorage
   */
  private loadUsageFromStorage(): void {
    try {
      const saved = localStorage.getItem('storage-usage');
      this.currentUsage = saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      this.currentUsage = 0;
    }
  }

  /**
   * حفظ الاستخدام الحالي في localStorage
   */
  private saveUsageToStorage(): void {
    localStorage.setItem('storage-usage', this.currentUsage.toString());
  }

  /**
   * التحقق من إمكانية رفع الملف
   */
  private canUpload(fileSize: number): boolean {
    return (this.currentUsage + fileSize) <= this.MAX_STORAGE_BYTES;
  }

  /**
   * الحصول على النسبة المئوية للاستخدام
   */
  getUsagePercentage(): number {
    return Math.round((this.currentUsage / this.MAX_STORAGE_BYTES) * 100);
  }

  /**
   * الحصول على المساحة المتبقية بالبايت
   */
  getRemainingSpace(): number {
    return this.MAX_STORAGE_BYTES - this.currentUsage;
  }

  /**
   * الحصول على المساحة المتبقية بالجيجا
   */
  getRemainingSpaceGB(): number {
    return Math.round((this.getRemainingSpace() / 1024 / 1024 / 1024) * 100) / 100;
  }

  /**
   * رفع صورة مع التحقق من المساحة
   */
  async uploadImage(file: File, folder: string = 'temp'): Promise<LimitedUploadResult> {
    // التحقق من حجم الملف
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('حجم الملف كبير جداً. الحد الأقصى 10MB');
    }

    // التحقق من المساحة المتاحة
    if (!this.canUpload(file.size)) {
      throw new Error(`المساحة ممتلئة. المتبقي: ${this.getRemainingSpaceGB()}GB`);
    }

    try {
      const base64 = await fileToBase64(file);
      const fileName = `${Date.now()}_${file.name}`;
      
      const result = await uploadImage(base64, fileName, folder);
      
      // تحديث الاستخدام
      this.currentUsage += result.size;
      this.saveUsageToStorage();
      
      return {
        url: result.url,
        fileId: result.fileId,
        thumbnailUrl: result.thumbnailUrl || result.url,
        name: result.name,
        size: result.size
      };
    } catch (error) {
      console.error('Limited upload error:', error);
      throw new Error('فشل رفع الصورة');
    }
  }

  /**
   * رفع صور متعددة مع التحقق من المساحة الكلية
   */
  async uploadMultipleImages(
    files: File[],
    folder: string = 'temp',
    onProgress?: (progress: number) => void
  ): Promise<LimitedUploadResult[]> {
    const results: LimitedUploadResult[] = [];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // التحقق من المساحة الكلية
    if (!this.canUpload(totalSize)) {
      throw new Error(`المساحة غير كافية للملفات. المتبقي: ${this.getRemainingSpaceGB()}GB`);
    }

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
   * حذف صورة وتحرير المساحة
   */
  async deleteImage(fileId: string, fileSize: number): Promise<void> {
    try {
      await deleteImage(fileId);
      
      // تحرير المساحة
      this.currentUsage = Math.max(0, this.currentUsage - fileSize);
      this.saveUsageToStorage();
    } catch (error) {
      console.error('Delete limited image error:', error);
    }
  }

  /**
   * إعادة تعيين الاستخدام (للاستخدام في حالات الطوارئ)
   */
  resetUsage(): void {
    this.currentUsage = 0;
    this.saveUsageToStorage();
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
}

export const limitedStorage = LimitedStorageService.getInstance();
