import React from 'react';
import { cn } from '../../lib/utils';
import { theme } from './theme';

/**
 * مكون Card موحد
 * يستخدم لعرض المحتوى في بطاقات منظمة
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white/5 border border-white/10',
      glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
      elevated: 'bg-white/5 border border-white/10 shadow-xl shadow-purple-500/10',
      bordered: 'bg-transparent border-2 border-white/20',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          variants[variant],
          paddings[padding],
          hover && 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mb-4', className)} {...props}>
        {title && (
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        )}
        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mt-4 pt-4 border-t border-white/10 flex items-center gap-2', className)} {...props} />
    );
  }
);

CardFooter.displayName = 'CardFooter';
