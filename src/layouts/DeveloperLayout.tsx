import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Activity, Database, Code, LogOut, ChevronLeft, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'الرئيسية', icon: Code, path: '/admin/developer/dashboard' },
  { id: 'settings', label: 'الإعدادات المتقدمة', icon: Settings, path: '/admin/developer/settings' },
  { id: 'logs', label: 'السجلات', icon: Activity, path: '/admin/developer/logs' },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: Database, path: '/admin/developer/backup' },
];

export default function DeveloperLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Firebase Auth protection with role check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (user?.role !== 'admin' && user?.role !== 'developer') {
      navigate('/login'); // Redirect to main login if not authorized
    }
  }, [isLoggedIn, user, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif] overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#050508]" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-72 bg-black/60 backdrop-blur-2xl border-l border-white/10 z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  أدوات المطور
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full flex">
        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 z-30 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <Code size={24} />}
        </motion.button>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
