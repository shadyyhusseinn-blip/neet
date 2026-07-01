/**
 * Performance Monitoring System
 * نظام مراقبة الأداء
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  context?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 50;

  /**
   * تتبع عرض صفحة
   */
  trackPageView(page: string) {
    const metric: PerformanceMetric = {
      name: 'page_view',
      value: 1,
      timestamp: new Date().toISOString(),
      context: page,
    };
    this.storeMetric(metric);
    
    // تتبع في Google Analytics إذا كان متاح
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: page,
        page_location: window.location.href,
      });
    }
  }

  /**
   * تتبع إجراء مستخدم
   */
  trackAction(action: string, data?: any) {
    const metric: PerformanceMetric = {
      name: 'user_action',
      value: 1,
      timestamp: new Date().toISOString(),
      context: action,
    };
    this.storeMetric(metric);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, data);
    }
  }

  /**
   * تتبع خطأ
   */
  trackError(error: Error, context?: string) {
    const metric: PerformanceMetric = {
      name: 'error',
      value: 1,
      timestamp: new Date().toISOString(),
      context: context || error.message,
    };
    this.storeMetric(metric);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  /**
   * تتبع مقياس أداء
   */
  trackPerformance(metricName: string, value: number, context?: string) {
    const performanceMetric: PerformanceMetric = {
      name: metricName,
      value,
      timestamp: new Date().toISOString(),
      context,
    };
    this.storeMetric(performanceMetric);
  }

  /**
   * قياس وقت تنفيذ دالة
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.trackPerformance(name, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackPerformance(`${name}_error`, duration, context);
      throw error;
    }
  }

  /**
   * قياس وقت تحميل مكون
   */
  measureComponentRender(componentName: string) {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.trackPerformance(`component_render_${componentName}`, duration);
    };
  }

  /**
   * الحصول على Web Vitals
   */
  getWebVitals() {
    if ('PerformanceObserver' in window) {
      // تتبع Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.trackPerformance('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation failed:', e);
      }

      // تتبع First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackPerformance('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation failed:', e);
      }

      // تتبع Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let clsValue = 0;
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.trackPerformance('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation failed:', e);
      }
    }
  }

  /**
   * تخزين المقياس
   */
  private storeMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * الحصول على جميع المقاييس
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * مسح جميع المقاييس
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * تصدير المقاييس كـ JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * الحصول على ملخص الأداء
   */
  getPerformanceSummary() {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }
      
      summary[metric.name].count++;
      summary[metric.name].total += metric.value;
      summary[metric.name].min = Math.min(summary[metric.name].min, metric.value);
      summary[metric.name].max = Math.max(summary[metric.name].max, metric.value);
      summary[metric.name].avg = summary[metric.name].total / summary[metric.name].count;
    });
    
    return summary;
  }
}

export const performanceMonitor = new PerformanceMonitor();
