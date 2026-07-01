import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      variant = 'default',
      size = 'md',
      fullWidth = true,
      disabled,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => {
      if (onRightIconClick) {
        onRightIconClick();
      } else {
        setShowPassword(!showPassword);
      }
    };

    const baseStyles = 'transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: 'bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
      filled: 'bg-white/10 border-transparent focus:bg-white/15 focus:border-orange-500',
      outlined: 'bg-transparent border-2 border-white/20 focus:border-orange-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-5 py-2.5 text-base rounded-lg',
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-gray-300 dark:text-gray-400">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              fullWidth && 'w-full',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <button
              type="button"
              onClick={togglePassword}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              disabled={disabled}
            >
              {rightIcon}
            </button>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
