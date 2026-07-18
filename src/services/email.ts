// Email Integration Service
// Supports: SendGrid, Mailchimp, AWS SES, Gmail API

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: File[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  recipients: string[];
  openedCount: number;
  clickedCount: number;
}

export class EmailService {
  constructor() {
    // API keys loaded from environment variables
    console.log('Email service initialized');
  }

  // Send email via SendGrid
  async sendViaSendGrid(request: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email/sendgrid/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        messageId: data.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إرسال البريد عبر SendGrid',
      };
    }
  }

  // Send email via Mailchimp
  async sendViaMailchimp(request: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email/mailchimp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        messageId: data.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إرسال البريد عبر Mailchimp',
      };
    }
  }

  // Send email via AWS SES
  async sendViaAWSSES(request: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email/ses/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        messageId: data.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إرسال البريد عبر AWS SES',
      };
    }
  }

  // Send email via Gmail API
  async sendViaGmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        messageId: data.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إرسال البريد عبر Gmail',
      };
    }
  }

  // Send email (generic method)
  async sendEmail(provider: string, request: EmailRequest): Promise<EmailResponse> {
    switch (provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(request);
      case 'mailchimp':
        return this.sendViaMailchimp(request);
      case 'ses':
        return this.sendViaAWSSES(request);
      case 'gmail':
        return this.sendViaGmail(request);
      default:
        return {
          success: false,
          error: 'مزود البريد غير مدعوم',
        };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(
    email: string,
    customerName: string,
    bookingDetails: any
  ): Promise<EmailResponse> {
    const templateData = {
      customerName,
      bookingDate: bookingDetails.date,
      packageName: bookingDetails.packageName,
      totalPrice: bookingDetails.totalPrice,
      depositAmount: bookingDetails.depositAmount,
    };

    return this.sendEmail('sendgrid', {
      to: [email],
      subject: 'تأكيد الحجز - Photography Studio',
      templateId: 'booking-confirmation',
      templateData,
    });
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(
    email: string,
    customerName: string,
    paymentDetails: any
  ): Promise<EmailResponse> {
    const templateData = {
      customerName,
      amount: paymentDetails.amount,
      paymentMethod: paymentDetails.method,
      paymentDate: paymentDetails.date,
      transactionId: paymentDetails.transactionId,
    };

    return this.sendEmail('sendgrid', {
      to: [email],
      subject: 'تأكيد الدفع - Photography Studio',
      templateId: 'payment-confirmation',
      templateData,
    });
  }

  // Send invoice email
  async sendInvoice(
    email: string,
    customerName: string,
    invoiceDetails: any
  ): Promise<EmailResponse> {
    const templateData = {
      customerName,
      invoiceNumber: invoiceDetails.number,
      invoiceDate: invoiceDetails.date,
      dueDate: invoiceDetails.dueDate,
      totalAmount: invoiceDetails.total,
      items: invoiceDetails.items,
    };

    return this.sendEmail('sendgrid', {
      to: [email],
      subject: `فاتورة #${invoiceDetails.number} - Photography Studio`,
      templateId: 'invoice',
      templateData,
    });
  }

  // Send marketing email
  async sendMarketingEmail(
    recipients: string[],
    subject: string,
    body: string
  ): Promise<EmailResponse> {
    return this.sendEmail('mailchimp', {
      to: recipients,
      subject,
      body,
    });
  }

  // Create email campaign
  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    try {
      const response = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('فشل إنشاء الحملة البريدية');
    }
  }

  // Schedule email campaign
  async scheduleCampaign(
    campaignId: string,
    scheduledAt: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  }

  // Get email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch('/api/email/templates');
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      return [];
    }
  }

  // Create email template
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('فشل إنشاء قالب البريد');
    }
  }

  // Get email statistics
  async getEmailStatistics(): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
  }> {
    try {
      const response = await fetch('/api/email/statistics');
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        openRate: 0,
        clickRate: 0,
      };
    }
  }

  // Get email history
  async getEmailHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`/api/email/history?limit=${limit}`);
      const data = await response.json();
      return data.emails || [];
    } catch (error) {
      return [];
    }
  }
}

export const emailService = new EmailService();
