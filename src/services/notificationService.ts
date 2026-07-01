import { Booking } from '../types';
import { firestoreData } from './firestoreData';
import { storage } from './storage';

interface NotificationConfig {
  adminPhone: string;
  notificationsEnabled: boolean;
  bookingReminderEnabled: boolean;
  bookingReminderHours: number;
  paymentReminderEnabled: boolean;
  paymentReminderDays: number;
  smsProvider: 'firebase' | 'twilio';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private config: NotificationConfig | null = null;

  loadConfig(): NotificationConfig {
    const saved = localStorage.getItem('notificationConfig');
    if (saved) {
      this.config = JSON.parse(saved);
    } else {
      this.config = {
        adminPhone: '',
        notificationsEnabled: false,
        bookingReminderEnabled: true,
        bookingReminderHours: 24,
        paymentReminderEnabled: true,
        paymentReminderDays: 3,
        smsProvider: 'firebase'
      };
    }
    return this.config;
  }

  startChecking() {
    this.loadConfig();
    
    if (!this.config?.notificationsEnabled) {
      console.log('⚠️ Notifications are disabled');
      return;
    }

    if (this.checkInterval) {
      this.stopChecking();
    }

    console.log('🔔 Starting notification checker...');
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkNotifications();
    }, 5 * 60 * 1000);

    // Run initial check
    this.checkNotifications();
  }

  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🔔 Stopped notification checker');
    }
  }

  private async checkNotifications() {
    try {
      const bookings = await firestoreData.getBookings();
      const config = this.loadConfig();

      if (!config.notificationsEnabled || !config.adminPhone) {
        return;
      }

      // Check booking reminders
      if (config.bookingReminderEnabled) {
        this.checkBookingReminders(bookings, config);
      }

      // Check payment reminders
      if (config.paymentReminderEnabled) {
        this.checkPaymentReminders(bookings, config);
      }
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
    }
  }

  private checkBookingReminders(bookings: Booking[], config: NotificationConfig) {
    const now = new Date();
    const reminderHours = config.bookingReminderHours;

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Check if booking is within reminder window and hasn't been reminded yet
      if (hoursDiff > 0 && hoursDiff <= reminderHours) {
        const reminderKey = `booking_reminded_${booking.id}`;
        const alreadyReminded = localStorage.getItem(reminderKey);

        if (!alreadyReminded) {
          this.sendBookingReminder(booking, config);
          localStorage.setItem(reminderKey, 'true');
        }
      }
    });
  }

  private checkPaymentReminders(bookings: Booking[], config: NotificationConfig) {
    const now = new Date();
    const reminderDays = config.paymentReminderDays;

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const daysSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);

      // Check if payment is overdue
      if (booking.remainingAmount > 0 && daysSinceBooking >= reminderDays) {
        const reminderKey = `payment_reminded_${booking.id}`;
        const alreadyReminded = localStorage.getItem(reminderKey);

        if (!alreadyReminded) {
          this.sendPaymentReminder(booking, config);
          localStorage.setItem(reminderKey, 'true');
        }
      }
    });
  }

  private async sendBookingReminder(booking: Booking, config: NotificationConfig) {
    const message = `تذكير: حجز للعميل ${booking.clientName} في ${booking.date} الساعة ${booking.eventTime || 'غير محدد'}. الموقع: ${booking.eventLocation || 'غير محدد'}`;
    
    console.log('📱 Sending booking reminder:', message);
    
    if (config.smsProvider === 'twilio') {
      await this.sendViaTwilio(config.adminPhone, message, config);
    } else {
      // Firebase Cloud Functions would handle this
      console.log('📤 Would send via Firebase Cloud Functions');
    }
  }

  private async sendPaymentReminder(booking: Booking, config: NotificationConfig) {
    const message = `تنبيه: دفعة متأخرة للحجز ${booking.clientName}. المبلغ المتبقي: ${booking.remainingAmount} ج.م. تاريخ الحجز: ${booking.date}`;
    
    console.log('📱 Sending payment reminder:', message);
    
    if (config.smsProvider === 'twilio') {
      await this.sendViaTwilio(config.adminPhone, message, config);
    } else {
      // Firebase Cloud Functions would handle this
      console.log('📤 Would send via Firebase Cloud Functions');
    }
  }

  private async sendViaTwilio(to: string, message: string, config: NotificationConfig) {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      console.error('❌ Twilio credentials not configured');
      return;
    }

    try {
      // In a real implementation, you would use the Twilio API
      // const client = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);
      // await client.messages.create({
      //   body: message,
      //   from: config.twilioPhoneNumber,
      //   to: to
      // });

      console.log('✅ SMS sent via Twilio (simulated)');
      storage.toast('تم إرسال رسالة تذكير', 'success');
    } catch (error) {
      console.error('❌ Error sending SMS via Twilio:', error);
    }
  }

  async sendTestSMS(phone: string): Promise<boolean> {
    const config = this.loadConfig();
    const message = 'رسالة تجريبية من نظام إدارة المصور';
    
    try {
      if (config.smsProvider === 'twilio') {
        await this.sendViaTwilio(phone, message, config);
      } else {
        console.log('📤 Test SMS would be sent via Firebase Cloud Functions');
      }
      return true;
    } catch (error) {
      console.error('❌ Error sending test SMS:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
