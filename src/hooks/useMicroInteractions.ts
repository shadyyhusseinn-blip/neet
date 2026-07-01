import { useState, useEffect, useRef, useCallback } from 'react';

// Hover effect hook with delay
export function useHover(delay: number = 0) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setIsHovered(true), delay);
    } else {
      setIsHovered(true);
    }
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isHovered, handleMouseEnter, handleMouseLeave };
}

// Press effect hook
export function usePress() {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);
  const handleMouseLeave = useCallback(() => setIsPressed(false), []);

  const handleTouchStart = useCallback(() => setIsPressed(true), []);
  const handleTouchEnd = useCallback(() => setIsPressed(false), []);

  return {
    isPressed,
    pressProps: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// Ripple effect hook
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: any) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    let x, y;
    if ('clientX' in event) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    }

    const size = Math.max(rect.width, rect.height);
    const id = rippleIdRef.current++;

    setRipples((prev) => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, createRipple };
}

// Scale effect on interaction
export function useScale(scale: number = 0.95) {
  const [isScaled, setIsScaled] = useState(false);

  const handleMouseDown = useCallback(() => setIsScaled(true), []);
  const handleMouseUp = useCallback(() => setIsScaled(false), []);
  const handleMouseLeave = useCallback(() => setIsScaled(false), []);

  const transform = isScaled ? `scale(${scale})` : 'scale(1)';

  return {
    transform,
    scaleProps: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      style: { transform },
    },
  };
}

// Shake effect
export function useShake(trigger: boolean) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return isShaking;
}

// Pulse effect
export function usePulse(enabled: boolean = true, duration: number = 1000) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsPulsing(false);
      return;
    }

    setIsPulsing(true);
    const interval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, duration);

    return () => clearInterval(interval);
  }, [enabled, duration]);

  return isPulsing;
}

// Glow effect
export function useGlow(enabled: boolean = true, color: string = 'rgba(240, 120, 46, 0.5)') {
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsGlowing(false);
      return;
    }

    setIsGlowing(true);
  }, [enabled]);

  return {
    isGlowing,
    glowStyle: isGlowing
      ? {
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        }
      : {},
  };
}

// Magnetic effect
export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      setPosition({ x: deltaX, y: deltaY });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return {
    ref,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };
}

// Parallax effect
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setOffset({
        x: window.scrollX * speed,
        y: window.scrollY * speed,
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
}

// Tilt effect (3D)
export function useTilt(maxTilt: number = 10) {
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -maxTilt;
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, transform };
}

// Typing effect
export function useTyping(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

// Counter animation
export function useCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

// Spotlight effect
export function useSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);

    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return { ref, position };
}
