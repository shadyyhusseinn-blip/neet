// Booking Confirmation Service
// Automatic SMS and Email confirmation for bookings

import { SendGridService } from './SendGridService';

interface BookingDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  package: string;
  price: number;
  location: string;
}

export class BookingConfirmationService {
  private static instance: BookingConfirmationService;
  private sendGridService: SendGridService;
  private smsService: any; // Would integrate with Twilio or similar

  private constructor() {
    this.sendGridService = new SendGridService(process.env.REACT_APP_SENDGRID_API_KEY || '');
  }

  static getInstance(): BookingConfirmationService {
    if (!BookingConfirmationService.instance) {
      BookingConfirmationService.instance = new BookingConfirmationService();
    }
    return BookingConfirmationService.instance;
  }

  async sendConfirmation(booking: BookingDetails): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    try {
      // Send Email Confirmation
      await this.sendEmailConfirmation(booking);
      results.email = true;
    } catch (error) {
      console.error('Failed to send email confirmation:', error);
    }

    try {
      // Send SMS Confirmation
      await this.sendSMSConfirmation(booking);
      results.sms = true;
    } catch (error) {
      console.error('Failed to send SMS confirmation:', error);
    }

    return results;
  }

  private async sendEmailConfirmation(booking: BookingDetails): Promise<void> {
    await this.sendGridService.sendBookingConfirmation(
      booking.customerEmail,
      {
        name: booking.customerName,
        date: booking.date,
        time: booking.time,
        package: booking.package,
        price: booking.price,
      }
    );
  }

  private async sendSMSConfirmation(booking: BookingDetails): Promise<void> {
    // Integrate with Twilio or similar SMS service
    // This is a placeholder implementation
    const message = `
      تأكيد الحجز - شادي حسين Photography
      
      مرحباً ${booking.customerName}،
      
      تم تأكيد حجزك بنجاح:
      التاريخ: ${booking.date}
      الوقت: ${booking.time}
      الباقة: ${booking.package}
      الموقع: ${booking.location}
      السعر: ${booking.price} ريال
      
      نتطلع لرؤيتك!
      
      شادي حسين Photography
    `;

    // Would call Twilio API here
    console.log('SMS to be sent:', booking.customerPhone, message);
  }

  async sendReminder(booking: BookingDetails): Promise<void> {
    await this.sendGridService.sendReminder(
      booking.customerEmail,
      {
        name: booking.customerName,
        date: booking.date,
        time: booking.time,
        location: booking.location,
      }
    );

    // Also send SMS reminder
    await this.sendSMSConfirmation(booking);
  }

  async sendCancellationNotice(booking: BookingDetails): Promise<void> {
    await this.sendGridService.sendEmail({
      to: booking.customerEmail,
      from: 'info@shadyphotography.com',
      subject: 'إلغاء الحجز',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">إلغاء الحجز</h2>
          <p>مرحباً ${booking.customerName}،</p>
          <p>تم إلغاء حجزك:</p>
          <ul>
            <li><strong>التاريخ:</strong> ${booking.date}</li>
            <li><strong>الوقت:</strong> ${booking.time}</li>
            <li><strong>الباقة:</strong> ${booking.package}</li>
          </ul>
          <p>نأسف لرؤيتك تذهب. نتطلع لخدمتك في المستقبل.</p>
          <p>شادي حسين Photography</p>
        </div>
      `,
    });
  }

  async sendModificationNotice(booking: BookingDetails, changes: Record<string, any>): Promise<void> {
    const changesHtml = Object.entries(changes)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    await this.sendGridService.sendEmail({
      to: booking.customerEmail,
      from: 'info@shadyphotography.com',
      subject: 'تعديل الحجز',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">تعديل الحجز</h2>
          <p>مرحباً ${booking.customerName}،</p>
          <p>تم تعديل حجزك:</p>
          <ul>
            <li><strong>التاريخ:</strong> ${booking.date}</li>
            <li><strong>الوقت:</strong> ${booking.time}</li>
            <li><strong>الباقة:</strong> ${booking.package}</li>
          </ul>
          <h3>التغييرات:</h3>
          <ul>
            ${changesHtml}
          </ul>
          <p>شادي حسين Photography</p>
        </div>
      `,
    });
  }
}

export const bookingConfirmationService = BookingConfirmationService.getInstance();
