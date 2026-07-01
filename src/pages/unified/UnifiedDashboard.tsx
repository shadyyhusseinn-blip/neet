import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { GlassCard, GlassBadge } from '../../design-system';
import { useAuthStore } from '../../stores/authStore';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <GlassCard hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </GlassCard>
  );
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

function ActivityItem({ title, description, time, status }: ActivityItem) {
  const statusIcons = {
    success: <CheckCircle size={16} className="text-green-400" />,
    warning: <AlertCircle size={16} className="text-yellow-400" />,
    error: <AlertCircle size={16} className="text-red-400" />,
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="mt-1">{statusIcons[status]}</div>
      <div className="flex-1">
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <span className="text-gray-500 text-xs">{time}</span>
    </div>
  );
}

export default function UnifiedDashboard() {
  const { user } = useAuthStore();
  const role = user?.role || 'admin';

  const stats = {
    admin: [
      { title: 'إجمالي الحجوزات', value: '156', icon: Calendar, trend: { value: 12, isPositive: true }, color: 'from-blue-500 to-cyan-500' },
      { title: 'العملاء النشطين', value: '89', icon: Users, trend: { value: 8, isPositive: true }, color: 'from-purple-500 to-pink-500' },
      { title: 'المعارض المنشورة', value: '34', icon: ImageIcon, trend: { value: 5, isPositive: true }, color: 'from-green-500 to-emerald-500' },
      { title: 'الإيرادات الشهرية', value: '45,000', icon: DollarSign, trend: { value: 15, isPositive: true }, color: 'from-amber-500 to-orange-500' },
    ],
    staff: [
      { title: 'حجوزاتي', value: '23', icon: Calendar, trend: { value: 10, isPositive: true }, color: 'from-blue-500 to-cyan-500' },
      { title: 'المعارض قيد المعالجة', value: '8', icon: ImageIcon, trend: { value: -2, isPositive: false }, color: 'from-purple-500 to-pink-500' },
      { title: 'المهام المكتملة', value: '45', icon: CheckCircle, trend: { value: 20, isPositive: true }, color: 'from-green-500 to-emerald-500' },
      { title: 'ساعات العمل', value: '168', icon: Clock, trend: { value: 5, isPositive: true }, color: 'from-amber-500 to-orange-500' },
    ],
    developer: [
      { title: 'حالة النظام', value: 'نشط', icon: TrendingUp, trend: { value: 0, isPositive: true }, color: 'from-green-500 to-emerald-500' },
      { title: 'السجلات النشطة', value: '0', icon: AlertCircle, trend: { value: 0, isPositive: true }, color: 'from-amber-500 to-orange-500' },
      { title: 'النسخ الاحتياطية', value: '3', icon: Clock, trend: { value: 0, isPositive: true }, color: 'from-blue-500 to-cyan-500' },
      { title: 'استخدام الذاكرة', value: '45%', icon: TrendingUp, trend: { value: 5, isPositive: false }, color: 'from-purple-500 to-pink-500' },
    ],
    'client-manager': [
      { title: 'العملاء', value: '45', icon: Users, trend: { value: 12, isPositive: true }, color: 'from-blue-500 to-cyan-500' },
      { title: 'المعارض النشطة', value: '28', icon: ImageIcon, trend: { value: 8, isPositive: true }, color: 'from-purple-500 to-pink-500' },
      { title: 'المعارض المنشورة', value: '22', icon: CheckCircle, trend: { value: 5, isPositive: true }, color: 'from-green-500 to-emerald-500' },
      { title: 'التحميلات', value: '156', icon: TrendingUp, trend: { value: 15, isPositive: true }, color: 'from-amber-500 to-orange-500' },
    ],
  };

  const activities: ActivityItem[] = [
    { title: 'حجز جديد', description: 'تم إنشاء حجز جديد للعميل أحمد محمد', time: 'منذ 5 دقائق', status: 'success' },
    { title: 'معرض منشور', description: 'تم نشر معرض حفل زفاف العروس', time: 'منذ 15 دقيقة', status: 'success' },
    { title: 'تنبيه النظام', description: 'استخدام الذاكرة مرتفع', time: 'منذ ساعة', status: 'warning' },
    { title: 'خطأ في الدفع', description: 'فشل معالجة الدفع للحجز #1234', time: 'منذ ساعتين', status: 'error' },
    { title: 'معرض مكتمل', description: 'تم إكمال معرض حفلة التخرج', time: 'منذ 3 ساعات', status: 'success' },
  ];

  const roleStats = stats[role] || stats.admin;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          مرحباً، {user?.name || 'المستخدم'}
        </h1>
        <p className="text-gray-400">
          {role === 'admin' && 'نظرة عامة على جميع جوانب النظام'}
          {role === 'staff' && 'نظرة عامة على مهامك وحجوزاتك'}
          {role === 'developer' && 'نظرة عامة على حالة النظام والأداء'}
          {role === 'client-manager' && 'نظرة عامة على إدارة المحتوى والعملاء'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">النشاط الأخير</h2>
              <GlassBadge variant="info">5 نشاطات</GlassBadge>
            </div>
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <ActivityItem 
                  key={index}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  status={activity.status}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">إجراءات سريعة</h2>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all text-right">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-400" size={20} />
                  <span className="text-white font-medium">حجز جديد</span>
                </div>
              </button>
              <button className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-right">
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-purple-400" size={20} />
                  <span className="text-white font-medium">معرض جديد</span>
                </div>
              </button>
              <button className="w-full p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all text-right">
                <div className="flex items-center gap-3">
                  <Users className="text-green-400" size={20} />
                  <span className="text-white font-medium">عميل جديد</span>
                </div>
              </button>
              {role === 'admin' && (
                <button className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all text-right">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-amber-400" size={20} />
                    <span className="text-white font-medium">التقارير</span>
                  </div>
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Upcoming Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">الحجوزات القادمة</h2>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">ح #{1000 + i}</h4>
                    <p className="text-gray-400 text-sm">غداً 2:00 م</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">حفل زفاف - فندق الريتز كارلتون</p>
                <GlassBadge variant="success" size="sm">مؤكد</GlassBadge>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
