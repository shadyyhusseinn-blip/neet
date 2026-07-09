import { useState, useCallback } from 'react';
import { motion } from 'motion/react';

interface DragDropOptions<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  onDrop?: (item: T, targetIndex: number) => void;
  disabled?: boolean;
}

export function useEnhancedDragDrop<T extends { id: string }>({
  items,
  onReorder,
  onDrop,
  disabled = false,
}: DragDropOptions<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((item: T) => {
    if (disabled) return;
    setDraggedItem(item);
  }, [disabled]);

  const handleDragOver = useCallback((index: number) => {
    if (disabled || !draggedItem) return;
    setDragOverIndex(index);
  }, [disabled, draggedItem]);

  const handleDragEnd = useCallback(() => {
    if (disabled || !draggedItem || dragOverIndex === null) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    if (draggedIndex === -1 || draggedIndex === dragOverIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dragOverIndex, 0, removed);

    onReorder(newItems);
    onDrop?.(removed, dragOverIndex);

    setDraggedItem(null);
    setDragOverIndex(null);
  }, [disabled, draggedItem, dragOverIndex, items, onReorder, onDrop]);

  const createDraggableProps = (item: T, index: number) => ({
    draggable: !disabled,
    onDragStart: () => handleDragStart(item),
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      handleDragOver(index);
    },
    onDragEnd: handleDragEnd,
    className: draggedItem?.id === item.id ? 'opacity-50' : '',
  });

  return {
    draggedItem,
    dragOverIndex,
    createDraggableProps,
  };
}
