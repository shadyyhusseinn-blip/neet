import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Upload, Image, Settings, LogOut, 
  ArrowRight, ChevronLeft, X, Save, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const SIDEBAR_ITEMS = [
  { id: 'appearance', label: 'المظهر العام', icon: Palette, color: 'from-purple-500 to-pink-500' },
  { id: 'deliverables', label: 'تسليمات العملاء', icon: Upload, color: 'from-blue-500 to-cyan-500' },
  { id: 'content', label: 'إدارة المحتوى', icon: Image, color: 'from-green-500 to-emerald-500' },
  { id: 'client-page', label: 'صفحة العملاء', icon: Settings, color: 'from-amber-500 to-orange-500' },
];

export default function ExternalClientManagement() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('appearance');
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

  // State for appearance settings
  const [appearance, setAppearance] = useState({
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    backgroundColor: '#050508',
    textColor: '#ffffff',
    accentColor: '#6366f1',
  });

  // State for deliverables
  const [deliverables, setDeliverables] = useState({
    autoNotify: true,
    defaultDeliveryDays: 30,
    watermarkEnabled: true,
    maxPhotosPerSession: 200,
  });

  // State for content management
  const [content, setContent] = useState({
    heroTitle: 'شادي حسين',
    heroSubtitle: 'مصور محترف لحفظ ذكرياتك الثمينة',
    aboutText: 'نحول لحظاتك إلى ذكريات خالدة بلمسة فنية وإبداعية',
    contactPhone: '+20 123 456 7890',
    contactEmail: 'contact@shadyhussein.com',
  });

  // State for client page settings
  const [clientPage, setClientPage] = useState({
    enableGallery: true,
    enableBooking: true,
    enableContact: true,
    showPricing: true,
    customDomain: '',
  });

  // Load settings from Firestore
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'clientManagement'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.appearance) setAppearance(data.appearance);
        if (data.deliverables) setDeliverables(data.deliverables);
        if (data.content) setContent(data.content);
        if (data.clientPage) setClientPage(data.clientPage);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'clientManagement'), {
        appearance,
        deliverables,
        content,
        clientPage,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  const renderAppearance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">المظهر العام</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">اللون الأساسي</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.primaryColor}
              onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.primaryColor}
              onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">اللون الثانوي</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.secondaryColor}
              onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.secondaryColor}
              onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">لون الخلفية</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.backgroundColor}
              onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.backgroundColor}
              onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">لون التركيز</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-gray-300 mb-2">معاينة الألوان</label>
        <div className="flex gap-4">
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.primaryColor }}
          />
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.secondaryColor }}
          />
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.accentColor }}
          />
        </div>
      </div>
    </div>
  );

  const renderDeliverables = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">تسليمات العملاء</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>إشعار تلقائي للعميل</span>
            <input
              type="checkbox"
              checked={deliverables.autoNotify}
              onChange={(e) => setDeliverables({ ...deliverables, autoNotify: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إرسال إشعار تلقائي عند إتمام التسليم</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تفعيل العلامة المائية</span>
            <input
              type="checkbox"
              checked={deliverables.watermarkEnabled}
              onChange={(e) => setDeliverables({ ...deliverables, watermarkEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إضافة علامة مائية على الصور</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">أيام التسليم الافتراضية</label>
          <input
            type="number"
            value={deliverables.defaultDeliveryDays}
            onChange={(e) => setDeliverables({ ...deliverables, defaultDeliveryDays: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
          <p className="text-gray-400 text-sm mt-2">عدد الأيام الافتراضي لتسليم الصور</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">أقصى عدد صور للجلسة</label>
          <input
            type="number"
            value={deliverables.maxPhotosPerSession}
            onChange={(e) => setDeliverables({ ...deliverables, maxPhotosPerSession: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
          <p className="text-gray-400 text-sm mt-2">الحد الأقصى للصور المسموحة لكل جلسة</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">إدارة المحتوى</h2>
      
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">عنوان الصفحة الرئيسية</label>
          <input
            type="text"
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">العنوان الفرعي</label>
          <input
            type="text"
            value={content.heroSubtitle}
            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">نص "عننا"</label>
          <textarea
            value={content.aboutText}
            onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-gray-300 mb-2">رقم الهاتف</label>
            <input
              type="text"
              value={content.contactPhone}
              onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={content.contactEmail}
              onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientPage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">صفحة العملاء</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تفعيل المعرض</span>
            <input
              type="checkbox"
              checked={clientPage.enableGallery}
              onChange={(e) => setClientPage({ ...clientPage, enableGallery: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إظهار معرض الصور للعملاء</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تفعيل الحجز</span>
            <input
              type="checkbox"
              checked={clientPage.enableBooking}
              onChange={(e) => setClientPage({ ...clientPage, enableBooking: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إتاحة الحجز عبر الموقع</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تفعيل التواصل</span>
            <input
              type="checkbox"
              checked={clientPage.enableContact}
              onChange={(e) => setClientPage({ ...clientPage, enableContact: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إظهار نموذج التواصل</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>إظهار الأسعار</span>
            <input
              type="checkbox"
              checked={clientPage.showPricing}
              onChange={(e) => setClientPage({ ...clientPage, showPricing: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">عرض باقات الأسعار للعملاء</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-gray-300 mb-2">الدومين المخصص (اختياري)</label>
        <input
          type="text"
          value={clientPage.customDomain}
          onChange={(e) => setClientPage({ ...clientPage, customDomain: e.target.value })}
          placeholder="example.com"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
        />
        <p className="text-gray-400 text-sm mt-2">ربط دومين مخصص بصفحة العملاء</p>
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
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
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
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  إدارة العملاء
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  إدارة العملاء الخارجية
                </h1>
                <p className="text-gray-400 mt-2">التحكم في مظهر وإعدادات صفحة العملاء</p>
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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50"
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
                {activeSection === 'appearance' && renderAppearance()}
                {activeSection === 'deliverables' && renderDeliverables()}
                {activeSection === 'content' && renderContent()}
                {activeSection === 'client-page' && renderClientPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
