import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
}

const widths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  icon,
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn('relative w-full modal-panel overflow-hidden', widths[maxWidth])}
          >
            <div className="p-5 md:p-6 border-b border-main flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {icon}
                <div>
                  <h2 className="text-lg font-display font-semibold text-text-main">{title}</h2>
                  {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button type="button" onClick={onClose} className="btn-ghost p-2 shrink-0" aria-label="إغلاق">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 md:p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
            {footer && (
              <div className="p-5 md:p-6 border-t border-main flex flex-wrap gap-2 justify-end bg-white/[0.02]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
