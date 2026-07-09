import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Predefined shortcuts
export const commonShortcuts: Shortcut[] = [
  {
    key: 'k',
    ctrl: true,
    handler: () => {
      // Open command palette
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    },
    description: 'فتح لوحة الأوامر',
  },
  {
    key: 'b',
    ctrl: true,
    shift: true,
    handler: () => {
      // New booking
      window.location.href = '/admin/new-booking';
    },
    description: 'حجز جديد',
  },
  {
    key: 'd',
    ctrl: true,
    handler: () => {
      // Go to dashboard
      window.location.href = '/admin/dashboard';
    },
    description: 'لوحة التحكم',
  },
  {
    key: 'g',
    ctrl: true,
    handler: () => {
      // Go to galleries
      window.location.href = '/admin/public-galleries';
    },
    description: 'المعارض',
  },
  {
    key: 's',
    ctrl: true,
    handler: () => {
      // Go to settings
      window.location.href = '/admin/settings';
    },
    description: 'الإعدادات',
  },
  {
    key: 'Escape',
    handler: () => {
      // Close modals
      window.dispatchEvent(new CustomEvent('close-modals'));
    },
    description: 'إغلاق النوافذ',
  },
];
