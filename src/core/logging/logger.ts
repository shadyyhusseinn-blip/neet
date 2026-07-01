/**
 * Logging System
 * نظام موحد لتسجيل الأحداث والأخطاء
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context,
    };
  }

  private storeLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatLog(entry: LogEntry): string {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    };

    const contextStr = entry.context ? `[${entry.context}] ` : '';
    const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
    return `${emoji[entry.level]} [${entry.timestamp}] ${contextStr}${entry.message}${dataStr}`;
  }

  info(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('info', message, data, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.log(this.formatLog(entry));
    }
    
    // في الإنتاج، يمكن إرسال السجلات إلى خدمة خارجية
    // this.sendToLoggingService(entry);
  }

  warn(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('warn', message, data, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.warn(this.formatLog(entry));
    }
  }

  error(message: string, error?: Error | any, context?: string) {
    const entry = this.createLogEntry('error', message, error, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.error(this.formatLog(entry));
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  debug(message: string, data?: any, context?: string) {
    if (!this.isDevelopment) return;
    
    const entry = this.createLogEntry('debug', message, data, context);
    this.storeLog(entry);
    console.debug(this.formatLog(entry));
  }

  /**
   * الحصول على جميع السجلات المخزنة
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * مسح جميع السجلات
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * تصدير السجلات كـ JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * إرسال السجلات إلى خدمة خارجية (للإنتاج)
   */
  private async sendToLoggingService(entry: LogEntry) {
    // TODO: تنفيذ إرسال السجلات إلى خدمة مثل Sentry أو LogRocket
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });
  }
}

export const logger = new Logger();
