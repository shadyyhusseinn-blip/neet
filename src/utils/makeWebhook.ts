import axios, { AxiosError } from 'axios';
import { firebaseService } from '../services/firebase';

interface BookingData {
  packageName?: string;
  totalPrice?: number;
  clientName: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: string;
  location?: string;
  notes?: string;
}

interface WhatsAppSettings {
  adminAlertsEnabled: boolean;
  customerAlertsEnabled: boolean;
  adminMessageTemplate: string;
  customerMessageTemplate: string;
}

interface WebhookEventData {
  type: 'booking' | 'admin_bypass' | 'user_registration' | 'admin_notification' | 'customer_notification';
  timestamp: string;
  data: any;
}

interface MakeWebhookResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Fetch Zapier webhook URL from Firebase
 */
async function getZapierWebhookUrl(): Promise<string | null> {
  try {
    const settings = await firebaseService.getDocument('app_settings', 'config');
    if (settings && settings.zapierWebhookUrl) {
      return settings.zapierWebhookUrl;
    }
    // Default Zapier webhook URL
    return 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';
  } catch (error) {
    console.error('Error fetching Zapier webhook URL:', error);
    // Return default URL as fallback
    return 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';
  }
}

/**
 * Fetch WhatsApp settings from Firebase
 */
async function getWhatsAppSettings(): Promise<WhatsAppSettings | null> {
  try {
    const settings = await firebaseService.getDocument('whatsapp_settings', 'config');
    return settings as WhatsAppSettings;
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    return null;
  }
}

/**
 * Replace placeholders in template with actual values
 */
function replaceTemplatePlaceholders(template: string, data: any): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }
  return result;
}

/**
 * Send event data to Zapier webhook
 * @param eventData - The event information to send
 * @returns Promise with success status and message
 */
export async function sendToMakeWebhook(eventData: WebhookEventData): Promise<MakeWebhookResponse> {
  // Try to get Zapier webhook URL first
  const zapierUrl = await getZapierWebhookUrl();
  const webhookUrl = zapierUrl || import.meta.env.VITE_MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('Webhook URL not configured');
    return {
      success: false,
      message: 'Webhook URL not configured'
    };
  }

  try {
    // Structure the payload for Zapier
    const payload = {
      timestamp: new Date().toISOString(),
      source: 'shady-hussein-website',
      type: eventData.type,
      data: eventData.data
    };

    console.log('Sending to webhook:', JSON.stringify(payload, null, 2));

    // Send to webhook with timeout and retry logic
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShadyHussein-Web/1.0'
      },
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5,
      withCredentials: false // Disable CORS credentials
    });

    console.log('Webhook response:', response.status, response.data);

    return {
      success: true,
      message: 'Data sent successfully to Zapier',
      data: response.data
    };

  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Suppress CORS errors in console
    if (axiosError.message.includes('CORS') || axiosError.message.includes('Network Error')) {
      console.warn('Webhook request blocked by CORS policy - this is expected for cross-origin requests');
      return {
        success: false,
        message: 'Webhook request blocked by browser CORS policy'
      };
    }
    
    console.error('Webhook error:', axiosError.message);

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Make.com webhook error response:', {
        status: axiosError.response.status,
        data: axiosError.response.data,
        headers: axiosError.response.headers
      });

      return {
        success: false,
        message: `Webhook returned error: ${axiosError.response.status} - ${axiosError.response.statusText}`
      };

    } else if (axiosError.request) {
      // The request was made but no response was received
      console.error('Make.com webhook no response:', axiosError.message);

      return {
        success: false,
        message: 'No response from webhook server. Please check your network connection.'
      };

    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Make.com webhook setup error:', axiosError.message);

      return {
        success: false,
        message: `Request setup error: ${axiosError.message}`
      };
    }
  }
}

/**
 * Send booking data to Make.com webhook
 * @param bookingData - The booking information to send
 * @returns Promise with success status and message
 */
export async function sendBookingToWebhook(bookingData: BookingData): Promise<MakeWebhookResponse> {
  return sendToMakeWebhook({
    type: 'booking',
    timestamp: new Date().toISOString(),
    data: {
      client: {
        name: bookingData.clientName,
        phone: bookingData.phone,
        email: bookingData.email || null
      },
      booking: {
        packageName: bookingData.packageName || 'Custom',
        totalPrice: bookingData.totalPrice || 0,
        eventType: bookingData.eventType,
        eventDate: bookingData.eventDate,
        location: bookingData.location || null,
        notes: bookingData.notes || null
      }
    }
  });
}

