// Payment Integration Service
// Supports: Stripe, PayPal, Fawry, InstaPay

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'fawry' | 'instapay';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  bookingId?: string;
  customerId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

export class PaymentService {
  private stripePublicKey: string;
  private paypalClientId: string;
  private fawryMerchantCode: string;
  private instapayMerchantId: string;

  constructor() {
    this.stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
    this.paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
    this.fawryMerchantCode = import.meta.env.VITE_FAWRY_MERCHANT_CODE || '';
    this.instapayMerchantId = import.meta.env.VITE_INSTAPAY_MERCHANT_ID || '';
  }

  // Get available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'stripe',
        type: 'card',
        name: 'بطاقة ائتمان (Stripe)',
        icon: '💳',
        enabled: !!this.stripePublicKey,
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        enabled: !!this.paypalClientId,
      },
      {
        id: 'fawry',
        type: 'fawry',
        name: 'Fawry',
        icon: '🔵',
        enabled: !!this.fawryMerchantCode,
      },
      {
        id: 'instapay',
        type: 'instapay',
        name: 'InstaPay',
        icon: '📱',
        enabled: !!this.instapayMerchantId,
      },
    ];
  }

  // Create payment with Stripe
  async createStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call your backend API
      // which would then call Stripe API
      const response = await fetch('/api/payments/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إنشاء الدفع عبر Stripe',
      };
    }
  }

  // Create payment with PayPal
  async createPayPalPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/payments/paypal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إنشاء الدفع عبر PayPal',
      };
    }
  }

  // Create payment with Fawry
  async createFawryPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/payments/fawry/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إنشاء الدفع عبر Fawry',
      };
    }
  }

  // Create payment with InstaPay
  async createInstaPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/payments/instapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل إنشاء الدفع عبر InstaPay',
      };
    }
  }

  // Create payment (generic method)
  async createPayment(
    method: string,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    switch (method) {
      case 'stripe':
        return this.createStripePayment(request);
      case 'paypal':
        return this.createPayPalPayment(request);
      case 'fawry':
        return this.createFawryPayment(request);
      case 'instapay':
        return this.createInstaPayPayment(request);
      default:
        return {
          success: false,
          error: 'طريقة الدفع غير مدعومة',
        };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId: string, method: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/${method}/verify/${paymentId}`);
      const data = await response.json();
      return data.success && data.status === 'completed';
    } catch (error) {
      return false;
    }
  }

  // Process refund
  async processRefund(request: RefundRequest, method: string): Promise<RefundResponse> {
    try {
      const response = await fetch(`/api/payments/${method}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      return {
        success: data.success,
        refundId: data.refundId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'فشل معالجة الاسترداد',
      };
    }
  }

  // Get payment history
  async getPaymentHistory(customerId?: string): Promise<any[]> {
    try {
      const url = customerId
        ? `/api/payments/history?customerId=${customerId}`
        : '/api/payments/history';
      const response = await fetch(url);
      const data = await response.json();
      return data.payments || [];
    } catch (error) {
      return [];
    }
  }

  // Get payment statistics
  async getPaymentStatistics(): Promise<{
    totalRevenue: number;
    totalPayments: number;
    averagePayment: number;
    paymentMethods: Record<string, number>;
  }> {
    try {
      const response = await fetch('/api/payments/statistics');
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        totalRevenue: 0,
        totalPayments: 0,
        averagePayment: 0,
        paymentMethods: {},
      };
    }
  }
}

export const paymentService = new PaymentService();
