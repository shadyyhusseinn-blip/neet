import {
  Package,
  Users,
  Archive,
  Home,
  Settings,
  LogOut,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { audioService } from '../../services/audio';

const NAV_ITEMS = [
  { id: 'new-booking', label: 'حجز جديد', icon: Package, path: '/admin/new-booking' },
  { id: 'bookings-accounts', label: 'حسابات', icon: Users, path: '/admin/bookings-accounts' },
  { id: 'bookings-management', label: 'إدارة', icon: Archive, path: '/admin/bookings-management' },
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/admin/settings' },
];

interface BottomNavigationProps {
  onLogout?: () => void;
}

export default function BottomNavigation({ onLogout }: BottomNavigationProps) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] bg-[#050508]/95 backdrop-blur-xl border-t border-white/10">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16 md:h-20">
          {NAV_ITEMS.map((item) => {
            const isActive = activeItem === item.path;
            const isLogout = item.id === 'logout';

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  audioService.playClick();
                  if (isLogout && onLogout) {
                    onLogout();
                  }
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300',
                  'min-w-[60px] md:min-w-[80px]',
                  isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                )}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-primary' : 'text-text-muted'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] md:text-xs font-medium transition-all',
                    isActive ? 'text-primary' : 'text-text-muted'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => {
              audioService.playClick();
              if (onLogout) onLogout();
            }}
            className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px] md:min-w-[80px] text-text-muted hover:text-red-500"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} strokeWidth={2} />
            </motion.div>
            <span className="text-[10px] md:text-xs font-medium">خروج</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
