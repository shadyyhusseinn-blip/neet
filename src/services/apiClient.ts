import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { csrfProtection } from '../middleware/csrf';
import { apiRateLimiter } from '../middleware/rateLimiter';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add CSRF token
        const csrfHeaders = csrfProtection.getHeaders();
        Object.assign(config.headers, csrfHeaders);

        // Add rate limiting
        const identifier = this.getRateLimitIdentifier();
        const rateLimit = apiRateLimiter.check(identifier);
        
        if (!rateLimit.allowed) {
          return Promise.reject(new Error('Rate limit exceeded'));
        }

        config.headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString();
        config.headers['X-RateLimit-Reset'] = rateLimit.resetTime.toString();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Handle specific error codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - redirect to login
              window.location.href = '/login';
              break;
            case 403:
              // Forbidden
              console.error('Access forbidden');
              break;
            case 429:
              // Rate limit exceeded
              console.error('Rate limit exceeded');
              break;
            case 500:
              // Server error
              console.error('Server error');
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getRateLimitIdentifier(): string {
    // Use user ID or session ID for rate limiting
    const userId = localStorage.getItem('userId') || 'anonymous';
    return `${userId}_${this.baseURL}`;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
