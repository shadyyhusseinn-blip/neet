import React from 'react';
import { Sun, Moon, Search, Bell, User, Camera } from 'lucide-react';
import SyncStatus from '../ui/SyncStatus';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notifications: unknown[];
  onOpenNotifications: () => void;
  onOpenCommandPalette: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  onOpenCommandPalette,
}: HeaderProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-30 px-2 sm:px-4 py-3 sm:py-4 bg-gradient-to-b from-[#050508]/95 to-[#050508]/90 backdrop-blur-2xl border-b border-white/10 shadow-lg" dir="rtl">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}
          >
            <Camera size={18} sm:size={22} strokeWidth={1.75} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-base font-bold text-white">شادي حسين</h1>
            <p className="text-[10px] sm:text-xs text-text-muted">لوحة التحكم</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex-1 max-w-2xl group">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300 pointer-events-none sm:right-4 sm:size-17"
            />
            <input
              onFocus={onOpenCommandPalette}
              readOnly
              placeholder="ابحث..."
              className="field-input h-10 sm:h-12 pr-10 sm:pr-12 pl-3 sm:pl-4 w-full cursor-pointer bg-white/[0.07] hover:bg-white/[0.12] text-xs sm:text-sm rounded-xl"
            />
            <kbd className="hidden sm:flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/[0.1] border border-white/10 text-[9px] sm:text-[10px] text-text-muted font-mono">
              Ctrl+K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="hidden lg:inline digital-clock text-xs sm:text-sm tabular-nums px-2 sm:px-3 text-text-muted">{timeStr}</span>

          <SyncStatus />

          <button onClick={onOpenNotifications} className="btn-ghost p-2 sm:p-2.5 relative" aria-label="إشعارات">
            <Bell size={16} sm:size={18} />
            <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-accent animate-pulse" />
          </button>

          <button onClick={onToggleTheme} className="btn-ghost p-2 sm:p-2.5" aria-label="المظهر">
            {isDarkMode ? <Sun size={16} sm:size={18} /> : <Moon size={16} sm:size={18} />}
          </button>

          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}
          >
            <User size={16} sm:size={18} strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </header>
  );
}
