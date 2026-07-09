interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 100;

  handleError(error: Error | string, context: ErrorContext = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorLog: ErrorLog = {
      message: errorMessage,
      stack: errorStack,
      context,
      timestamp: new Date().toISOString(),
      severity,
    };

    this.errorLogs.push(errorLog);

    // Keep only the last maxLogs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift();
    }

    // Log to console
    console.error(`[${severity.toUpperCase()}] ${errorMessage}`, context);

    // Send to error tracking service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }

    // Show user-friendly notification for critical errors
    if (severity === 'critical') {
      this.showUserNotification(errorMessage);
    }
  }

  async handleAsyncError(
    promise: Promise<any>,
    context: ErrorContext = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<any> {
    try {
      return await promise;
    } catch (error) {
      this.handleError(error as Error, context, severity);
      throw error;
    }
  }

  retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
    context: ErrorContext = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const attempt = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            this.handleError(error as Error, context, 'high');
            reject(error);
          } else {
            setTimeout(attempt, delayMs * attempts);
          }
        }
      };

      attempt();
    });
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  clearErrorLogs(): void {
    this.errorLogs = [];
  }

  private showUserNotification(message: string) {
    // Show toast notification
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      window.dispatchEvent(
        new CustomEvent('show-error-toast', {
          detail: {
            message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
            type: 'error',
          },
        })
      );
    }
  }
}

export const errorHandler = new ErrorHandler();
