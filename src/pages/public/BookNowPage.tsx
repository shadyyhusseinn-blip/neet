import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package } from '../../types';
import { Calendar, Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle, User } from 'lucide-react';
import { firebaseService } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Mock packages for fallback
const mockPackages: Package[] = [
  {
    id: '1',
    name: 'باقة الزفاف الأساسية',
    price: 15000,
    description: 'تشمل تصوير كامل يوم الزفاف',
    category: 'photography',
    isActive: true
  },
  {
    id: '2',
    name: 'باقة الزفاف المميزة',
    price: 25000,
    description: 'تشمل تصوير كامل يوم الزفاف مع فيديو',
    category: 'photography',
    isActive: true
  }
];

export default function BookNowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    location: '',
    additionalDetails: ''
  });

  useEffect(() => {
    // Set selected package from navigation state
    if (location.state?.selectedPackage) {
      setSelectedPackage(location.state.selectedPackage);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.eventType || !formData.eventDate) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);

    try {
      // Save booking to Firestore
      const db = firebaseService.getDB();
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const bookingData = {
        clientName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        location: formData.location,
        notes: formData.additionalDetails,
        packageId: selectedPackage,
        packageName: selectedPackage ? packages.find(p => p.id === selectedPackage)?.name || '' : '',
        totalPrice: selectedPackage ? packages.find(p => p.id === selectedPackage)?.price || 0 : 0,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('Booking saved with ID:', bookingRef.id);
      
      // Navigate to payment page with booking data
      navigate('/payment', { 
        state: { 
          bookingData: {
            ...bookingData,
            id: bookingRef.id
          }
        } 
      });
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('❌ حدث خطأ: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              شادي حسين
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 transition-all"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            احجز مناسبتك الآن
          </h1>
          <p className="text-gray-400 text-lg">
            املأ النموذج أدناه وسنتواصل معك قريباً لتأكيد الحجز
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-[#111111] border border-gray-800 rounded-2xl p-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الاسم بالكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">رقم الهاتف *</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="example@email.com"
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">نوع المناسبة *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 text-sm text-white outline-none focus:border-purple-500 transition-all"
                  required
                >
                  <option value="">اختر نوع المناسبة</option>
                  <option value="زفاف">زفاف</option>
                  <option value="خطوبة">خطوبة</option>
                  <option value="تخرج">تخرج</option>
                  <option value="عيد ميلاد">عيد ميلاد</option>
                  <option value="تصوير شخصي">تصوير شخصي</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">تاريخ المناسبة *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-all"
                    required
                  />
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الباقة (اختياري)</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 text-sm text-white outline-none focus:border-purple-500 transition-all"
                >
                  <option value="">اختر باقة (اختياري)</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.price} ج.م
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">موقع المناسبة</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="اسم المكان أو العنوان"
                  />
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">تفاصيل إضافية</label>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 text-sm text-white outline-none focus:border-purple-500 transition-all resize-none"
                  placeholder="أي تفاصيل إضافية تود إضافتها..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock size={20} className="animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال الطلب
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </motion.form>
          </div>

          {/* Info Card */}
          <div className="space-y-6">
            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">لماذا تحجز معنا؟</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">تجهيز احترافي للمناسبات</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">فريق عمل متخصص ومحترف</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">باقات متنوعة تناسب جميع الميزانيات</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">تسليم سريع وبجودة عالية</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">معلومات التواصل</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone size={18} className="text-purple-400" />
                  <span>01000000000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail size={18} className="text-purple-400" />
                  <span>info@pixejls.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
