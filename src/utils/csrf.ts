/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities
 * Simple client-side CSRF token management
 */

class CSRFProtection {
  private token: string | null = null;
  private tokenName = 'csrf_token';

  /**
   * Generate a random CSRF token
   * @returns Random token string
   */
  private generateToken(): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(8, '0')).join('');
  }

  /**
   * Get or generate CSRF token
   * @returns CSRF token
   */
  getToken(): string {
    if (!this.token) {
      this.token = this.generateToken();
      // Store in session storage (cleared when tab closes)
      sessionStorage.setItem(this.tokenName, this.token);
    }
    return this.token;
  }

  /**
   * Get stored CSRF token from session storage
   * @returns Stored token or null
   */
  getStoredToken(): string | null {
    return sessionStorage.getItem(this.tokenName);
  }

  /**
   * Validate CSRF token
   * @param token - Token to validate
   * @returns True if token matches
   */
  validateToken(token: string): boolean {
    const storedToken = this.getStoredToken();
    return storedToken === token;
  }

  /**
   * Refresh CSRF token
   * @returns New token
   */
  refreshToken(): string {
    this.token = this.generateToken();
    sessionStorage.setItem(this.tokenName, this.token);
    return this.token;
  }

  /**
   * Clear CSRF token
   */
  clearToken(): void {
    this.token = null;
    sessionStorage.removeItem(this.tokenName);
  }

  /**
   * Add CSRF token to form data
   * @param formData - FormData object
   * @returns FormData with CSRF token
   */
  addToFormData(formData: FormData): FormData {
    formData.append(this.tokenName, this.getToken());
    return formData;
  }

  /**
   * Add CSRF token to request headers
   * @param headers - Headers object
   * @returns Headers with CSRF token
   */
  addToHeaders(headers: Record<string, string>): Record<string, string> {
    headers['X-CSRF-Token'] = this.getToken();
    return headers;
  }

  /**
   * Add CSRF token to request body
   * @param body - Request body object
   * @returns Body with CSRF token
   */
  addToBody(body: Record<string, any>): Record<string, any> {
    body[this.tokenName] = this.getToken();
    return body;
  }
}

// Create singleton instance
export const csrfProtection = new CSRFProtection();

export default CSRFProtection;
