// Performance Optimization Utilities

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export class PerformanceOptimizer {
  // Measure page load performance
  static measurePageLoad(): PerformanceMetrics {
    if (typeof window === 'undefined' || !window.performance) {
      return {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0];

    return {
      pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint: lcp ? lcp.startTime : 0,
      firstInputDelay: 0, // Requires Event Timing API
      cumulativeLayoutShift: 0, // Requires Layout Instability API
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
    };
  }

  // Lazy load images with Intersection Observer
  static lazyLoadImages() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  static preloadResources(urls: string[]) {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
        link.as = 'image';
      } else if (url.match(/\.(woff|woff2|ttf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Prefetch resources for next navigation
  static prefetchResources(urls: string[]) {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Debounce function
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memoize function
  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Request animation frame with fallback
  static requestAnimationFrame(callback: () => void): number {
    return (
      window.requestAnimationFrame(callback) ||
      window.setTimeout(callback, 16)
    );
  }

  // Cancel animation frame with fallback
  static cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id) || window.clearTimeout(id);
  }

  // Virtual scroll for large lists
  static createVirtualScroll(
    container: HTMLElement,
    itemHeight: number,
    renderItem: (index: number) => HTMLElement
  ) {
    let scrollTop = 0;
    let visibleStart = 0;
    let visibleEnd = 0;

    const updateVisibleRange = () => {
      const containerHeight = container.clientHeight;
      const totalItems = Math.ceil(container.scrollHeight / itemHeight);
      
      visibleStart = Math.floor(scrollTop / itemHeight);
      visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 2,
        totalItems
      );
    };

    const render = () => {
      updateVisibleRange();
      
      // Clear container
      container.innerHTML = '';
      
      // Render visible items
      for (let i = visibleStart; i < visibleEnd; i++) {
        const item = renderItem(i);
        item.style.position = 'absolute';
        item.style.top = `${i * itemHeight}px`;
        item.style.height = `${itemHeight}px`;
        container.appendChild(item);
      }
    };

    container.addEventListener('scroll', () => {
      scrollTop = container.scrollTop;
      PerformanceOptimizer.requestAnimationFrame(render);
    });

    return { render };
  }

  // Optimize images with WebP
  static getOptimizedImageUrl(url: string, width: number, quality: number = 80): string {
    // This would typically use an image optimization service
    // For now, return the original URL
    return url;
  }

  // Cache API wrapper
  static async cacheRequest(url: string, options?: RequestInit): Promise<Response> {
    const cacheName = 'api-cache-v1';
    const cache = await caches.open(cacheName);
    
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(url, options);
    if (response.ok) {
      cache.put(url, response.clone());
    }
    
    return response;
  }

  // Service Worker registration
  static async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }
    return false;
  }

  // Measure First Input Delay
  static measureFirstInputDelay(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fid = entries[0] as any;
          resolve(fid.processingStart - fid.startTime);
          observer.disconnect();
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    });
  }

  // Measure Cumulative Layout Shift
  static measureCumulativeLayoutShift(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
          observer.disconnect();
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(0);
      }
    });
  }

  // Report performance metrics
  static reportMetrics(metrics: PerformanceMetrics) {
    // Send metrics to analytics service
    console.log('Performance Metrics:', metrics);
    
    // In production, send to analytics
    // analytics.track('performance_metrics', metrics);
  }
}

export const performanceOptimizer = PerformanceOptimizer;
