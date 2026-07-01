import React from 'react';
import { motion } from 'motion/react';
import { glassmorphism, shadows } from '../tokens';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${glassmorphism.card.background}
        backdrop-blur-xl
        ${glassmorphism.card.border}
        ${glassmorphism.card.boxShadow}
        rounded-2xl
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </Component>
  );
}
