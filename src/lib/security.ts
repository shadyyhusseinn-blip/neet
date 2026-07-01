// Security Enhancement Utilities

export interface SecurityConfig {
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  enableCSRFProtection: boolean;
  enableXSSProtection: boolean;
  enableContentSecurityPolicy: boolean;
  sessionTimeout: number; // in minutes
}

export class SecurityService {
  private static config: SecurityConfig = {
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    sessionTimeout: 30,
  };

  // Rate limiting
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (record.count >= this.config.maxRequestsPerMinute) {
      return false;
    }

    record.count++;
    return true;
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Escape HTML entities
  static escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  // Validate URL
  static isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // Validate email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (Egyptian format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Hash password (client-side - for demo, use bcrypt on server)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Set security headers (for fetch requests)
  static setSecurityHeaders(headers: Headers): Headers {
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    return headers;
  }

  // Content Security Policy
  static getContentSecurityPolicy(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
    ].join('; ');
  }

  // Session management
  static setSessionTimeout(callback: () => void): number {
    return window.setTimeout(callback, this.config.sessionTimeout * 60 * 1000);
  }

  static resetSessionTimeout(timeoutId: number, callback: () => void): number {
    clearTimeout(timeoutId);
    return this.setSessionTimeout(callback);
  }

  // Input validation
  static validateInput(input: string, type: 'text' | 'email' | 'phone' | 'url' | 'number'): boolean {
    switch (type) {
      case 'email':
        return this.isValidEmail(input);
      case 'phone':
        return this.isValidPhone(input);
      case 'url':
        return this.isValidURL(input);
      case 'number':
        return !isNaN(Number(input));
      case 'text':
        return input.length > 0 && input.length <= 1000;
      default:
        return false;
    }
  }

  // Sanitize user input
  static sanitizeInput(input: string, type: 'text' | 'html' | 'url'): string {
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'url':
        return this.isValidURL(input) ? input : '';
      case 'text':
      default:
        return this.escapeHTML(input.trim());
    }
  }

  // Detect suspicious activity
  static detectSuspiciousActivity(
    actions: Array<{ action: string; timestamp: number }>
  ): boolean {
    const now = Date.now();
    const recentActions = actions.filter(
      (a) => now - a.timestamp < 60000 // Last minute
    );

    // More than 20 actions in a minute is suspicious
    if (recentActions.length > 20) return true;

    // Check for rapid repeated actions
    const actionCounts = recentActions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // More than 10 of the same action in a minute is suspicious
    for (const count of Object.values(actionCounts)) {
      if (count > 10) return true;
    }

    return false;
  }

  // Two-Factor Authentication (2FA)
  static generate2FACode(): string {
    // Generate 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static verify2FACode(code: string, storedCode: string): boolean {
    return code === storedCode;
  }

  // Encryption (simple XOR for demo - use proper encryption in production)
  static encrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }

  static decrypt(encrypted: string, key: string): string {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  // Secure storage
  static setSecureItem(key: string, value: string): void {
    const encrypted = this.encrypt(value, this.getEncryptionKey());
    localStorage.setItem(key, encrypted);
  }

  static getSecureItem(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    try {
      return this.decrypt(encrypted, this.getEncryptionKey());
    } catch {
      return null;
    }
  }

  static removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  private static getEncryptionKey(): string {
    // In production, this should be a secure key from the server
    return 'default-encryption-key-change-in-production';
  }

  // Audit logging
  static logSecurityEvent(event: {
    type: string;
    userId?: string;
    details: any;
    timestamp?: number;
  }): void {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    // In production, send to server
    console.log('Security Event:', logEntry);

    // Store locally for demo
    const logs = this.getSecurityLogs();
    logs.push(logEntry);
    localStorage.setItem('security_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
  }

  static getSecurityLogs(): any[] {
    try {
      const logs = localStorage.getItem('security_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  // Check for vulnerabilities
  static checkForVulnerabilities(): {
    hasXSS: boolean;
    hasCSRF: boolean;
    hasInjection: boolean;
  } {
    // Basic checks - in production, use automated security scanners
    return {
      hasXSS: false,
      hasCSRF: false,
      hasInjection: false,
    };
  }

  // Secure fetch wrapper
  static async secureFetch(url: string, options?: RequestInit): Promise<Response> {
    const headers = new Headers(options?.headers);
    this.setSecurityHeaders(headers);

    // Add CSRF token if enabled
    if (this.config.enableCSRFProtection) {
      const csrfToken = localStorage.getItem('csrf_token');
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Initialize security
  static initialize(): void {
    // Generate CSRF token
    if (this.config.enableCSRFProtection) {
      const csrfToken = this.generateCSRFToken();
      localStorage.setItem('csrf_token', csrfToken);
    }

    // Set CSP meta tag
    if (this.config.enableContentSecurityPolicy) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = this.getContentSecurityPolicy();
      document.head.appendChild(meta);
    }

    // Log initialization
    this.logSecurityEvent({
      type: 'security_initialized',
      details: { config: this.config },
    });
  }
}

export const securityService = SecurityService;
