import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Package,
  Images,
  FileText,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Lock
} from 'lucide-react';

export default function ContentPage() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'landing',
      title: 'صفحة الافتتاحية',
      description: 'تحكم في صفحة الافتتاحية الرئيسية',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      path: '/admin/landing'
    },
    {
      id: 'packages',
      title: 'الباقات',
      description: 'إدارة باقات التصوير والأسعار',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      path: '/packages'
    },
    {
      id: 'galleries',
      title: 'المعارض',
      description: 'إدارة معارض الصور والألبومات',
      icon: Images,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      path: '/admin/galleries'
    },
    {
      id: 'landing-pages',
      title: 'الصفحات الخارجية',
      description: 'إدارة الصفحات الخارجية المخصصة',
      icon: LayoutGrid,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      path: '/admin/landing-pages'
    },
    {
      id: 'client-deliveries',
      title: 'تسليم الشغل',
      description: 'إدارة تسليمات العملاء',
      icon: Lock,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/30',
      path: '/admin/client-deliveries'
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'تعديل معرض الأعمال العام',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/30',
      path: '/portfolio',
      external: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
            إدارة صفحات العميل
          </h1>
          <p className="text-gray-400">تحكم في المحتوى الظاهر للعملاء</p>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => section.external ? window.open(section.path, '_blank') : navigate(section.path)}
              className="glass-panel group cursor-pointer text-right p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${section.bgColor} border ${section.borderColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <section.icon size={32} className={`bg-gradient-to-r ${section.color} bg-clip-text text-transparent`} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