/**
 * Send admin bypass event to Make.com webhook
 * @param role - The selected role (admin/staff)
 * @returns Promise with success status and message
 */
export async function sendAdminBypassToWebhook(role: string): Promise<MakeWebhookResponse> {
  return sendToMakeWebhook({
    type: 'admin_bypass',
    timestamp: new Date().toISOString(),
    data: {
      role: role,
      action: 'developer_bypass_login',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Send user registration event to Make.com webhook
 * @param userData - The user registration data
 * @returns Promise with success status and message
 */
export async function sendUserRegistrationToWebhook(userData: any): Promise<MakeWebhookResponse> {
  return sendToMakeWebhook({
    type: 'user_registration',
    timestamp: new Date().toISOString(),
    data: {
      email: userData.email,
      role: userData.role || 'viewer',
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Send admin notification for new booking to Make.com webhook
 * @param bookingData - The booking details
 * @returns Promise with success status and message
 */
export async function sendAdminNotificationToWebhook(bookingData: {
  clientName: string;
  phone: string;
  eventDate: string;
  packageName?: string;
  eventType: string;
  location?: string;
  notes?: string;
}): Promise<MakeWebhookResponse> {
  // Fetch WhatsApp settings
  const settings = await getWhatsAppSettings();
  
  // Check if admin alerts are disabled
  if (settings && !settings.adminAlertsEnabled) {
    return {
      success: false,
      message: 'Admin alerts are disabled'
    };
  }

  // Use custom template or default
  const template = settings?.adminMessageTemplate || `حجز جديد! 📸\n\nالعميل: {clientName}\nالهاتف: {phone}\nالتاريخ: {eventDate}\nالباقة: {packageName}\nنوع المناسبة: {eventType}\nالموقع: {location}\nملاحظات: {notes}`;
  
  // Replace placeholders
  const message = replaceTemplatePlaceholders(template, {
    clientName: bookingData.clientName,
    phone: bookingData.phone,
    eventDate: bookingData.eventDate,
    packageName: bookingData.packageName || 'Custom',
    eventType: bookingData.eventType,
    location: bookingData.location || 'غير محدد',
    notes: bookingData.notes || 'لا توجد'
  });

  return sendToMakeWebhook({
    type: 'admin_notification',
    timestamp: new Date().toISOString(),
    data: {
      message: message,
      recipient_phone: bookingData.phone,
      raw: {
        clientName: bookingData.clientName,
        phone: bookingData.phone,
        eventDate: bookingData.eventDate,
        packageName: bookingData.packageName || 'Custom',
        eventType: bookingData.eventType,
        location: bookingData.location || null,
        notes: bookingData.notes || null
      }
    }
  });
}

/**
 * Send customer notification for completed gallery to Make.com webhook
 * @param notificationData - The notification details
 * @returns Promise with success status and message
 */
export async function sendCustomerNotificationToWebhook(notificationData: {
  recipientPhone: string;
  customerName: string;
  galleryLink: string;
  galleryPassword: string;
}): Promise<MakeWebhookResponse> {
  // Fetch WhatsApp settings
  const settings = await getWhatsAppSettings();
  
  // Check if customer alerts are disabled
  if (settings && !settings.customerAlertsEnabled) {
    return {
      success: false,
      message: 'Customer alerts are disabled'
    };
  }

  // Use custom template or default
  const template = settings?.customerMessageTemplate || `مرحباً {customerName}! 🎉\n\nمعرضك جاهز الآن! 📸\n\nرابط المعرض: {galleryLink}\nكلمة المرور: {galleryPassword}\n\nنتمنى لك رؤية ممتعة! ✨`;
  
  // Replace placeholders
  const message = replaceTemplatePlaceholders(template, {
    customerName: notificationData.customerName,
    galleryLink: notificationData.galleryLink,
    galleryPassword: notificationData.galleryPassword
  });

  return sendToMakeWebhook({
    type: 'customer_notification',
    timestamp: new Date().toISOString(),
    data: {
      message: message,
      raw: {
        recipient_phone: notificationData.recipientPhone,
        customer_name: notificationData.customerName,
        gallery_link: notificationData.galleryLink,
        gallery_password: notificationData.galleryPassword
      }
    }
  });
}
