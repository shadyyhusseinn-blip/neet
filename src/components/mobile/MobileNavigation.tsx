import React, { useState } from 'react';
import { Home, Calendar, Users, Settings, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/admin' },
  { id: 'bookings', label: 'الحجوزات', icon: Calendar, path: '/admin/bookings', badge: 3 },
  { id: 'clients', label: 'العملاء', icon: Users, path: '/admin/clients' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/admin/settings' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleNavigate = (item: NavItem) => {
    setActiveTab(item.id);
    setIsOpen(false);
    // Navigate logic here
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050508]/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item)}
              className={cn(
                'flex flex-col items-center gap-1 relative',
                activeTab === item.id ? 'text-orange-500' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-1 h-1 bg-orange-500 rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-up Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0B0B0F] border-t border-white/10 rounded-t-3xl z-50 lg:hidden max-h-[70vh] overflow-hidden"
            >
              <div className="p-4">
                {/* Handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                
                {/* Menu Items */}
                <div className="space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
                        activeTab === item.id
                          ? 'bg-orange-500/10 border border-orange-500/20'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      )}
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        activeTab === item.id ? 'bg-orange-500/20 text-orange-500' : 'bg-white/10 text-gray-400'
                      )}>
                        <item.icon size={20} />
                      </div>
                      <span className={cn(
                        'flex-1 text-right',
                        activeTab === item.id ? 'text-white font-medium' : 'text-gray-300'
                      )}>
                        {item.label}
                      </span>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                  إغلاق
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/25 flex items-center justify-center text-white z-40 lg:hidden"
      >
        <Menu size={24} />
      </button>
    </>
  );
}

export function MobileTabBar() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050508]/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
              activeTab === item.id
                ? 'bg-orange-500/10 text-orange-500'
                : 'text-gray-400 hover:text-gray-300'
            )}
          >
            <div className="relative">
              <item.icon size={20} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
