import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  closable?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  variant?: 'default' | 'pills' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  draggable?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onTabAdd,
  onTabReorder,
  variant = 'default',
  size = 'md',
  draggable = false,
  className,
}: TabsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndexRef.current = index;
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index && onTabReorder) {
      onTabReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  const variants = {
    default: 'bg-white/5 border border-white/10 rounded-t-lg',
    pills: 'bg-transparent',
    underlined: 'bg-transparent border-b-2 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2 mb-4">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable={draggable && !tab.disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative flex items-center gap-2 transition-all duration-200',
              variants[variant],
              sizes[size],
              activeTab === tab.id
                ? variant === 'underlined'
                  ? 'border-orange-500 text-orange-500'
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5',
              tab.disabled && 'opacity-50 cursor-not-allowed',
              draggable && 'cursor-move'
            )}
            style={{
              opacity: draggedIndex === index ? 0.5 : 1,
            }}
          >
            {draggable && <GripVertical size={14} className="text-gray-500" />}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <button
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className="flex-1 text-right"
            >
              {tab.label}
            </button>
            {tab.closable && onTabClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {onTabAdd && (
          <button
            onClick={onTabAdd}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors',
              sizes[size]
            )}
          >
            <Plus size={16} />
            إضافة
          </button>
        )}
      </div>

      <div className="relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'transition-all duration-200',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2 mb-4', className)}>{children}</div>;
}

export function TabTrigger({
  isActive,
  onClick,
  children,
  disabled,
  className,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 text-sm rounded-lg transition-all duration-200',
        isActive
          ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500'
          : 'text-gray-400 hover:text-white hover:bg-white/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
