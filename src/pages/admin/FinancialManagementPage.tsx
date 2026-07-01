import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, CreditCard, FileText, TrendingUp, Plus, Download, Search } from 'lucide-react';
import { Card, CardContent } from '../../design-system/components';

const transactions = [
  { id: 1, type: 'دخل', amount: 5000, description: 'دفعة زفاف أحمد', date: '2024-01-15', status: 'مكتمل' },
  { id: 2, type: 'دخل', amount: 3000, description: 'دفعة خطوبة سارة', date: '2024-01-14', status: 'مكتمل' },
  { id: 3, type: 'مصروف', amount: 1500, description: 'شراء معدات', date: '2024-01-13', status: 'مكتمل' },
  { id: 4, type: 'دخل', amount: 8000, description: 'دفعة زفاف محمد', date: '2024-01-12', status: 'قيد الانتظار' }
];

export default function FinancialManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions.filter(t => t.type === 'دخل').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'مصروف').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الإدارة المالية
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all">
            <Plus size={20} />
            <span>إضافة معاملة</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="p-6">
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي الدخل</p>
                    <p className="text-2xl font-bold text-white">{totalIncome.toLocaleString()} ج.م</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center">
                    <CreditCard size={24} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-white">{totalExpenses.toLocaleString()} ج.م</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                    <TrendingUp size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">صافي الربح</p>
                    <p className="text-2xl font-bold text-white">{netProfit.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card variant="elevated" className="p-6 mb-8">
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في المعاملات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/30"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
              >
                <option value="all">جميع الأنواع</option>
                <option value="دخل">دخل</option>
                <option value="مصروف">مصروف</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Download size={20} />
                <span>تصدير</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="p-6">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                        transaction.type === 'دخل'
                          ? 'bg-green-500/20 border-green-500/30'
                          : 'bg-red-500/20 border-red-500/30'
                      }`}>
                        {transaction.type === 'دخل' ? (
                          <DollarSign size={24} className="text-green-400" />
                        ) : (
                          <CreditCard size={24} className="text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{transaction.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span>{transaction.date}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'مكتمل'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-2xl font-bold ${
                        transaction.type === 'دخل' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'دخل' ? '+' : '-'}{transaction.amount.toLocaleString()} ج.م
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
