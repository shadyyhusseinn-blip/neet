import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Database, X } from 'lucide-react';
import { DataLossWarning } from '../../types/app';

interface DataLossWarningModalProps {
  isOpen: boolean;
  warning: DataLossWarning | null;
  onDismiss: () => void;
  onBackup: () => void;
}

export default function DataLossWarningModal({ isOpen, warning, onDismiss, onBackup }: DataLossWarningModalProps) {
  if (!isOpen || !warning) return null;

  const lastBackupDate = new Date(warning.lastBackupTime);
  const formattedDate = lastBackupDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <div className="modal-overlay" onClick={onDismiss} />
      <motion.div
        className="modal modal-danger"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="modal-header">
          <h3><AlertTriangle size={20} /> تحذير: فقدان البيانات!</h3>
          <button className="icon-btn" onClick={onDismiss}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="danger-alert">
            <p>تم اكتشاف تغييرات في البيانات من علامة تبويب أخرى.</p>
            <p>آخر نسخة احتياطية: <strong>{formattedDate}</strong></p>
            <p className="mt-2">قد تفقد بيانات إذا لم تقم بحفظها.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onDismiss}>تجاهل</button>
          <button className="btn btn-danger" onClick={onBackup}>
            <Database size={16} /> إنشاء نسخة احتياطية الآن
          </button>
        </div>
      </motion.div>
    </>
  );
}
