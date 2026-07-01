import { toast } from 'sonner';

/**
 * موحد للإشعارات (Toast Notifications)
 * يستخدم مكتبة sonner لعرض الإشعارات بشكل جميل ومتسق
 */
export const showToast = {
  /**
   * عرض إشعار نجاح
   * @param message - رسالة النجاح
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
    });
  },

  /**
   * عرض إشعار خطأ
   * @param message - رسالة الخطأ
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-center',
    });
  },

  /**
   * عرض إشعار تحذير
   * @param message - رسالة التحذير
   */
  warning: (message: string) => {
    toast.warning(message, {
      duration: 4000,
      position: 'top-center',
    });
  },

  /**
   * عرض إشعار معلومات
   * @param message - رسالة المعلومات
   */
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      position: 'top-center',
    });
  },

  /**
   * عرض إشعار مخصص
   * @param message - الرسالة
   * @param type - النوع (success, error, warning, info)
   * @param options - خيارات إضافية
   */
  custom: (message: string, type: 'success' | 'error' | 'warning' | 'info', options?: any) => {
    toast[type](message, {
      duration: 3000,
      position: 'top-center',
      ...options,
    });
  },
};

/**
 * معالج أخطاء API الموحد
 * يعرض رسائل خطأ واضحة بناءً على نوع الخطأ
 */
export const handleApiError = (error: any) => {
  console.error('API Error:', error);

  if (error?.code === 'permission-denied') {
    showToast.error('ليس لديك صلاحية للقيام بهذا الإجراء');
  } else if (error?.code === 'not-found') {
    showToast.error('المورد المطلوب غير موجود');
  } else if (error?.code === 'network-error' || error?.code === 'unavailable') {
    showToast.error('خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك');
  } else if (error?.code === 'already-exists') {
    showToast.error('هذا العنصر موجود بالفعل');
  } else if (error?.code === 'invalid-argument') {
    showToast.error('بيانات غير صالحة. يرجى التحقق من المدخلات');
  } else if (error?.code === 'unauthenticated') {
    showToast.error('يجب تسجيل الدخول للقيام بهذا الإجراء');
  } else if (error?.message) {
    showToast.error(error.message);
  } else {
    showToast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
  }
};
