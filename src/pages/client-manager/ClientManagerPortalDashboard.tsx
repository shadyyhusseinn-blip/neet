import React from 'react';
import { motion } from 'motion/react';
import { Palette, Users, Image as ImageIcon, Layout, Globe, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const CLIENT_MANAGER_MENU = [
  {
    id: 'dashboard',
    title: 'لوحة التحكم',
    description: 'نظرة عامة على إدارة الصفحة',
    icon: Palette,
    path: '/client-manager/dashboard',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'clients',
    title: 'إدارة العملاء',
    description: 'إدارة بيانات العملاء والطلبات',
    icon: Users,
    path: '/client-manager/clients',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'galleries',
    title: 'إدارة المعرض',
    description: 'إدارة الصور والمعارض',
    icon: ImageIcon,
    path: '/client-manager/galleries',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'appearance',
    title: 'المظهر والتخطيط',
    description: 'تخصيص شكل الصفحة',
    icon: Layout,
    path: '/client-manager/appearance',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'public-galleries',
    title: 'المعارض العامة',
    description: 'إدارة المعارض المنشورة',
    icon: Globe,
    path: '/client-manager/public-galleries',
    color: 'from-rose-500 to-red-500'
  }
];

export default function ClientManagerPortalDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentIndex = CLIENT_MANAGER_MENU.findIndex(item => item.path === location.pathname);
  const prevItem = currentIndex > 0 ? CLIENT_MANAGER_MENU[currentIndex - 1] : null;
  const nextItem = currentIndex < CLIENT_MANAGER_MENU.length - 1 ? CLIENT_MANAGER_MENU[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (prevItem) navigate(prevItem.path);
  };

  const handleNext = () => {
    if (nextItem) navigate(nextItem.path);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-500/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Palette size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                بوابة إدارة الصفحة الخارجية
              </h1>
              <p className="text-gray-400 mt-1">إدارة المحتوى والعملاء والمعارض</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(prevItem || nextItem) && (
              <div className="flex items-center gap-2">
                {prevItem && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-green-500/30 transition-all flex items-center gap-2"
                  >
                    <ChevronRight size={16} />
                    {prevItem.title}
                  </motion.button>
                )}
                {nextItem && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-green-500/30 transition-all flex items-center gap-2"
                  >
                    {nextItem.title}
                    <ChevronLeft size={16} />
                  </motion.button>
                )}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLIENT_MANAGER_MENU.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right hover:border-green-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-400" size={20} />
              <span className="text-gray-400 text-sm">إجمالي العملاء</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="text-blue-400" size={20} />
              <span className="text-gray-400 text-sm">المعارض النشطة</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="text-purple-400" size={20} />
              <span className="text-gray-400 text-sm">المعارض المنشورة</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
