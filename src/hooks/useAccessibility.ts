import React, { useEffect, useState, useCallback } from 'react';

export function useKeyboardNavigation(
  items: any[],
  onSelect: (item: any, index: number) => void,
  options?: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  }
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { loop = true, orientation = 'vertical' } = options || {};

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev + 1;
            if (next >= items.length) {
              return loop ? 0 : prev;
            }
            return next;
          });
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev - 1;
            if (next < 0) {
              return loop ? items.length - 1 : prev;
            }
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(items[selectedIndex], selectedIndex);
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(items.length - 1);
          break;
      }
    },
    [items, selectedIndex, onSelect, loop]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    firstElement?.focus();
    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return containerRef;
}

export function useAriaLive(announcement: string, priority: 'polite' | 'assertive' = 'polite') {
  const [elementId] = useState(() => `aria-live-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!announcement) return;

    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = announcement;
    }
  }, [announcement, elementId]);

  return { id: elementId, 'aria-live': priority };
}

export function useScreenReader() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Detect screen reader through various methods
    const checkScreenReader = () => {
      // Method 1: Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Method 2: Check for screen reader specific behaviors
      const hasScreenReader = 
        window.speechSynthesis?.getVoices()?.length > 0 ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('VoiceOver');

      setIsScreenReaderActive(prefersReducedMotion || hasScreenReader);
    };

    checkScreenReader();
    window.addEventListener('resize', checkScreenReader);

    return () => window.removeEventListener('resize', checkScreenReader);
  }, []);

  return isScreenReaderActive;
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleKeyDown = useCallback(() => setIsFocusVisible(true), []);
  const handleMouseDown = useCallback(() => setIsFocusVisible(false), []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleKeyDown, handleMouseDown]);

  return isFocusVisible;
}

export function useSkipLinks() {
  const [skipTarget, setSkipTarget] = useState<string | null>(null);

  const skipTo = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return { skipTo, skipTarget };
}
