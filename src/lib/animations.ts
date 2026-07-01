import { Variants, Transition } from 'motion/react';

// Animation presets
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleOut: Variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.9 },
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: { opacity: 1, rotate: 0 },
};

export const bounce: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

export const pulse: Variants = {
  visible: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shake: Variants = {
  visible: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

export const spin: Variants = {
  visible: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};

export const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

// Modal animations
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
};

// Drawer animations
export const drawerOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const drawerContent: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
};

// Tooltip animations
export const tooltip: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
    },
  },
};

// Dropdown animations
export const dropdown: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Card hover animation
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Button press animation
export const buttonPress: Variants = {
  rest: { scale: 1 },
  press: { scale: 0.95 },
};

// Transition presets
export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.15, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
};

// Animation utilities
export function createStaggerAnimation(delay: number = 0.1) {
  return {
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  };
}

export function createSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 20
): Variants {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return {
    hidden: { opacity: 0, ...directions[direction] },
    visible: { opacity: 1, x: 0, y: 0 },
  };
}

export function createScaleAnimation(from: number = 0.9, to: number = 1): Variants {
  return {
    hidden: { opacity: 0, scale: from },
    visible: { opacity: 1, scale: to },
  };
}
