import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, Mail, Phone, Calendar, TrendingUp, Star, MessageSquare } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: 'vip' | 'regular' | 'new' | 'inactive';
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  rating: number;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'محمد أحمد',
      email: 'mohamed@example.com',
      phone: '01012345678',
      segment: 'vip',
      totalBookings: 12,
      totalSpent: 45000,
      lastBooking: '2024-06-25',
      rating: 5,
      notes: 'عميل VIP، يفضل حجوزات الزفاف',
      status: 'active',
      createdAt: '2023-01-15',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '01098765432',
      segment: 'regular',
      totalBookings: 5,
      totalSpent: 15000,
      lastBooking: '2024-06-20',
      rating: 4,
      notes: 'عميلة منتظمة، تفضل جلسات عائلية',
      status: 'active',
      createdAt: '2023-03-10',
    },
    {
      id: '3',
      name: 'خالد محمد',
      email: 'khaled@example.com',
      phone: '01055555555',
      segment: 'new',
      totalBookings: 1,
      totalSpent: 3000,
      lastBooking: '2024-06-28',
      rating: 5,
      notes: 'عميل جديد، أول حجز كان ممتاز',
      status: 'active',
      createdAt: '2024-06-20',
    },
    {
      id: '4',
      name: 'سارة حسن',
      email: 'sara@example.com',
      phone: '01077777777',
      segment: 'inactive',
      totalBookings: 3,
      totalSpent: 9000,
      lastBooking: '2024-03-15',
      rating: 3,
      notes: 'لم تحجز منذ 3 أشهر، تحتاج متابعة',
      status: 'inactive',
      createdAt: '2023-08-05',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');

  const handleDelete = (id: string) => {
    setCustomers(items => items.filter(c => c.id !== id));
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'bg-purple-500/20 text-purple-400';
      case 'regular':
        return 'bg-blue-500/20 text-blue-400';
      case 'new':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const crmStats = {
    total: customers.length,
    vip: customers.filter(c => c.segment === 'vip').length,
    regular: customers.filter(c => c.segment === 'regular').length,
    new: customers.filter(c => c.segment === 'new').length,
    inactive: customers.filter(c => c.segment === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageRating: customers.length > 0 
      ? (customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)
      : 0,
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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة علاقات العملاء</h1>
            <p className="text-gray-400">نظام شامل لإدارة علاقات العملاء وتحليل سلوكهم</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            عميل جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">إجمالي العملاء</p>
            <p className="text-2xl font-bold text-white">{crmStats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">VIP</p>
            <p className="text-2xl font-bold text-purple-400">{crmStats.vip}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">منتظمين</p>
            <p className="text-2xl font-bold text-blue-400">{crmStats.regular}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">جدد</p>
            <p className="text-2xl font-bold text-green-400">{crmStats.new}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">غير نشطين</p>
            <p className="text-2xl font-bold text-gray-400">{crmStats.inactive}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">متوسط التقييم</p>
            <p className="text-2xl font-bold text-yellow-400">{crmStats.averageRating} ⭐</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن عميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white pr-10"
            />
          </div>
          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
          >
            <option value="all">جميع الفئات</option>
            <option value="vip">VIP</option>
            <option value="regular">منتظمين</option>
            <option value="new">جدد</option>
            <option value="inactive">غير نشطين</option>
          </select>
        </div>

        {/* Customers List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">قائمة العملاء</h3>
          </div>
          <div className="divide-y divide-white/10">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{customer.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">الحجوزات</p>
                      <p className="text-white font-semibold">{customer.totalBookings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">الإنفاق</p>
                      <p className="text-white font-semibold">{customer.totalSpent.toLocaleString()} ج.م</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">التقييم</p>
                      <p className="text-yellow-400 font-semibold flex items-center gap-1">
                        {customer.rating} <Star className="w-4 h-4 fill-current" />
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getSegmentColor(customer.segment)}`}
                    >
                      {customer.segment === 'vip' && 'VIP'}
                      {customer.segment === 'regular' && 'منتظم'}
                      {customer.segment === 'new' && 'جديد'}
                      {customer.segment === 'inactive' && 'غير نشط'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedCustomer.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${getSegmentColor(selectedCustomer.segment)}`}
                    >
                      {selectedCustomer.segment === 'vip' && 'VIP'}
                      {selectedCustomer.segment === 'regular' && 'منتظم'}
                      {selectedCustomer.segment === 'new' && 'جديد'}
                      {selectedCustomer.segment === 'inactive' && 'غير نشط'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </p>
                  <p className="text-white">{selectedCustomer.email}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    الهاتف
                  </p>
                  <p className="text-white">{selectedCustomer.phone}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    إجمالي الإنفاق
                  </p>
                  <p className="text-white font-bold">{selectedCustomer.totalSpent.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    آخر حجز
                  </p>
                  <p className="text-white">{new Date(selectedCustomer.lastBooking).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">ملاحظات</p>
                <p className="text-white">{selectedCustomer.notes}</p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  إرسال بريد
                </button>
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  إرسال رسالة
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">عميل جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الاسم</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الهاتف</label>
                  <input
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الفئة</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="new">جديد</option>
                    <option value="regular">منتظم</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">ملاحظات</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل ملاحظات"
                    rows={3}
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
                  إضافة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
