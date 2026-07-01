/**
 * Global Error Handler for API
 * معالج أخطاء API الشامل
 */

import { showToast } from '../../shared/ui/toast';
import { logger } from '../logging/logger';

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * معالجة أخطاء API بشكل موحد
 */
export const handleApiError = (error: any) => {
  logger.error('API Error occurred', error, 'apiHandler');

  // إذا كان الخطأ من نوع ApiError
  if (error instanceof ApiError) {
    handleKnownApiError(error);
    return;
  }

  // معالجة أخطاء Firebase
  if (error?.code) {
    handleFirebaseError(error);
    return;
  }

  // معالجة أخطاء الشبكة
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    showToast.error('خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك');
    return;
  }

  // خطأ غير معروف
  showToast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
};

/**
 * معالجة أخطاء Firebase المعروفة
 */
const handleFirebaseError = (error: any) => {
  const firebaseErrorMessages: Record<string, string> = {
    'permission-denied': 'ليس لديك صلاحية للقيام بهذا الإجراء',
    'not-found': 'المورد المطلوب غير موجود',
    'already-exists': 'هذا العنصر موجود بالفعل',
    'invalid-argument': 'بيانات غير صالحة. يرجى التحقق من المدخلات',
    'unauthenticated': 'يجب تسجيل الدخول للقيام بهذا الإجراء',
    'unavailable': 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً',
    'aborted': 'تم إلغاء العملية',
    'deadline-exceeded': 'انتهت مهلة العملية. يرجى المحاولة مرة أخرى',
    'internal': 'حدث خطأ داخلي في الخادم',
    'unknown': 'حدث خطأ غير معروف',
  };

  const message = firebaseErrorMessages[error.code] || error.message || 'حدث خطأ غير متوقع';
  showToast.error(message);
};

/**
 * معالجة أخطاء API المعروفة
 */
const handleKnownApiError = (error: ApiError) => {
  const errorMessages: Record<string, string> = {
    'NETWORK_ERROR': 'خطأ في الاتصال بالإنترنت',
    'TIMEOUT': 'انتهت مهلة الطلب',
    'UNAUTHORIZED': 'غير مصرح. يرجى تسجيل الدخول',
    'FORBIDDEN': 'ممنوع الوصول',
    'NOT_FOUND': 'المورد المطلوب غير موجود',
    'VALIDATION_ERROR': 'بيانات غير صالحة',
    'SERVER_ERROR': 'خطأ في الخادم',
  };

  const message = errorMessages[error.code || ''] || error.message;
  showToast.error(message);
};

/**
 * Wrapper لـ fetch مع معالجة الأخطاء التلقائية
 */
export const fetchWithErrorHandler = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  try {
   logger.info(`Fetching: ${options?.method || 'GET'} ${url}`, null, 'apiHandler');
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || response.statusText,
        errorData.code,
        response.status,
        errorData
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // تحويل خطأ الشبكة إلى ApiError
    if (error instanceof TypeError) {
      throw new ApiError('خطأ في الاتصال بالإنترنت', 'NETWORK_ERROR');
    }
    
    throw error;
  }
};

/**
 * معالج أخطاء React Query
 */
export const queryErrorHandler = (error: any) => {
  handleApiError(error);
};
