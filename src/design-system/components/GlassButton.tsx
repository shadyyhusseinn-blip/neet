import React from 'react';
import { motion } from 'motion/react';
import { glassmorphism, gradients } from '../tokens';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: gradients.primary,
    secondary: gradients.secondary,
    glass: glassmorphism.button.background,
    danger: gradients.error,
  };

  const borderStyles = {
    primary: 'border-transparent',
    secondary: 'border-transparent',
    glass: glassmorphism.button.border,
    danger: 'border-transparent',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        backdrop-blur-xl
        ${variantStyles[variant]}
        ${borderStyles[variant]}
        ${sizeClasses[size]}
        rounded-xl
        font-semibold
        text-white
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-center gap-2">
        {icon}
        {children}
      </div>
    </motion.button>
  );
}
