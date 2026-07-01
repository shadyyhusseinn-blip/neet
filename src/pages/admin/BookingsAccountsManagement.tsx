import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Plus, DollarSign, Camera, LogOut, 
  ArrowRight, ChevronLeft, X, Save, Check, Search,
  Filter, Edit, Trash2, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const SIDEBAR_ITEMS = [
  { id: 'bookings', label: 'سجل الحجوزات', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
  { id: 'add-booking', label: 'إضافة حجز', icon: Plus, color: 'from-green-500 to-emerald-500' },
  { id: 'accounts', label: 'الحسابات', icon: DollarSign, color: 'from-purple-500 to-pink-500' },
  { id: 'photographer-tools', label: 'أدوات المصور', icon: Camera, color: 'from-amber-500 to-orange-500' },
];

export default function BookingsAccountsManagement() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('bookings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const db = getFirestore();

  // Firebase Auth protection
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isLoggedIn, user, navigate]);

  // State for bookings
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for new booking form
  const [newBooking, setNewBooking] = useState({
    clientName: '',
    phone: '',
    email: '',
    date: '',
    packageType: '',
    deposit: 0,
    totalAmount: 0,
    notes: '',
    status: 'pending'
  });

  // State for accounts
  const [accounts, setAccounts] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  // State for photographer tools
  const [photographerTools, setPhotographerTools] = useState({
    equipmentList: '',
    scheduleNotes: '',
    packageConfigs: '',
    preferredLocations: ''
  });

  // Load bookings from Firestore
  useEffect(() => {
    loadBookings();
    loadAccounts();
    loadPhotographerTools();
  }, []);

  const loadBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const accountsDoc = await getDoc(doc(db, 'settings', 'accounts'));
      if (accountsDoc.exists()) {
        setAccounts(accountsDoc.data());
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadPhotographerTools = async () => {
    try {
      const toolsDoc = await getDoc(doc(db, 'settings', 'photographerTools'));
      if (toolsDoc.exists()) {
        setPhotographerTools(toolsDoc.data());
      }
    } catch (error) {
      console.error('Error loading photographer tools:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'accounts'), accounts, { merge: true });
      await setDoc(doc(db, 'settings', 'photographerTools'), photographerTools, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBooking = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Reset form
      setNewBooking({
        clientName: '',
        phone: '',
        email: '',
        date: '',
        packageType: '',
        deposit: 0,
        totalAmount: 0,
        notes: '',
        status: 'pending'
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      // Reload bookings
      loadBookings();
    } catch (error) {
      console.error('Error adding booking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.phone?.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">سجل الحجوزات</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">العميل</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">التاريخ</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">الباقة</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">المبلغ</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">الحالة</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white">{booking.clientName}</td>
                <td className="px-6 py-4 text-gray-300">{booking.date}</td>
                <td className="px-6 py-4 text-gray-300">{booking.packageType}</td>
                <td className="px-6 py-4 text-gray-300">{booking.totalAmount} ج.م</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' :
                     booking.status === 'pending' ? 'قيد الانتظار' :
                     booking.status === 'completed' ? 'مكتمل' : 'ملغي'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye size={16} className="text-blue-400" />
                    </button>
                    <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Edit size={16} className="text-green-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddBooking = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">إضافة حجز جديد</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">اسم العميل</label>
          <input
            type="text"
            value={newBooking.clientName}
            onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">رقم الهاتف</label>
          <input
            type="text"
            value={newBooking.phone}
            onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={newBooking.email}
            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">التاريخ</label>
          <input
            type="date"
            value={newBooking.date}
            onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">نوع الباقة</label>
          <select
            value={newBooking.packageType}
            onChange={(e) => setNewBooking({ ...newBooking, packageType: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="">اختر الباقة</option>
            <option value="الباقة الذهبية">الباقة الذهبية</option>
            <option value="الباقة المميزة">الباقة المميزة</option>
            <option value="الباقة الأساسية">الباقة الأساسية</option>
            <option value="باقة مخصصة">باقة مخصصة</option>
          </select>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">المبلغ الكلي</label>
          <input
            type="number"
            value={newBooking.totalAmount}
            onChange={(e) => setNewBooking({ ...newBooking, totalAmount: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">المقدم</label>
          <input
            type="number"
            value={newBooking.deposit}
            onChange={(e) => setNewBooking({ ...newBooking, deposit: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">الحالة</label>
          <select
            value={newBooking.status}
            onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-gray-300 mb-2">ملاحظات</label>
        <textarea
          value={newBooking.notes}
          onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddBooking}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saveSuccess ? (
          <>
            <Check size={20} />
            تم الحفظ
          </>
        ) : (
          <>
            <Plus size={20} />
            {saving ? 'جاري الحفظ...' : 'إضافة الحجز'}
          </>
        )}
      </motion.button>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">الحسابات المالية</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">إجمالي الإيرادات</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.totalRevenue.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-red-400" />
            <span className="text-red-400 text-sm font-semibold">إجمالي المصروفات</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.totalExpenses.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">مدفوعات معلقة</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.pendingPayments.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">مدفوعات مكتملة</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.completedPayments.toLocaleString()} ج.م</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إجمالي الإيرادات</label>
          <input
            type="number"
            value={accounts.totalRevenue}
            onChange={(e) => setAccounts({ ...accounts, totalRevenue: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إجمالي المصروفات</label>
          <input
            type="number"
            value={accounts.totalExpenses}
            onChange={(e) => setAccounts({ ...accounts, totalExpenses: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">مدفوعات معلقة</label>
          <input
            type="number"
            value={accounts.pendingPayments}
            onChange={(e) => setAccounts({ ...accounts, pendingPayments: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">مدفوعات مكتملة</label>
          <input
            type="number"
            value={accounts.completedPayments}
            onChange={(e) => setAccounts({ ...accounts, completedPayments: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderPhotographerTools = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">أدوات المصور</h2>
      
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">قائمة المعدات</label>
          <textarea
            value={photographerTools.equipmentList}
            onChange={(e) => setPhotographerTools({ ...photographerTools, equipmentList: e.target.value })}
            rows={4}
            placeholder="الكاميرا، العدسات، الإضاءة، إلخ..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">ملاحظات الجدول</label>
          <textarea
            value={photographerTools.scheduleNotes}
            onChange={(e) => setPhotographerTools({ ...photographerTools, scheduleNotes: e.target.value })}
            rows={4}
            placeholder="ملاحظات خاصة بالجدول الزمني..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">تكوينات الباقات</label>
          <textarea
            value={photographerTools.packageConfigs}
            onChange={(e) => setPhotographerTools({ ...photographerTools, packageConfigs: e.target.value })}
            rows={4}
            placeholder="تفاصيل الباقات المختلفة..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">الأماكن المفضلة</label>
          <textarea
            value={photographerTools.preferredLocations}
            onChange={(e) => setPhotographerTools({ ...photographerTools, preferredLocations: e.target.value })}
            rows={4}
            placeholder="الأماكن المفضلة للتصوير..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif] overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#050508]" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-72 bg-black/60 backdrop-blur-2xl border-l border-white/10 z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  الحجوزات والحسابات
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full flex">
        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 z-30 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <ArrowRight size={24} />}
        </motion.button>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  الحجوزات والحسابات
                </h1>
                <p className="text-gray-400 mt-2">إدارة الحجوزات والحسابات المالية</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/selection')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  رجوع
                </motion.button>

                {activeSection !== 'bookings' && activeSection !== 'add-booking' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={16} />
                        تم الحفظ
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'bookings' && renderBookings()}
                {activeSection === 'add-booking' && renderAddBooking()}
                {activeSection === 'accounts' && renderAccounts()}
                {activeSection === 'photographer-tools' && renderPhotographerTools()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
