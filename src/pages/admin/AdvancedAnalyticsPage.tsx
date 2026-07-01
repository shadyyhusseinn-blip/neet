import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent } from '../../design-system/components';

const analyticsData = {
  revenue: {
    total: 125000,
    growth: 15,
    monthly: [10000, 12000, 15000, 18000, 22000, 25000, 23000]
  },
  bookings: {
    total: 45,
    growth: 8,
    monthly: [3, 4, 5, 6, 7, 8, 12]
  },
  clients: {
    total: 120,
    growth: 12,
    monthly: [10, 12, 15, 18, 20, 22, 23]
  },
  popularPackages: [
    { name: 'باقة الذهب', bookings: 15, revenue: 75000 },
    { name: 'باقة الفضة', bookings: 12, revenue: 36000 },
    { name: 'باقة البرونز', bookings: 10, revenue: 20000 },
    { name: 'باقة البلاتين', bookings: 8, revenue: 48000 }
  ]
};

export default function AdvancedAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            تحليلات متقدمة
          </h1>
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            >
              <option value="week">أسبوع</option>
              <option value="month">شهر</option>
              <option value="quarter">ربع سنة</option>
              <option value="year">سنة</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors">
              <Download size={20} />
              <span>تصدير</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="p-6">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-400" />
                  </div>
                  <div className={`flex items-center gap-1 ${analyticsData.revenue.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.revenue.growth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span>{Math.abs(analyticsData.revenue.growth)}%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {analyticsData.revenue.total.toLocaleString()} ج.م
                </h3>
                <p className="text-gray-400">إجمالي الإيرادات</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="p-6">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Calendar size={24} className="text-purple-400" />
                  </div>
                  <div className={`flex items-center gap-1 ${analyticsData.bookings.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.bookings.growth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span>{Math.abs(analyticsData.bookings.growth)}%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {analyticsData.bookings.total}
                </h3>
                <p className="text-gray-400">إجمالي الحجوزات</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="p-6">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Users size={24} className="text-blue-400" />
                  </div>
                  <div className={`flex items-center gap-1 ${analyticsData.clients.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData.clients.growth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span>{Math.abs(analyticsData.clients.growth)}%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {analyticsData.clients.total}
                </h3>
                <p className="text-gray-400">إجمالي العملاء</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Popular Packages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" className="p-6">
            <CardContent>
              <h2 className="text-2xl font-bold text-white mb-6">الباقات الأكثر شعبية</h2>
              <div className="space-y-4">
                {analyticsData.popularPackages.map((pkg, index) => (
                  <div key={pkg.name} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <span className="text-purple-400 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{pkg.name}</h3>
                        <p className="text-sm text-gray-400">{pkg.bookings} حجز</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">{pkg.revenue.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
