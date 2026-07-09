/**
 * Simple client-side rate limiter
 * Prevents excessive API calls from the same user
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private defaultLimit: number;
  private defaultWindow: number; // in milliseconds

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.defaultLimit = limit;
    this.defaultWindow = windowMs;
  }

  /**
   * Check if a request should be rate limited
   * @param key - Unique identifier for the user/IP
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    key: string,
    limit: number = this.defaultLimit,
    windowMs: number = this.defaultWindow
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.storage.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.storage.delete(key);
    }

    const currentEntry = this.storage.get(key);

    if (!currentEntry) {
      // First request
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    if (currentEntry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      };
    }

    // Increment count
    currentEntry.count++;
    this.storage.set(key, currentEntry);

    return {
      allowed: true,
      remaining: limit - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the user/IP
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get rate limit status for a key
   * @param key - Unique identifier for the user/IP
   */
  getStatus(key: string): { count: number; resetTime: number } | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.resetTime) {
      this.storage.delete(key);
      return null;
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
    };
  }
}

// Create singleton instances for different use cases
export const authRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute for auth
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute for API
export const uploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads per minute

export default RateLimiter;
