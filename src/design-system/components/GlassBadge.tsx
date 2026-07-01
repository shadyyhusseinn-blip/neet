import React from 'react';
import { motion } from 'motion/react';
import { gradients } from '../tokens';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassBadge({ children, variant = 'info', size = 'md', className = '' }: GlassBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    success: gradients.success,
    warning: gradients.warning,
    error: gradients.error,
    info: gradients.secondary,
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center
        backdrop-blur-xl
        ${variantStyles[variant]}
        ${sizeClasses[size]}
        rounded-full
        text-white
        font-medium
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
