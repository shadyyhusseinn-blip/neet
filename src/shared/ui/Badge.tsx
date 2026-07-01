/**
 * Badge Component
 * مكون Badge لعرض الإشعارات والعدادات
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  count?: number;
  max?: number;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      count,
      max = 99,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-gray-500',
      primary: 'bg-purple-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    const sizes = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-sm px-2 py-0.5',
      lg: 'text-base px-2.5 py-1',
    };

    const dotSizes = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
    };

    const displayCount = count && max && count > max ? `${max}+` : count;

    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            'rounded-full',
            variants[variant],
            dotSizes[size],
            className
          )}
          {...props}
        />
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white font-semibold',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {displayCount !== undefined ? displayCount : children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Badge with wrapper component
 * يستخدم لعرض Badge بجانب عنصر آخر
 */
interface BadgeWrapperProps {
  children: React.ReactNode;
  badge?: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showZero?: boolean;
}

export function BadgeWrapper({
  children,
  badge,
  position = 'top-right',
  showZero = false,
}: BadgeWrapperProps) {
  const positions = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  if (!badge && !showZero) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-flex">
      {children}
      {badge && (
        <span className={cn('absolute transform -translate-x-1/2 -translate-y-1/2', positions[position])}>
          {badge}
        </span>
      )}
    </div>
  );
}
