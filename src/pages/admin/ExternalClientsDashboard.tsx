import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Image, FileText, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const SECTIONS = [
  {
    id: 'management',
    title: 'إدارة العملاء',
    description: 'التحكم الكامل في إعدادات العملاء',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    route: '/admin/client-management'
  },
  {
    id: 'galleries',
    title: 'المعرض العام',
    description: 'إدارة المعرض العام للعملاء',
    icon: Image,
    color: 'from-blue-500 to-cyan-500',
    route: '/admin/content'
  },
  {
    id: 'deliveries',
    title: 'تسليمات العملاء',
    description: 'إدارة تسليمات الصور للعملاء',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    route: '/admin/client-deliveries'
  }
];

export default function ExternalClientsDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();

  // Firebase Auth protection
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isLoggedIn, user, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
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
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/selection')}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                إدارة العملاء الخارجية
              </h1>
              <p className="text-gray-400 text-sm">التحكم في المحتوى العام للعملاء</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm flex items-center gap-2"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full px-4 pb-8 pt-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          <div className="grid md:grid-cols-3 gap-6">
            {SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(section.route)}
                  className="w-full h-full relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500 text-right"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon size={32} className="md:size-40 text-white" />
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
                      {section.title}
                    </h3>

                    <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 flex-grow">
                      {section.description}
                    </p>

                    <div className={`flex items-center gap-2 text-white font-semibold text-sm md:text-base bg-gradient-to-r ${section.color} px-4 py-2 md:py-3 rounded-xl group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300`}>
                      <span>الدخول</span>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
