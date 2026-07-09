import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param dirty - The HTML string to sanitize
 * @param config - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string, config?: any): string {
  const sanitized = DOMPurify.sanitize(dirty, config);
  return String(sanitized);
}

/**
 * Sanitize text input (removes all HTML tags)
 * @param dirty - The text string to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(dirty: string): string {
  const sanitized = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
  return String(sanitized);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  const sanitized = DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  const sanitizedStr = String(sanitized);
  
  // Block javascript: and data: protocols
  if (sanitizedStr.match(/^(javascript|data):/i)) {
    return '';
  }
  
  return sanitizedStr;
}

/**
 * Sanitize object keys and values recursively
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}
