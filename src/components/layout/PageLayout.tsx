import { Fragment, ReactNode, type ComponentType } from 'react';
import { motion } from 'motion/react';
import ViewShell from './ViewShell';
import StatCard from '../ui/StatCard';
import TabGroup, { type TabItem } from '../ui/TabGroup';
import { cn } from '../../lib/utils';

interface StatItem {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  suffix?: string;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  stats?: StatItem[];
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function PageLayout({
  title,
  subtitle,
  actions,
  stats,
  tabs,
  activeTab,
  onTabChange,
  toolbar,
  children,
  className,
}: PageLayoutProps) {
  return (
    <ViewShell title={title} subtitle={subtitle} actions={actions} className={className}>
      {stats && stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className={cn(
            'grid gap-4',
            // Mobile: 1 column
            'grid-cols-1',
            // Tablet: 2 columns
            'md:grid-cols-2',
            // Desktop: 4 columns (or 3 if only 3 stats)
            stats.length === 3 && 'lg:grid-cols-3',
            stats.length >= 4 && 'lg:grid-cols-4'
          )}
        >
          {stats.map((s) => (
            <Fragment key={s.label}>
              <StatCard
                label={s.label}
                value={s.value}
                hint={s.hint}
                icon={s.icon}
                suffix={s.suffix}
              />
            </Fragment>
          ))}
        </motion.div>
      )}

      {(tabs || toolbar) && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {tabs && activeTab && onTabChange && (
            <TabGroup tabs={tabs} active={activeTab} onChange={onTabChange} />
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">{toolbar}</div>}
        </div>
      )}

      {children}
    </ViewShell>
  );
}
