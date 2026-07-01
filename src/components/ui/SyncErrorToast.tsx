import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SyncError {
  id: string;
  message: string;
  timestamp: number;
  retryCount: number;
}

export default function SyncErrorToast() {
  const [errors, setErrors] = useState<SyncError[]>([]);

  useEffect(() => {
    // Listen for sync errors
    const handleSyncError = (event: CustomEvent) => {
      const { message, retryCount } = event.detail;
      const newError: SyncError = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        timestamp: Date.now(),
        retryCount: retryCount || 0,
      };
      setErrors(prev => [newError, ...prev].slice(0, 5)); // Keep only last 5 errors
    };

    const handleSyncSuccess = () => {
      setErrors([]);
    };

    window.addEventListener('sync-error', handleSyncError as EventListener);
    window.addEventListener('sync-success', handleSyncSuccess);

    return () => {
      window.removeEventListener('sync-error', handleSyncError as EventListener);
      window.removeEventListener('sync-success', handleSyncSuccess);
    };
  }, []);

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const retrySync = (id: string) => {
    // Trigger retry for this specific error
    window.dispatchEvent(new CustomEvent('retry-sync', { detail: { errorId: id } }));
    dismissError(id);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-md',
              'bg-rose-500/10 border-rose-500/20'
            )}
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-rose-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-rose-400">فشل المزامنة</span>
                <span className="text-xs text-text-muted">{formatTime(error.timestamp)}</span>
              </div>
              <p className="text-sm text-text-muted mb-2 line-clamp-2">{error.message}</p>
              
              {error.retryCount > 0 && (
                <p className="text-xs text-amber-400 mb-2">
                  محاولة {error.retryCount}/3
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => retrySync(error.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors'
                  )}
                >
                  <RefreshCw size={12} />
                  إعادة المحاولة
                </button>
                
                <button
                  onClick={() => dismissError(error.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'bg-white/[0.05] text-text-muted hover:bg-white/[0.1] transition-colors'
                  )}
                >
                  <X size={12} />
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
