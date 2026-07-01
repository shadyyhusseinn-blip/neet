import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ViewShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ViewShell({ title, subtitle, actions, children, className }: ViewShellProps) {
  return (
    <div className={cn('view-page', className)}>
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-heading">
            <span className="gradient-text">{title}</span>
          </h1>
          {subtitle && <p className="page-subtitle mt-2">{subtitle}</p>}
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="flex flex-wrap items-center gap-2"
          >
            {actions}
          </motion.div>
        )}
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
