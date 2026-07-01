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
  ArrowDownRight,
  Settings,
  Bell,
  Search,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../../design-system';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

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

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = [
    { title: 'إجمالي الحجوزات', value: '156', icon: Calendar, trend: { value: 12, isPositive: true }, color: 'from-blue-500 to-cyan-500' },
    { title: 'العملاء النشطين', value: '89', icon: Users, trend: { value: 8, isPositive: true }, color: 'from-purple-500 to-pink-500' },
    { title: 'المعارض المنشورة', value: '34', icon: ImageIcon, trend: { value: 5, isPositive: true }, color: 'from-green-500 to-emerald-500' },
    { title: 'الإيرادات الشهرية', value: '45,000', icon: DollarSign, trend: { value: 15, isPositive: true }, color: 'from-amber-500 to-orange-500' },
  ];

  const activities: ActivityItem[] = [
    { title: 'حجز جديد', description: 'تم إنشاء حجز جديد للعميل أحمد محمد', time: 'منذ 5 دقائق', status: 'success' },
    { title: 'معرض منشور', description: 'تم نشر معرض حفل زفاف العروس', time: 'منذ 15 دقيقة', status: 'success' },
    { title: 'تنبيه النظام', description: 'استخدام الذاكرة مرتفع', time: 'منذ ساعة', status: 'warning' },
    { title: 'خطأ في الدفع', description: 'فشل معالجة الدفع للحجز #1234', time: 'منذ ساعتين', status: 'error' },
    { title: 'معرض مكتمل', description: 'تم إكمال معرض حفلة التخرج', time: 'منذ 3 ساعات', status: 'success' },
  ];

  const navItems = [
    { id: 'dashboard', title: 'لوحة التحكم', icon: LayoutDashboard, active: true },
    { id: 'bookings', title: 'الحجوزات', icon: Calendar, active: false },
    { id: 'galleries', title: 'المعارض', icon: ImageIcon, active: false },
    { id: 'clients', title: 'العملاء', icon: Users, active: false },
    { id: 'settings', title: 'الإعدادات', icon: Settings, active: false },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <LayoutDashboard size={16} />
              </div>
              <span className="font-bold text-sm">نظام التصوير</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
      <aside className="fixed top-16 right-0 bottom-0 z-30 w-72 bg-black/50 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all
                  ${item.active 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'hover:bg-white/10 text-gray-300'
                  }
                `}
              >
                <Icon size={20} />
                <span className="flex-1 text-right">{item.title}</span>
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
      </aside>

      {/* Main Content */}
      <main className="mr-72 pt-16">
        <div className="p-6">
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
              نظرة عامة على جميع جوانب النظام
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
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
                  <button className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all text-right text-sm flex items-center gap-3">
                    <Calendar size={20} className="text-blue-400" />
                    <span className="text-white font-medium">حجز جديد</span>
                  </button>
                  <button className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-right text-sm flex items-center gap-3">
                    <ImageIcon size={20} className="text-purple-400" />
                    <span className="text-white font-medium">معرض جديد</span>
                  </button>
                  <button className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all text-right text-sm flex items-center gap-3">
                    <Users size={20} className="text-green-400" />
                    <span className="text-white font-medium">عميل جديد</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Upcoming Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">الحجوزات القادمة</h2>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
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
      </main>
    </div>
  );
}
