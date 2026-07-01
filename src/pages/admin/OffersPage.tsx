import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Copy, TrendingUp, Users } from 'lucide-react';

interface Offer {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'expired' | 'scheduled';
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  applicablePackages: string[];
}

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      name: 'خصم الصيف',
      code: 'SUMMER2024',
      type: 'percentage',
      value: 20,
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      maxUses: 100,
      usedCount: 45,
      applicablePackages: ['all'],
    },
    {
      id: '2',
      name: 'خصم العرس',
      code: 'WEDDING15',
      type: 'percentage',
      value: 15,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      maxUses: 50,
      usedCount: 32,
      applicablePackages: ['wedding'],
    },
    {
      id: '3',
      name: 'خصم العميل الجديد',
      code: 'NEW10',
      type: 'fixed',
      value: 500,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      maxUses: 200,
      usedCount: 87,
      applicablePackages: ['all'],
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDelete = (id: string) => {
    setOffers(items => items.filter(o => o.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalSavings = offers.reduce((sum, offer) => {
    if (offer.type === 'percentage') {
      return sum + (offer.usedCount * offer.value * 1000); // تقديري
    }
    return sum + (offer.usedCount * offer.value);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">العروض والخصومات</h1>
            <p className="text-gray-400">إنشاء وإدارة العروض وأكواد الخصم</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            إنشاء عرض جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">إجمالي العروض</p>
            <p className="text-3xl font-bold text-white">{offers.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">نشطة</p>
            <p className="text-3xl font-bold text-green-400">
              {offers.filter(o => o.status === 'active').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">إجمالي الاستخدام</p>
            <p className="text-3xl font-bold text-white">
              {offers.reduce((sum, o) => sum + o.usedCount, 0)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">الوفورات</p>
            <p className="text-3xl font-bold text-purple-400">
              {totalSavings.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {/* Offers List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">العروض الحالية</h3>
          </div>
          <div className="divide-y divide-white/10">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{offer.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-white/10 px-2 py-1 rounded text-sm text-cyan-400">
                          {offer.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(offer.code)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">القيمة</p>
                      <p className="text-white font-semibold">
                        {offer.type === 'percentage' ? `${offer.value}%` : `${offer.value} ج.م`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">الاستخدام</p>
                      <p className="text-white font-semibold">
                        {offer.usedCount} / {offer.maxUses}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">ينتهي</p>
                      <p className="text-white text-sm">
                        {new Date(offer.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(offer.status)}`}
                    >
                      {offer.status === 'active' && 'نشط'}
                      {offer.status === 'expired' && 'منتهي'}
                      {offer.status === 'scheduled' && 'مجدول'}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add Offer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">إنشاء عرض جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">اسم العرض</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل اسم العرض"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">كود الخصم</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                      placeholder="مثال: SUMMER2024"
                    />
                    <button className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      توليد
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">نوع الخصم</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">القيمة</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل القيمة"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">تاريخ البدء</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الحد الأقصى للاستخدام</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل الحد الأقصى"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  إلغاء
                </button>
                <button className="flex-1 btn-primary">
                  إنشاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
