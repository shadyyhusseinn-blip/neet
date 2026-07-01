// Input sanitization utilities to prevent XSS and NoSQL injection

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and special characters
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string {
  if (!input) return '';
  const sanitized = sanitizeString(input);
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  return sanitized.toLowerCase();
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(input: string): string {
  if (!input) return '';
  return input.replace(/[^\d+]/g, ''); // Keep only digits and +
}

/**
 * Sanitize username input
 */
export function sanitizeUsername(input: string): string {
  if (!input) return '';
  return input.replace(/[^a-zA-Z0-9_]/g, ''); // Keep only alphanumeric and underscore
}

/**
 * Sanitize ID input (for database queries)
 */
export function sanitizeId(input: string): string {
  if (!input) return '';
  return input.replace(/[^a-zA-Z0-9-_]/g, ''); // Keep only safe ID characters
}

/**
 * Deep sanitize an object (recursive)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value) as any;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value) as any;
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}
