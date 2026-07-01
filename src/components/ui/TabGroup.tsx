import { type ComponentType } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
}

interface TabGroupProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function TabGroup({ tabs, active, onChange, className }: TabGroupProps) {
  return (
    <div className={cn('tab-group', className)}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn('tab-item relative', isActive && 'text-text-main')}
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl bg-white/[0.08] border border-primary/25"
                style={{ boxShadow: '0 0 16px rgba(139, 124, 248, 0.12)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
