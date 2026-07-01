import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { glassmorphism } from '../tokens';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassModal({ isOpen, onClose, children, title, size = 'md' }: GlassModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`
              fixed inset-0 z-50
              ${glassmorphism.modal.background}
              backdrop-blur-sm
              flex items-center justify-center p-4
            `}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                relative
                ${glassmorphism.card.background}
                backdrop-blur-xl
                ${glassmorphism.card.border}
                ${glassmorphism.card.boxShadow}
                rounded-2xl
                ${sizeClasses[size]}
                w-full
                max-h-[90vh]
                overflow-y-auto
              `}
            >
              {title && (
                <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
