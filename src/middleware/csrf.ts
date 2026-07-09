class CSRFProtection {
  private tokenLength = 32;
  private tokenStorageKey = 'csrf_token';

  generateToken(): string {
    const array = new Uint8Array(this.tokenLength);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  getToken(): string {
    let token = localStorage.getItem(this.tokenStorageKey);
    if (!token) {
      token = this.generateToken();
      localStorage.setItem(this.tokenStorageKey, token);
    }
    return token;
  }

  validateToken(token: string): boolean {
    const storedToken = localStorage.getItem(this.tokenStorageKey);
    return token === storedToken;
  }

  refreshToken(): string {
    const newToken = this.generateToken();
    localStorage.setItem(this.tokenStorageKey, newToken);
    return newToken;
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  // Add CSRF token to request headers
  getHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getToken(),
    };
  }
}

export const csrfProtection = new CSRFProtection();
