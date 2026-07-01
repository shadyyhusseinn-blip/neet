import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  Users,
  ArrowRight,
  Plus,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function BookingsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'new-booking',
      title: 'حجز جديد',
      description: 'إضافة حجز جديد للعميل',
      icon: Plus,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      path: '/new-booking'
    },
    {
      id: 'bookings',
      title: 'سجل الحجوزات',
      description: 'عرض وإدارة جميع الحجوزات',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      path: '/admin/bookings'
    },
    {
      id: 'booking-requests',
      title: 'طلبات الحجز',
      description: 'الطلبات المعلقة والقادمة',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      path: '/admin/booking-requests'
    },
    {
      id: 'accounts',
      title: 'المحاسبة',
      description: 'إدارة الحسابات والمالية',
      icon: Wallet,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      path: '/accounts'
    },
    {
      id: 'staff',
      title: 'الموظفين',
      description: 'إدارة الموظفين والمهام',
      icon: Users,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/30',
      path: '/admin/staff'
    },
    {
      id: 'reports',
      title: 'التقارير',
      description: 'تقارير وإحصائيات مفصلة',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/30',
      path: '/admin/reports'
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            الحجوزات والحسابات
          </h1>
          <p className="text-gray-400">إدارة الحجوزات والموظفين والمالية</p>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(section.path)}
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
