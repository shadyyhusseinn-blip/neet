import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, AlertTriangle, AlertCircle, Info, Trash2, Check } from 'lucide-react';
import Badge from '../ui/Badge';

interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  date: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClear: (id: string) => void;
  onClearAll: () => void;
}

const typeVariant = {
  error: 'danger' as const,
  warning: 'warning' as const,
  info: 'primary' as const,
};

const typeIcon = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onClear,
  onClearAll,
}: NotificationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[450]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed right-4 top-20 w-[min(100vw-2rem,24rem)] modal-panel z-[500] overflow-hidden"
            dir="rtl"
          >
            <div className="p-4 flex items-center justify-between border-b border-main">
              <h3 className="flex items-center gap-2 font-semibold text-text-main">
                <Bell size={18} className="text-primary" /> الإشعارات
              </h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button type="button" className="text-xs text-danger hover:underline" onClick={onClearAll}>
                    حذف الكل
                  </button>
                )}
                <button type="button" className="btn-ghost p-2" onClick={onClose} aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="empty-state py-12">
                  <Check size={40} className="text-success opacity-60" />
                  <p className="font-medium text-text-muted">لا توجد إشعارات</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((notif) => {
                    const Icon = typeIcon[notif.type];
                    return (
                      <li
                        key={notif.id}
                        className="list-row items-start"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={typeVariant[notif.type]}>
                              {notif.type === 'error' ? 'خطأ' : notif.type === 'warning' ? 'تنبيه' : 'معلومة'}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-main">{notif.message}</p>
                          <span className="text-xs text-text-muted">
                            {new Date(notif.date).toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-ghost p-2 shrink-0"
                          onClick={() => onClear(notif.id)}
                          aria-label="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
