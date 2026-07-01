import React from 'react';
import { cn } from '../../lib/utils';
import { theme } from './theme';

/**
 * مكون Input موحد
 * يدعم أنواع مختلفة من المدخلات
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050508]';

    const variants = {
      default: 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500',
      filled: 'bg-white/10 border-none text-white placeholder-gray-500 focus:bg-white/15 focus:ring-purple-500',
      outlined: 'bg-transparent border-2 border-white/20 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500',
    };

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseStyles,
              variants[variant],
              errorStyles,
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * مكون Textarea موحد
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050508] resize-none';

    const variants = {
      default: 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500',
      filled: 'bg-white/10 border-none text-white placeholder-gray-500 focus:bg-white/15 focus:ring-purple-500',
      outlined: 'bg-transparent border-2 border-white/20 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500',
    };

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            baseStyles,
            variants[variant],
            errorStyles,
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * مكون Select موحد
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050508] bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-purple-500';

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(baseStyles, errorStyles, className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
