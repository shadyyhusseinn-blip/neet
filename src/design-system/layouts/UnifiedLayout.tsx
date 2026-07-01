import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GlassCard, glassmorphism } from '../index';
import { useAuthStore } from '../../stores/authStore';

interface NavItem {
  id: string;
  title: string;
  icon: any;
  path: string;
  badge?: number;
}

interface UnifiedLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'staff' | 'developer' | 'client-manager';
}

const roleBasedNav: Record<string, NavItem[]> = {
  admin: [
    { id: 'dashboard', title: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin/selection' },
    { id: 'bookings', title: 'الحجوزات', icon: Calendar, path: '/admin/bookings', badge: 3 },
    { id: 'galleries', title: 'المعارض', icon: ImageIcon, path: '/admin/galleries' },
    { id: 'clients', title: 'العملاء', icon: Users, path: '/admin/external-clients' },
    { id: 'settings', title: 'الإعدادات', icon: Settings, path: '/admin/settings' },
  ],
  staff: [
    { id: 'dashboard', title: 'لوحة الموظفين', icon: LayoutDashboard, path: '/staff/dashboard' },
    { id: 'bookings', title: 'الحجوزات', icon: Calendar, path: '/staff/bookings' },
    { id: 'galleries', title: 'المعارض', icon: ImageIcon, path: '/staff/galleries' },
  ],
  developer: [
    { id: 'dashboard', title: 'لوحة المطور', icon: LayoutDashboard, path: '/developer' },
    { id: 'settings', title: 'الإعدادات', icon: Settings, path: '/developer/settings' },
    { id: 'logs', title: 'السجلات', icon: Bell, path: '/developer/logs' },
    { id: 'backup', title: 'النسخ الاحتياطي', icon: Settings, path: '/developer/backup' },
  ],
  'client-manager': [
    { id: 'dashboard', title: 'لوحة الإدارة', icon: LayoutDashboard, path: '/client-manager' },
    { id: 'clients', title: 'العملاء', icon: Users, path: '/client-manager/clients' },
    { id: 'galleries', title: 'المعارض', icon: ImageIcon, path: '/client-manager/galleries' },
    { id: 'public', title: 'المعارض العامة', icon: ImageIcon, path: '/client-manager/public-galleries' },
  ],
};

const roleColors: Record<string, string> = {
  admin: 'from-purple-500 to-pink-500',
  staff: 'from-blue-500 to-cyan-500',
  developer: 'from-amber-500 to-orange-500',
  'client-manager': 'from-green-500 to-emerald-500',
};

export function UnifiedLayout({ children, role }: UnifiedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  
  const navItems = roleBasedNav[role] || [];
  const currentColor = roleColors[role] || 'from-gray-500 to-gray-600';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-40
        ${glassmorphism.card.background}
        backdrop-blur-xl
        border-b border-white/10
        h-16
      `}>
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className={`flex items-center gap-3 bg-gradient-to-r ${currentColor} p-2 rounded-xl`}>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <LayoutDashboard size={16} />
              </div>
              <span className="font-bold text-sm">نظام التصوير</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="بحث..."
                className={`
                  w-64
                  ${glassmorphism.button.background}
                  backdrop-blur-xl
                  border border-white/10
                  rounded-xl
                  pr-10 pl-4 py-2
                  text-sm
                  text-white
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-500/50
                `}
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed top-16 right-0 bottom-0 z-30
              w-72
              ${glassmorphism.card.background}
              backdrop-blur-xl
              border-l border-white/10
              overflow-y-auto
            `}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full
                      flex items-center gap-3
                      p-3 rounded-xl
                      transition-all
                      ${isActive 
                        ? `bg-gradient-to-r ${currentColor} text-white` 
                        : 'hover:bg-white/10 text-gray-300'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-right">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 mt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">إجراءات سريعة</h3>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-right text-sm">
                  حجز جديد
                </button>
                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-right text-sm">
                  معرض جديد
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`
        pt-16
        transition-all
        ${sidebarOpen ? 'mr-72' : 'mr-0'}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
