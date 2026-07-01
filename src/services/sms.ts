// SMS Integration Service
// Supports: Twilio, AWS SNS, Local SMS Providers

export interface SMSMessage {
  id: string;
  to: string;
  from: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: number;
  deliveredAt?: number;
  error?: string;
  cost: number;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: number;
  updatedAt: number;
}

export class SMSService {
  private static messages: SMSMessage[] = [];
  private static templates: SMSTemplate[] = [];

  private static apiKeys = {
    twilio: {
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
      phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    },
    awsSns: {
      accessKey: import.meta.env.VITE_AWS_SNS_ACCESS_KEY || '',
      secretKey: import.meta.env.VITE_AWS_SNS_SECRET_KEY || '',
      region: import.meta.env.VITE_AWS_SNS_REGION || '',
    },
    local: {
      provider: import.meta.env.VITE_LOCAL_SMS_PROVIDER || '',
      apiKey: import.meta.env.VITE_LOCAL_SMS_API_KEY || '',
    },
  };

  // Initialize SMS service
  static initialize(): void {
    const storedMessages = localStorage.getItem('sms_messages');
    if (storedMessages) {
      try {
        this.messages = JSON.parse(storedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }

    const storedTemplates = localStorage.getItem('sms_templates');
    if (storedTemplates) {
      try {
        this.templates = JSON.parse(storedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }
  }

  // Send SMS
  static async sendSMS(
    to: string,
    content: string,
    provider: 'twilio' | 'aws-sns' | 'local' = 'twilio'
  ): Promise<SMSMessage> {
    const message: SMSMessage = {
      id: this.generateMessageId(),
      to,
      from: this.getFromNumber(provider),
      content,
      status: 'pending',
      cost: this.calculateCost(content.length),
    };

    try {
      // In production, this would call the actual SMS API
      const success = await this.sendToProvider(to, content, provider);

      if (success) {
        message.status = 'sent';
        message.sentAt = Date.now();
      } else {
        message.status = 'failed';
        message.error = 'Failed to send SMS';
      }
    } catch (error) {
      message.status = 'failed';
      message.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.messages.push(message);
    this.saveMessages();

    return message;
  }

  // Send to provider
  private static async sendToProvider(
    to: string,
    content: string,
    provider: string
  ): Promise<boolean> {
    // In production, this would call the actual SMS API
    console.log(`Sending SMS via ${provider} to ${to}:`, content);
    return true;
  }

  // Get from number
  private static getFromNumber(provider: string): string {
    switch (provider) {
      case 'twilio':
        return this.apiKeys.twilio.phoneNumber;
      case 'aws-sns':
        return 'AWS-SNS';
      case 'local':
        return this.apiKeys.local.provider;
      default:
        return 'Unknown';
    }
  }

  // Calculate cost (simplified)
  private static calculateCost(length: number): number {
    // Assuming $0.05 per SMS segment (160 characters)
    const segments = Math.ceil(length / 160);
    return segments * 0.05;
  }

  // Send SMS from template
  static async sendFromTemplate(
    templateId: string,
    to: string,
    data: Record<string, any>,
    provider: 'twilio' | 'aws-sns' | 'local' = 'twilio'
  ): Promise<SMSMessage> {
    const template = this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    let content = template.content;

    // Replace variables
    template.variables.forEach((variable) => {
      const value = data[variable] || '';
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return this.sendSMS(to, content, provider);
  }

  // Send bulk SMS
  static async sendBulkSMS(
    recipients: string[],
    content: string,
    provider: 'twilio' | 'aws-sns' | 'local' = 'twilio'
  ): Promise<SMSMessage[]> {
    const messages: SMSMessage[] = [];

    for (const to of recipients) {
      const message = await this.sendSMS(to, content, provider);
      messages.push(message);
    }

    return messages;
  }

  // Get message by ID
  static getMessageById(id: string): SMSMessage | undefined {
    return this.messages.find((m) => m.id === id);
  }

  // Get all messages
  static getMessages(filter?: {
    to?: string;
    status?: SMSMessage['status'];
    startDate?: Date;
    endDate?: Date;
  }): SMSMessage[] {
    let filtered = [...this.messages];

    if (filter?.to) {
      filtered = filtered.filter((m) => m.to === filter.to);
    }

    if (filter?.status) {
      filtered = filtered.filter((m) => m.status === filter.status);
    }

    if (filter?.startDate) {
      filtered = filtered.filter((m) => (m.sentAt || 0) >= filter.startDate!.getTime());
    }

    if (filter?.endDate) {
      filtered = filtered.filter((m) => (m.sentAt || 0) <= filter.endDate!.getTime());
    }

    filtered.sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));

    return filtered;
  }

  // Update message status
  static updateMessageStatus(id: string, status: SMSMessage['status']): boolean {
    const message = this.getMessageById(id);
    if (!message) return false;

    message.status = status;
    if (status === 'delivered') {
      message.deliveredAt = Date.now();
    }

    this.saveMessages();
    return true;
  }

  // Create template
  static createTemplate(template: Omit<SMSTemplate, 'id' | 'createdAt' | 'updatedAt'>): SMSTemplate {
    const newTemplate: SMSTemplate = {
      ...template,
      id: this.generateTemplateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.templates.push(newTemplate);
    this.saveTemplates();

    return newTemplate;
  }

  // Update template
  static updateTemplate(id: string, updates: Partial<SMSTemplate>): SMSTemplate | null {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveTemplates();
    return this.templates[index];
  }

  // Delete template
  static deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  // Get template by ID
  static getTemplateById(id: string): SMSTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  // Get all templates
  static getTemplates(): SMSTemplate[] {
    return [...this.templates];
  }

  // Get SMS statistics
  static getStatistics(): {
    totalMessages: number;
    messagesByStatus: Record<string, number>;
    totalCost: number;
    deliveryRate: number;
    averageCost: number;
  } {
    const messagesByStatus: Record<string, number> = {};
    let totalCost = 0;
    let deliveredCount = 0;

    this.messages.forEach((message) => {
      messagesByStatus[message.status] = (messagesByStatus[message.status] || 0) + 1;
      totalCost += message.cost;
      if (message.status === 'delivered') {
        deliveredCount++;
      }
    });

    const deliveryRate =
      this.messages.length > 0 ? (deliveredCount / this.messages.length) * 100 : 0;
    const averageCost =
      this.messages.length > 0 ? totalCost / this.messages.length : 0;

    return {
      totalMessages: this.messages.length,
      messagesByStatus,
      totalCost,
      deliveryRate,
      averageCost,
    };
  }

  // Generate message ID
  private static generateMessageId(): string {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate template ID
  private static generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save messages
  private static saveMessages(): void {
    try {
      localStorage.setItem('sms_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  // Save templates
  private static saveTemplates(): void {
    try {
      localStorage.setItem('sms_templates', JSON.stringify(this.templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  // Validate phone number (Egyptian format)
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Format phone number
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `+2${cleaned}`;
    }
    return cleaned;
  }

  // Schedule SMS
  static async scheduleSMS(
    to: string,
    content: string,
    scheduledAt: Date,
    provider: 'twilio' | 'aws-sns' | 'local' = 'twilio'
  ): Promise<SMSMessage> {
    // In production, this would use a job queue
    const delay = scheduledAt.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(async () => {
        await this.sendSMS(to, content, provider);
      }, delay);
    }

    return this.sendSMS(to, content, provider);
  }

  // Get message history for phone number
  static getMessageHistory(phoneNumber: string): SMSMessage[] {
    return this.messages.filter((m) => m.to === phoneNumber);
  }

  // Search messages
  static searchMessages(query: string): SMSMessage[] {
    const lowerQuery = query.toLowerCase();
    return this.messages.filter(
      (m) =>
        m.content.toLowerCase().includes(lowerQuery) ||
        m.to.includes(query)
    );
  }
}

export const smsService = SMSService;
