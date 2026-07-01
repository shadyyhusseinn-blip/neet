import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Toast } from '../types/app';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const getIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={18} className="text-success" />;
    case 'error':
      return <AlertCircle size={18} className="text-danger" />;
    default:
      return <Info size={18} className="text-primary" />;
  }
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed left-5 bottom-5 z-[600] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] modal-panel p-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-sm font-medium text-text-main">{toast.message}</span>
            <button className="btn-ghost p-1.5" onClick={() => onRemove(toast.id)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
