import React from 'react';
import { motion } from 'motion/react';
import { Code, Settings, Activity, Database, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'settings',
    title: 'الإعدادات المتقدمة',
    description: 'إعدادات النظام والتكوين',
    icon: Settings,
    color: 'from-amber-500 to-orange-500',
    route: '/admin/developer/settings'
  },
  {
    id: 'logs',
    title: 'السجلات',
    description: 'عرض سجل النشاطات في النظام',
    icon: Activity,
    color: 'from-red-500 to-rose-500',
    route: '/admin/developer/logs'
  },
  {
    id: 'backup',
    title: 'النسخ الاحتياطي',
    description: 'إدارة النسخ الاحتياطية',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    route: '/admin/developer/backup'
  }
];

export default function DeveloperDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            أدوات المطور
          </h1>
          <p className="text-gray-400 mt-2">اختر القسم الذي تريد إدارته</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowRight size={16} />
          رجوع للبوابة
        </motion.button>
      </div>

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
              className="w-full h-full relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-amber-500/30 transition-all duration-500 text-right"
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

                <div className={`flex items-center gap-2 text-white font-semibold text-sm md:text-base bg-gradient-to-r ${section.color} px-4 py-2 md:py-3 rounded-xl group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300`}>
                  <span>الدخول</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
