import React, { useCallback, useRef, useEffect, useState } from 'react';

// Debounce hook
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        callback(...args);
        lastRunRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRunRef.current = Date.now();
        }, delay - (now - lastRunRef.current));
      }
    },
    [callback, delay]
  );
}

// Memoized value hook
export function useMemoizedValue<T>(value: T, deps: any[] = []): T {
  const ref = useRef<T>(value);
  const depsRef = useRef(deps);

  if (!depsRef.current.every((dep, i) => dep === deps[i])) {
    ref.current = value;
    depsRef.current = deps;
  }

  return ref.current;
}

// Idle callback hook
export function useIdleCallback(
  callback: () => void,
  deps: any[] = []
): void {
  useEffect(() => {
    const requestIdleCallback =
      window.requestIdleCallback ||
      ((cb: IdleRequestCallback) => setTimeout(cb, 1));

    const id = requestIdleCallback(() => {
      callback();
    });

    return () => {
      const cancelIdleCallback =
        window.cancelIdleCallback || clearTimeout;
      cancelIdleCallback(id);
    };
  }, deps);
}

// Intersection Observer hook
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [(node: HTMLElement | null) => void, IntersectionObserverEntry | null] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new IntersectionObserver(([entry]) => {
          setEntry(entry);
        }, options);
        observerRef.current.observe(node);
      }
    },
    [options]
  );

  return [observe, entry];
}

// Resize Observer hook
export function useResizeObserver(
  callback: (entry: ResizeObserverEntry) => void
): [(node: HTMLElement | null) => void] {
  const observerRef = useRef<ResizeObserver | null>(null);

  const observe = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new ResizeObserver(([entry]) => {
          callback(entry);
        });
        observerRef.current.observe(node);
      }
    },
    [callback]
  );

  return [observe];
}

// Image lazy loading hook
export function useLazyImage(src: string, threshold: number = 0.1): [string, boolean] {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, entry] = useIntersectionObserver({ threshold });

  useEffect(() => {
    if (entry?.isIntersecting && !isLoaded) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [entry, src, isLoaded]);

  return [imageSrc, isLoaded];
}

// Virtual scrolling hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: { item: T; index: number }[];
  scrollTop: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  totalHeight: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);

  const visibleItems = items
    .slice(startIndex, endIndex)
    .map((item, i) => ({ item, index: startIndex + i }));

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    scrollTop,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        setMetrics((prev) => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Measure memory (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics((prev) => ({
        ...prev,
        memory: Math.round(memory.usedJSHeapSize / 1048576),
      }));
    }

    // Measure load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    if (loadTime > 0) {
      setMetrics((prev) => ({ ...prev, loadTime }));
    }
  }, []);

  return metrics;
}

// Code splitting helper
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: any
): any {
  return React.lazy(() => importFn().catch((error) => {
    console.error('Failed to load component:', error);
    return { default: () => fallback || null };
  }));
}

// Prefetch helper
export function prefetch(href: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// Preload helper
export function preload(href: string, as: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// DNS prefetch helper
export function dnsPrefetch(hostname: string): void {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = hostname;
  document.head.appendChild(link);
}
