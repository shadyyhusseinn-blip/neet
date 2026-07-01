import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { storage } from '../../services/storage';
import { Booking } from '../../types';

export function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const bookings = storage.getBookings();

  // Calculate financial data
  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalExpenses = 0; // Would come from expenses data
  const netProfit = totalRevenue - totalExpenses;
  const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // Monthly comparison
  const currentMonthRevenue = bookings
    .filter(b => {
      const date = new Date(b.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + b.paidAmount, 0);

  const lastMonthRevenue = bookings
    .filter(b => {
      const date = new Date(b.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, b) => sum + b.paidAmount, 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Payment status breakdown
  const paymentStatus = {
    paid: bookings.filter(b => b.paymentStatus === 'paid').length,
    deposit: bookings.filter(b => b.paymentStatus === 'deposit').length,
    unpaid: bookings.filter(b => b.paymentStatus === 'unpaid').length,
  };

  const handleExportPDF = () => {
    // Would use jsPDF to export
    console.log('Export PDF');
  };

  const handleExportExcel = () => {
    // Would export to Excel
    console.log('Export Excel');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">التقارير المالية</h1>
            <p className="text-gray-400">تقارير مالية مفصلة وتحليلات الأرباح</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="btn-secondary"
            >
              <FileText className="w-5 h-5" />
              تصدير PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-secondary"
            >
              <Download className="w-5 h-5" />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {['day', 'week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {period === 'day' && 'يومي'}
              {period === 'week' && 'أسبوعي'}
              {period === 'month' && 'شهري'}
              {period === 'quarter' && 'ربع سنوي'}
              {period === 'year' && 'سنوي'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className={`flex items-center text-sm ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">إجمالي الإيرادات</p>
            <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()} ج.م</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-gray-400 text-sm">-</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">إجمالي المصروفات</p>
            <p className="text-3xl font-bold text-white">{totalExpenses.toLocaleString()} ج.م</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className={`text-sm ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}{((netProfit / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">صافي الربح</p>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit.toLocaleString()} ج.م
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-400 text-sm">متوسط</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">متوسط قيمة الحجز</p>
            <p className="text-3xl font-bold text-white">{averageBookingValue.toLocaleString()} ج.م</p>
          </motion.div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">توزيع حالة الدفع</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">مدفوع بالكامل</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">{paymentStatus.paid}</span>
                  <span className="text-gray-400 text-sm">
                    {((paymentStatus.paid / bookings.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${(paymentStatus.paid / bookings.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-300">دفعة مقدمة</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">{paymentStatus.deposit}</span>
                  <span className="text-gray-400 text-sm">
                    {((paymentStatus.deposit / bookings.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${(paymentStatus.deposit / bookings.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-gray-300">غير مدفوع</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">{paymentStatus.unpaid}</span>
                  <span className="text-gray-400 text-sm">
                    {((paymentStatus.unpaid / bookings.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all"
                  style={{ width: `${(paymentStatus.unpaid / bookings.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">ملخص الشهر الحالي</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">إيرادات الشهر</span>
                <span className="text-white font-bold">{currentMonthRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">إيرادات الشهر الماضي</span>
                <span className="text-white font-bold">{lastMonthRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">نمو الإيرادات</span>
                <span className={`font-bold ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">عدد الحجوزات</span>
                <span className="text-white font-bold">{bookings.length}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">المعاملات الأخيرة</h3>
          </div>
          <div className="divide-y divide-white/10">
            {bookings.slice(0, 10).map((booking, index) => (
              <div key={booking.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {booking.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{booking.clientName}</p>
                      <p className="text-gray-400 text-sm">{booking.packageName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{booking.paidAmount.toLocaleString()} ج.م</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(booking.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
