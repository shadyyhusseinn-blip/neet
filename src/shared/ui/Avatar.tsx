/**
 * Avatar Component
 * مكون Avatar لعرض الصور الشخصية
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square' | 'rounded';
  fallback?: string;
  initials?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      size = 'md',
      variant = 'circle',
      fallback,
      initials,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const variants = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-xl',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold overflow-hidden',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <span>{getInitials(initials)}</span>
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          <User size={size === 'xl' ? 32 : size === 'lg' ? 24 : size === 'md' ? 20 : 16} />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * Avatar Group Component
 * لعرض مجموعة من الصور الشخصية
 */
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ children, max = 3, size = 'md', className }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const offsets = {
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5',
  };

  return (
    <div className={cn('flex items-center', offsets[size], className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative" style={{ zIndex: max - index }}>
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center bg-gray-700 text-white font-semibold rounded-full border-2 border-[#050508]',
            size === 'sm' && 'w-8 h-8 text-xs',
            size === 'md' && 'w-10 h-10 text-sm',
            size === 'lg' && 'w-12 h-12 text-base',
            size === 'xl' && 'w-16 h-16 text-lg'
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
