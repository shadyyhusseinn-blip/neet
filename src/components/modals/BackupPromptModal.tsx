import { Database, AlertTriangle, FolderOpen } from 'lucide-react';
import ModalShell from '../ui/ModalShell';

interface BackupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBackup: () => void;
}

export default function BackupPromptModal({ isOpen, onClose, onCreateBackup }: BackupPromptModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="تأمين البيانات"
      subtitle="يُنصح بتحديد مجلد للنسخ الاحتياطي التلقائي"
      maxWidth="md"
      icon={
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'var(--gradient-brand)' }}>
          <Database size={22} />
        </div>
      }
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            لاحقاً
          </button>
          <button type="button" onClick={onCreateBackup} className="btn-primary">
            <FolderOpen size={18} />
            اختيار المجلد
          </button>
        </>
      }
    >
      <div className="p-4 rounded-xl bg-warning/10 border border-warning/25 flex gap-4">
        <AlertTriangle className="text-warning shrink-0" size={24} />
        <p className="text-sm text-text-main leading-relaxed">
          لم يُحدد مجلد النسخ الاحتياطي بعد. اختر مجلداً على جهازك لحفظ نسخة تلقائية وتجنب فقدان البيانات.
        </p>
      </div>
    </ModalShell>
  );
}
