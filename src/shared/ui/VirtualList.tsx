/**
 * Virtual List Component
 * مكون Virtual Scrolling لعرض القوائم الطويلة بكفاءة
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const { startIndex, endIndex } = getVisibleRange(scrollTop, containerHeight, itemHeight, items.length);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={cn('overflow-y-auto custom-scrollbar', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to calculate visible range
 */
function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
): { startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  return {
    startIndex: Math.max(0, startIndex),
    endIndex: Math.min(totalItems - 1, endIndex),
  };
}

/**
 * Virtual Grid Component
 * مكون Virtual Grid لعرض الشبكات الطويلة
 */

interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  containerHeight: number;
  containerWidth: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemWidth,
  containerHeight,
  containerWidth,
  renderItem,
  gap = 16,
  className,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const columns = Math.floor(containerWidth / (itemWidth + gap));
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap);

  const { startRow, endRow } = getVisibleRowRange(scrollTop, containerHeight, itemHeight + gap, rows);

  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        visibleItems.push({ item: items[index], index, row, col });
      }
    }
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={cn('overflow-y-auto custom-scrollbar', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startRow * (itemHeight + gap)}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
              gap: `${gap}px`,
            }}
          >
            {visibleItems.map(({ item, index }) => (
              <div
                key={index}
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getVisibleRowRange(
  scrollTop: number,
  containerHeight: number,
  rowHeight: number,
  totalRows: number
): { startRow: number; endRow: number } {
  const startRow = Math.floor(scrollTop / rowHeight);
  const endRow = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight)
  );
  
  return {
    startRow: Math.max(0, startRow),
    endRow: Math.min(totalRows - 1, endRow),
  };
}
