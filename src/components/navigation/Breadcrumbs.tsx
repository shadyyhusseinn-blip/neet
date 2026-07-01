import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  homePath?: string;
  className?: string;
  maxItems?: number;
}

export function Breadcrumbs({
  items,
  homePath = '/',
  className,
  maxItems = 5,
}: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbs = items || generateBreadcrumbs(location.pathname, homePath);

  // Truncate if too many items
  const displayItems = breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { label: '...', icon: () => null },
        ...breadcrumbs.slice(-maxItems + 2),
      ]
    : breadcrumbs;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-sm', className)}>
      <Link
        to={homePath}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
      >
        <Home size={16} />
      </Link>
      
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronLeft size={16} className="text-gray-600" />
          {item.path ? (
            <Link
              to={item.path}
              className={cn(
                'flex items-center gap-1 transition-colors',
                index === displayItems.length - 1
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {item.icon && <item.icon size={16} />}
              <span className="truncate max-w-[150px]">{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              {item.icon && <item.icon size={16} />}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string, homePath: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      path: index === pathSegments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

export function BreadcrumbItem({ item, isLast }: { item: BreadcrumbItem; isLast: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {item.icon && <item.icon size={16} className="text-gray-400" />}
      <span
        className={cn(
          'truncate max-w-[150px]',
          isLast ? 'text-white font-medium' : 'text-gray-400'
        )}
      >
        {item.label}
      </span>
    </div>
  );
}
