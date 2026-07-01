import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`p-4 rounded-xl border ${getBackgroundColor(notification.type)} backdrop-blur-lg`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for using notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message: string, duration?: number) => addNotification('success', message, duration);
  const error = (message: string, duration?: number) => addNotification('error', message, duration);
  const info = (message: string, duration?: number) => addNotification('info', message, duration);
  const warning = (message: string, duration?: number) => addNotification('warning', message, duration);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  };
}

// Notification Button Component
export function NotificationButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      <Bell size={20} className="text-gray-400" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
