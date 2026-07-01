// Audit Logs Service

export interface AuditLog {
  id: string;
  timestamp: number;
  userId?: string;
  username?: string;
  action: string;
  category: 'auth' | 'booking' | 'payment' | 'customer' | 'team' | 'equipment' | 'system' | 'security';
  details: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  category?: AuditLog['category'];
  action?: string;
  success?: boolean;
}

export class AuditService {
  private static logs: AuditLog[] = [];
  private static maxLogs = 1000;

  // Initialize audit service
  static initialize(): void {
    // Load logs from localStorage
    const storedLogs = localStorage.getItem('audit_logs');
    if (storedLogs) {
      try {
        this.logs = JSON.parse(storedLogs);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      }
    }
  }

  // Log an action
  static log(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      ...log,
      id: this.generateLogId(),
      timestamp: Date.now(),
      ipAddress: this.getIPAddress(),
      userAgent: navigator.userAgent,
    };

    this.logs.push(auditLog);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to localStorage
    this.saveLogs();

    // In production, send to server
    this.sendToServer(auditLog);
  }

  // Generate log ID
  private static generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get IP address (client-side approximation)
  private static getIPAddress(): string {
    // In production, this would be obtained from the server
    return 'client-ip';
  }

  // Save logs to localStorage
  private static saveLogs(): void {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  // Send log to server
  private static sendToServer(log: AuditLog): void {
    // In production, send to server API
    console.log('Audit log sent to server:', log);
  }

  // Get all logs
  static getLogs(filter?: AuditLogFilter): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filter.startDate!.getTime()
        );
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp <= filter.endDate!.getTime()
        );
      }

      if (filter.userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === filter.userId);
      }

      if (filter.category) {
        filteredLogs = filteredLogs.filter((log) => log.category === filter.category);
      }

      if (filter.action) {
        filteredLogs = filteredLogs.filter((log) => log.action === filter.action);
      }

      if (filter.success !== undefined) {
        filteredLogs = filteredLogs.filter((log) => log.success === filter.success);
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    return filteredLogs;
  }

  // Get log by ID
  static getLogById(id: string): AuditLog | undefined {
    return this.logs.find((log) => log.id === id);
  }

  // Get logs by user
  static getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  // Get logs by category
  static getLogsByCategory(category: AuditLog['category']): AuditLog[] {
    return this.logs.filter((log) => log.category === category);
  }

  // Get logs by action
  static getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter((log) => log.action === action);
  }

  // Get failed logs
  static getFailedLogs(): AuditLog[] {
    return this.logs.filter((log) => !log.success);
  }

  // Get suspicious activity
  static getSuspiciousActivity(): AuditLog[] {
    const suspiciousLogs: AuditLog[] = [];

    // Check for multiple failed login attempts
    const failedLogins = this.logs.filter(
      (log) => log.category === 'auth' && log.action === 'login' && !log.success
    );

    const failedLoginsByUser = new Map<string, number>();
    failedLogins.forEach((log) => {
      const userId = log.userId || 'unknown';
      failedLoginsByUser.set(
        userId,
        (failedLoginsByUser.get(userId) || 0) + 1
      );
    });

    failedLoginsByUser.forEach((count, userId) => {
      if (count >= 5) {
        suspiciousLogs.push(
          ...failedLogins.filter((log) => log.userId === userId)
        );
      }
    });

    // Check for unusual activity patterns
    const recentLogs = this.logs.filter(
      (log) => Date.now() - log.timestamp < 3600000 // Last hour
    );

    if (recentLogs.length > 100) {
      suspiciousLogs.push(...recentLogs);
    }

    return suspiciousLogs;
  }

  // Get audit statistics
  static getStatistics(): {
    totalLogs: number;
    logsByCategory: Record<string, number>;
    logsByAction: Record<string, number>;
    successRate: number;
    failedLogs: number;
    suspiciousActivity: number;
  } {
    const logsByCategory: Record<string, number> = {};
    const logsByAction: Record<string, number> = {};
    let failedLogs = 0;

    this.logs.forEach((log) => {
      logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1;
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
      if (!log.success) failedLogs++;
    });

    const successRate =
      this.logs.length > 0
        ? ((this.logs.length - failedLogs) / this.logs.length) * 100
        : 100;

    return {
      totalLogs: this.logs.length,
      logsByCategory,
      logsByAction,
      successRate,
      failedLogs,
      suspiciousActivity: this.getSuspiciousActivity().length,
    };
  }

  // Export logs
  static exportLogs(filter?: AuditLogFilter): string {
    const logs = this.getLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  // Export logs as CSV
  static exportLogsAsCSV(filter?: AuditLogFilter): string {
    const logs = this.getLogs(filter);

    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'Username',
      'Action',
      'Category',
      'Success',
      'Error Message',
      'IP Address',
      'User Agent',
    ];

    const rows = logs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.userId || '',
      log.username || '',
      log.action,
      log.category,
      log.success ? 'Yes' : 'No',
      log.errorMessage || '',
      log.ipAddress || '',
      log.userAgent || '',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );

    return csv;
  }

  // Clear old logs
  static clearOldLogs(daysToKeep: number = 30): void {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    this.logs = this.logs.filter((log) => log.timestamp >= cutoffTime);
    this.saveLogs();
  }

  // Clear all logs
  static clearAllLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  // Predefined log methods for common actions
  static logAuth(action: 'login' | 'logout' | 'register' | 'password_change', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action,
      category: 'auth',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logBooking(action: 'create' | 'update' | 'delete' | 'cancel' | 'confirm', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `booking_${action}`,
      category: 'booking',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logPayment(action: 'create' | 'success' | 'fail' | 'refund', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `payment_${action}`,
      category: 'payment',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logCustomer(action: 'create' | 'update' | 'delete' | 'view', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `customer_${action}`,
      category: 'customer',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logTeam(action: 'create' | 'update' | 'delete' | 'assign', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `team_${action}`,
      category: 'team',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logEquipment(action: 'create' | 'update' | 'delete' | 'maintenance', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `equipment_${action}`,
      category: 'equipment',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logSystem(action: 'backup' | 'restore' | 'config_change' | 'maintenance', details: any, success: boolean = true, userId?: string, username?: string): void {
    this.log({
      action: `system_${action}`,
      category: 'system',
      details,
      success,
      userId,
      username,
      errorMessage: success ? undefined : details.error,
    });
  }

  static logSecurity(action: 'suspicious_activity' | 'blocked' | 'rate_limit' | 'csrf_failure', details: any, success: boolean = false, userId?: string, username?: string): void {
    this.log({
      action: `security_${action}`,
      category: 'security',
      details,
      success,
      userId,
      username,
      errorMessage: details.error,
    });
  }
}

export const auditService = AuditService;
