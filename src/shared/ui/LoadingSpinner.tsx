import React from 'react';
import { cn } from '../../lib/utils';

/**
 * مكون Loading Spinner موحد
 * يستخدم لعرض مؤشر التحميل في جميع أنحاء التطبيق
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-purple-500 border-t-transparent',
    secondary: 'border-pink-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full',
        sizes[size],
        colors[color],
        className
      )}
    />
  );
};

/**
 * مكون Loading Page موحد
 * يستخدم لعرض صفحة تحميل كاملة
 */
interface LoadingPageProps {
  message?: string;
}

export const LoadingPage = ({ message = 'جاري التحميل...' }: LoadingPageProps) => {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" className="mx-auto mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
};

/**
 * مكون Loading Overlay موحد
 * يستخدم لعرض مؤشر تحميل فوق محتوى
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isLoading, message = 'جاري التحميل...' }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
        <LoadingSpinner size="lg" color="primary" className="mx-auto mb-4" />
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};
