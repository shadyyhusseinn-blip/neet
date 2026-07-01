import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

const variants = {
  primary: 'badge-primary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  muted: 'badge-muted',
};

export default function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>;
}
