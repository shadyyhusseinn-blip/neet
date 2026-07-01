/**
 * Performance Optimizations
 * أدوات وتقنيات لتحسين الأداء
 */

import { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';

/**
 * Memoize expensive components
 * استخدم هذا المكون لغلف المكونات المكلفة
 */
export function memoizeComponent<P extends object>(
  Component: React.FC<P>,
  arePropsEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, arePropsEqual);
}

/**
 * Memoize expensive calculations
 * استخدم هذا لغلف الحسابات المكلفة
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: any[]
): T {
  return useMemo(factory, deps);
}

/**
 * Memoize callbacks
 * استخدم هذا لغلف الدوال التي تمرر للأبناء
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  return useCallback(callback, deps) as T;
}

/**
 * Debounce function
 * استخدم هذا لتقليل عدد المرات التي يتم فيها تنفيذ دالة
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useCallback(
    (...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
      return () => clearTimeout(timeoutId);
    },
    [callback, delay]
  );
}

/**
 * Throttle function
 * استخدم هذا لتنفيذ دالة مرة واحدة خلال فترة زمنية
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

/**
 * Virtual scrolling helper
 * استخدم هذا للقوائم الطويلة
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
): { startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  // Load extra items for smooth scrolling
  const buffer = 5;
  return {
    startIndex: Math.max(0, startIndex - buffer),
    endIndex: Math.min(totalItems - 1, endIndex + buffer),
  };
}

/**
 * Image lazy loading helper
 */
export function useLazyImage(src: string, threshold = 0.1) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return { imgRef, isLoaded, isInView };
}
