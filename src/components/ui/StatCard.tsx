import { type ComponentType } from 'react';
import { motion } from 'motion/react';
import { cn, toArabicDigits } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  suffix?: string;
  trend?: 'up' | 'down';
  className?: string;
}

export default function StatCard({ label, value, hint, icon: Icon, suffix, className }: StatCardProps) {
  const display =
    typeof value === 'number' ? toArabicDigits(value.toLocaleString('ar-EG')) : value;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn('metric-tile space-y-3', className)}
    >
      <div className="flex items-start justify-between gap-2">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-text-muted mb-1">{label}</p>
        <p className="text-2xl font-bold tabular-nums font-display tracking-tight">
          {display}
          {suffix && typeof value === 'number' && (
            <span className="text-sm font-normal text-text-muted mr-1">{suffix}</span>
          )}
        </p>
      </div>
      {hint && <p className="text-[11px] text-primary/70">{hint}</p>}
    </motion.div>
  );
}
