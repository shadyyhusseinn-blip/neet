/**
 * Centralized Error Handler
 * معالج أخطاء مركزي
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'API_ERROR', 500, details);
    this.name = 'ApiError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; timestamp: Date; context?: any }> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: Error, context?: any): void {
    // Log error
    this.logError(error, context);

    // Send to monitoring service (if configured)
    this.sendToMonitoring(error, context);

    // Show user-friendly message
    this.showUserMessage(error);
  }

  private logError(error: Error, context?: any): void {
    const errorEntry = {
      error,
      timestamp: new Date(),
      context
    };

    this.errorLog.push(errorEntry);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    console.error('❌ Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  private sendToMonitoring(error: Error, context?: any): void {
    // TODO: Integrate with Sentry or similar service
    // For now, just log to console
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  }

  private showUserMessage(error: Error): void {
    // Show toast notification using sonner
    const { toast } = require('sonner');
    
    let message = 'حدث خطأ غير متوقع';
    let type = 'error';
    let details: any = undefined;
    
    if (error instanceof ApiError) {
      message = error.message || 'خطأ في الاتصال بالخادم';
      details = error.details;
    } else if (error instanceof AuthError) {
      message = error.message || 'خطأ في المصادقة';
      details = error.details;
    } else if (error instanceof ValidationError) {
      message = error.message || 'بيانات غير صالحة';
      type = 'warning';
      details = error.details;
    } else if (error instanceof NetworkError) {
      message = 'لا يوجد اتصال بالإنترنت';
      type = 'warning';
      details = error.details;
    } else {
      message = error.message || 'حدث خطأ غير متوقع';
    }
    
    toast[type](message, {
      description: details ? JSON.stringify(details) : undefined
    });
  }

  getErrorLog(): Array<{ error: Error; timestamp: Date; context?: any }> {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();
