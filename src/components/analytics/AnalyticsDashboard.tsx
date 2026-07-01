import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

interface AnalyticsDashboardProps {
  data?: {
    bookings?: any[];
    users?: any[];
    revenue?: any[];
  };
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Mock data for demonstration
  const monthlyBookings = [
    { month: 'يناير', bookings: 12 },
    { month: 'فبراير', bookings: 18 },
    { month: 'مارس', bookings: 15 },
    { month: 'أبريل', bookings: 22 },
    { month: 'مايو', bookings: 28 },
    { month: 'يونيو', bookings: 35 },
  ];

  const revenueData = [
    { month: 'يناير', revenue: 45000 },
    { month: 'فبراير', revenue: 52000 },
    { month: 'مارس', revenue: 48000 },
    { month: 'أبريل', revenue: 61000 },
    { month: 'مايو', revenue: 73000 },
    { month: 'يونيو', revenue: 85000 },
  ];

  const packageDistribution = [
    { name: 'الباقة الأساسية', value: 35 },
    { name: 'الباقة المتقدمة', value: 45 },
    { name: 'الباقة المميزة', value: 20 },
  ];

  const stats = [
    {
      label: 'إجمالي الحجوزات',
      value: data?.bookings?.length || 130,
      change: '+12%',
      icon: Calendar,
      color: 'text-purple-400',
    },
    {
      label: 'المستخدمين النشطين',
      value: data?.users?.length || 85,
      change: '+8%',
      icon: Users,
      color: 'text-pink-400',
    },
    {
      label: 'الإيرادات الشهرية',
      value: `${(data?.revenue?.reduce((sum, r) => sum + r.amount, 0) || 85000).toLocaleString()} ج.م`,
      change: '+15%',
      icon: DollarSign,
      color: 'text-amber-400',
    },
    {
      label: 'معدل النمو',
      value: '23%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={stat.color} size={24} />
              <span className="text-emerald-400 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">الحجوزات الشهرية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Package Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">توزيع الباقات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={packageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {packageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">النشاط الأخير</h3>
          <div className="space-y-4">
            {[
              { action: 'حجز جديد', user: 'أحمد محمد', time: 'منذ 5 دقائق' },
              { action: 'تحديث معرض', user: 'سارة أحمد', time: 'منذ 15 دقيقة' },
              { action: 'دفع إلكتروني', user: 'محمد علي', time: 'منذ 30 دقيقة' },
              { action: 'تسجيل مستخدم', user: 'فاطمة حسن', time: 'منذ ساعة' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div>
                  <p className="text-white font-semibold">{activity.action}</p>
                  <p className="text-gray-400 text-sm">{activity.user}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
