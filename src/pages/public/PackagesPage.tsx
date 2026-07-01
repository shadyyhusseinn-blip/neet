import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { Package } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { useNavigate } from 'react-router-dom';
import { usePageContent } from '../../hooks/usePageContent';

// Mock data for fallback
const mockPackages: Package[] = [
  {
    id: 'full-day',
    name: 'Full Day Package',
    price: 5000,
    description: 'تصوير كامل يوم الزفاف مع جميع المميزات الأساسية',
    category: 'photography',
    isActive: true,
    features: [
      'Time for preparations',
      'Photo Session',
      'Party',
      'Unlimited photos',
      'Delivery (Google Drive - Telegram account) within 30-40 days'
    ],
    extras: [
      '1 reel video: 500 LE',
      '2 reel video: 800 LE',
      'Delivery within 15 days: 500 LE'
    ],
    bookingTerms: 'To book, 50% of the agreed amount will be paid via Vodafone Cash, and the remaining amount will be paid on the wedding day.'
  },
  {
    id: 'half-day',
    name: 'Half Day Package',
    price: 4000,
    description: 'تصوير نصف يوم الزفاف مع المميزات الأساسية',
    category: 'photography',
    isActive: true,
    features: [
      'Photo Session',
      'Party',
      'Unlimited photos',
      'Delivery (Google Drive - Telegram account) within 30-40 days'
    ],
    extras: [
      '1 reel video: 500 LE',
      '2 reel video: 800 LE',
      'Delivery within 15 days: 500 LE'
    ],
    bookingTerms: 'To book, 50% of the agreed amount will be paid via Vodafone Cash, and the remaining amount will be paid on the wedding day.'
  },
  {
    id: '1',
    name: 'باقة الزفاف الأساسية',
    price: 15000,
    description: 'تشمل تصوير كامل يوم الزفاف مع مصورين اثنين وعدد غير محدود من الصور',
    category: 'photography',
    isActive: true,
    features: [
      'تصوير كامل يوم الزفاف',
      'مصورين اثنين',
      'عدد غير محدود من الصور',
      'تعديل احترافي للصور',
      'ألبوم رقمي'
    ]
  },
  {
    id: '2',
    name: 'باقة الزفاف المميزة',
    price: 25000,
    description: 'تشمل تصوير كامل يوم الزفاف مع 3 مصورين وفريق فيديو',
    category: 'photography',
    isActive: true,
    features: [
      'تصوير كامل يوم الزفاف',
      '3 مصورين',
      'فريق فيديو كامل',
      'تعديل احترافي',
      'ألبوم رقمي + فيزيائي',
      'درون سينمائي'
    ]
  },
  {
    id: '3',
    name: 'باقة الخطوبة',
    price: 5000,
    description: 'تصوير جلسة خطوبة احترافية في الموقع المختار',
    category: 'photography',
    isActive: true,
    features: [
      'جلسة تصوير 3 ساعات',
      'مصور واحد',
      'عدد 50 صورة',
      'تعديل احترافي',
      'ألبوم رقمي'
    ]
  }
];

export default function PackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [loading, setLoading] = useState(false);

  // Use React Query to fetch page content
  const { data: pageContent } = usePageContent('packages');

  const defaultContent = {
    pageTitle: 'باقاتنا وأسعارنا',
    pageDescription: 'اختر الباقة المناسبة لمناسبتك من بين باقاتنا المتنوعة',
    buttonText: 'احجز هذه الباقة'
  };

  const content = pageContent || defaultContent;

  useEffect(() => {
    try {
      const unsubscribe = firestoreData.subscribeToPackages((data) => {
        console.log('Packages data from Firestore:', data);
        const filtered = data.filter(p => p.isActive);
        console.log('Filtered packages:', filtered);
        // Use Firestore data if available, otherwise use mock data
        if (filtered.length > 0) {
          setPackages(filtered);
        } else {
          setPackages(mockPackages);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Use mock data on error
      setPackages(mockPackages);
      setLoading(false);
    }
  }, []);

  const handleBookNow = (packageId: string) => {
    navigate('/book-now', { state: { selectedPackage: packageId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Floating Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            شادي حسين
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
          >
            العودة للرئيسية
          </motion.button>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-24 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          {content.pageTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          {content.pageDescription}
        </motion.p>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">لا توجد باقات متاحة حالياً</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold transition-all"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-3xl font-bold text-amber-600 mb-4">{pkg.price} ج.م</p>
                <p className="text-gray-400 mb-6 leading-relaxed">{pkg.description}</p>
                
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <Check size={20} className="text-purple-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {pkg.extras && pkg.extras.length > 0 && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl">
                    <h4 className="text-sm font-semibold text-amber-400 mb-3">Extra Options:</h4>
                    <ul className="space-y-2">
                      {pkg.extras.map((extra, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="text-amber-400">+</span>
                          <span>{extra}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pkg.bookingTerms && (
                  <div className="mb-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-green-400 text-sm">{pkg.bookingTerms}</p>
                  </div>
                )}

                <button
                  onClick={() => handleBookNow(pkg.id)}
                  className="w-full py-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {content.buttonText}
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
