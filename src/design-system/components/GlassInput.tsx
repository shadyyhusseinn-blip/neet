import React from 'react';
import { glassmorphism } from '../tokens';

interface GlassInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function GlassInput({ label, error, icon, className = '', ...props }: GlassInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full
            ${glassmorphism.button.background}
            backdrop-blur-xl
            ${glassmorphism.button.border}
            rounded-xl
            px-4 py-3
            text-white
            placeholder:text-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-orange-500/50
            focus:border-orange-500/50
            transition-all
            ${icon ? 'pr-10' : ''}
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
