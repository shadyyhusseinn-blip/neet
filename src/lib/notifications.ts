import { supabase } from './supabase';

export interface NotificationData {
  client_id: string;
  client_email: string;
  client_name: string;
  gallery_id?: string;
  delivery_id?: string;
  type: 'gallery_ready' | 'photos_ready' | 'delivery_ready' | 'payment_reminder';
  message: string;
}

export const sendNotification = async (data: NotificationData) => {
  try {
    // Save notification to database
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        client_id: data.client_id,
        client_email: data.client_email,
        client_name: data.client_name,
        gallery_id: data.gallery_id,
        delivery_id: data.delivery_id,
        type: data.type,
        message: data.message,
        read: false,
        created_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    // In a real application, you would also send an email here
    // using a service like SendGrid, AWS SES, or Firebase Cloud Messaging
    
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
};

export const sendGalleryReadyNotification = async (
  clientEmail: string,
  clientName: string,
  galleryName: string,
  gallerySlug: string
) => {
  const message = `مرحباً ${clientName}، معرضك "${galleryName}" جاهز الآن! يمكنك رؤيته على الرابط: https://photography-shady-program.web.app/g/${gallerySlug}`;
  
  return sendNotification({
    client_id: gallerySlug,
    client_email: clientEmail,
    client_name: clientName,
    gallery_id: gallerySlug,
    type: 'gallery_ready',
    message
  });
};

export const sendDeliveryReadyNotification = async (
  clientEmail: string,
  clientName: string,
  deliveryTitle: string
) => {
  const message = `مرحباً ${clientName}، صورك من "${deliveryTitle}" جاهزة الآن! يمكنك الدخول لتحميلها.`;
  
  return sendNotification({
    client_id: deliveryTitle,
    client_email: clientEmail,
    client_name: clientName,
    delivery_id: deliveryTitle,
    type: 'delivery_ready',
    message
  });
};
