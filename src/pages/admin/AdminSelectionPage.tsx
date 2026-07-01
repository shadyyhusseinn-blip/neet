import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Shield, ArrowRight, Camera, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'admin',
    title: 'المصور / المدير',
    description: 'لوحة تحكم شاملة لإدارة الحجوزات، المعارض، العملاء، وإعدادات النظام',
    icon: Camera,
    color: 'from-purple-500 to-pink-500',
    features: ['إدارة الحجوزات', 'إدارة المعارض', 'إدارة العملاء', 'الإعدادات الكاملة'],
    route: '/admin'
  },
  {
    id: 'staff',
    title: 'الموظفين',
    description: 'لوحة تحكم للموظفين لعرض المهام المخصصة والجدول الزمني',
    icon: UserCheck,
    color: 'from-blue-500 to-cyan-500',
    features: ['عرض المهام', 'الجدول الزمني', 'الحالة', 'التنبيهات'],
    route: '/staff/dashboard'
  }
];

export default function AdminSelectionPage() {
  const navigate = useNavigate();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

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
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-gray-400 text-sm">اختر القسم الذي تريد إدارته</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/login')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
          >
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
                onHoverStart={() => setHoveredSection(section.id)}
                onHoverEnd={() => setHoveredSection(null)}
                className="group"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(section.route)}
                  className="w-full h-full relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500 text-right"
                >
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon size={32} className="md:size-40 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
                      {section.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 flex-grow">
                      {section.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-4 md:mb-6">
                      {section.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className={`flex items-center gap-2 text-white font-semibold text-sm md:text-base bg-gradient-to-r ${section.color} px-4 py-2 md:py-3 rounded-xl group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300`}>
                      <span>الدخول</span>
                      <ArrowRight size={16} className="md:size-20 group-hover:-translate-x-1 transition-transform" />
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
