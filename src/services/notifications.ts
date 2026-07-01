import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { firebaseService } from './firebase';

class NotificationService {
  private messaging: any = null;
  private fcmToken: string | null = null;

  async initialize(): Promise<void> {
    try {
      if (!firebaseService.isReady()) {
        await firebaseService.initialize();
      }

      this.messaging = getMessaging(firebaseService.getDB().app);

      // Request permission for notifications
      const permission = await this.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        await this.getFCMToken();
      } else {
        console.warn('⚠️ Notification permission denied');
      }

      // Listen for incoming messages
      this.listenForMessages();
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Messaging not initialized');
        return null;
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      this.fcmToken = await getToken(this.messaging, {
        vapidKey: vapidKey,
      });

      if (this.fcmToken) {
        console.log('✅ FCM token obtained:', this.fcmToken);
        // TODO: Send token to server
        await this.sendTokenToServer(this.fcmToken);
      }

      return this.fcmToken;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    // TODO: Implement token sending to server
    console.log('Sending token to server:', token);
  }

  private listenForMessages(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('📨 Received message:', payload);
      this.showNotification(payload);
    });
  }

  private showNotification(payload: MessagePayload): void {
    const notificationTitle = payload.notification?.title || 'إشعار جديد';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/icon-192.png',
      data: payload.data,
    };

    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    // This should be called from server-side using Firebase Admin SDK
    // Client-side cannot send push notifications directly
    console.warn('⚠️ Push notifications must be sent from server-side');
    return false;
  }

  getCurrentToken(): string | null {
    return this.fcmToken;
  }
}

export const notificationService = new NotificationService();
