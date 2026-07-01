import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { storage } from '../../services/storage';
import { Booking, Package } from '../../types';

export function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    setBookings(storage.getBookings());
    setPackages(storage.getPackages());
  }, []);

  // Calculate monthly revenue
  const monthlyRevenue = bookings.reduce((acc, booking) => {
    const month = new Date(booking.date).toLocaleDateString('ar-EG', { month: 'short' });
    acc[month] = (acc[month] || 0) + booking.paidAmount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
    month,
    amount,
  }));

  // Calculate monthly bookings
  const monthlyBookings = bookings.reduce((acc, booking) => {
    const month = new Date(booking.date).toLocaleDateString('ar-EG', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bookingsData = Object.entries(monthlyBookings).map(([month, count]) => ({
    month,
    count,
  }));

  // Top customers
  const topCustomers = bookings.reduce((acc, booking) => {
    const existing = acc.find(c => c.name === booking.clientName);
    if (existing) {
      existing.bookings += 1;
      existing.total += booking.totalPrice;
    } else {
      acc.push({
        name: booking.clientName,
        bookings: 1,
        total: booking.totalPrice,
      });
    }
    return acc;
  }, [] as { name: string; bookings: number; total: number }[])
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Popular packages
  const popularPackages = bookings.reduce((acc, booking) => {
    const existing = acc.find(p => p.name === booking.packageName);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        name: booking.packageName,
        count: 1,
      });
    }
    return acc;
  }, [] as { name: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Booking status distribution
  const statusData = [
    { name: 'مؤكد', value: bookings.filter(b => b.status === 'confirmed').length, color: '#10b981' },
    { name: 'مؤقت', value: bookings.filter(b => b.status === 'temporary').length, color: '#f59e0b' },
    { name: 'ملغي', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' },
    { name: 'مؤجل', value: bookings.filter(b => b.status === 'postponed').length, color: '#8b5cf6' },
  ];

  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalBookings = bookings.length;
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">الإحصائيات والتحليلات</h1>
          <p className="text-gray-400">نظرة شاملة على أداء الاستوديو</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">إجمالي الإيرادات</p>
            <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()} ج.م</p>
            <p className="text-green-400 text-sm mt-2">+12% من الشهر الماضي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">إجمالي الحجوزات</p>
            <p className="text-3xl font-bold text-white">{totalBookings}</p>
            <p className="text-green-400 text-sm mt-2">+8% من الشهر الماضي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">متوسط قيمة الحجز</p>
            <p className="text-3xl font-bold text-white">{averageBookingValue.toLocaleString()} ج.م</p>
            <p className="text-yellow-400 text-sm mt-2">-3% من الشهر الماضي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">معدل الإكمال</p>
            <p className="text-3xl font-bold text-white">85%</p>
            <p className="text-green-400 text-sm mt-2">+5% من الشهر الماضي</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">الإيرادات الشهرية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">الحجوزات الشهرية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">توزيع الحالات</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">أفضل العملاء</h3>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-gray-400 text-sm">{customer.bookings} حجوزات</p>
                  </div>
                  <p className="text-purple-400 font-bold">{customer.total.toLocaleString()} ج.م</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">أكثر الباقات مبيعاً</h3>
            <div className="space-y-3">
              {popularPackages.map((pkg, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <p className="text-white font-medium">{pkg.name}</p>
                  <p className="text-cyan-400 font-bold">{pkg.count} حجز</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
