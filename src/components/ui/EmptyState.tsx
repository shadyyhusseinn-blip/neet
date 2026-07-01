import { type ComponentType, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <p className="font-semibold text-text-main">{title}</p>
      {description && <p className="text-sm text-text-muted max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
