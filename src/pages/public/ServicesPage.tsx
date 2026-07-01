import React from 'react';
import { motion } from 'motion/react';
import { Camera, Video, Image as ImageIcon, Sparkles, Award, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    icon: Camera,
    title: 'تصوير الأفراح',
    description: 'تصوير احترافي للأفراح بأسلوب فني عصري يجمع بين التقاط اللحظات العفوية والتكوين الفني المتقن',
    features: ['تصوير كامل للزفاف', 'تصوير الجلسة', 'تصوير القاعة', 'تصوير خارجي'],
    price: 'من 5000 جنيه'
  },
  {
    icon: Video,
    title: 'تصوير الفيديو',
    description: 'تصوير فيديو سينمائي للأفراح والمناسبات بجودة عالية ومونتاج احترافي',
    features: ['تصوير سينمائي', 'مونتاج احترافي', 'موسيقى تصويرية', 'تأثيرات بصرية'],
    price: 'من 8000 جنيه'
  },
  {
    icon: ImageIcon,
    title: 'تصوير البورتريه',
    description: 'تصوير بورتريه احترافي للأفراد والعائلات في الاستوديو أو في الموقع',
    features: ['تصوير استوديو', 'تصوير خارجي', 'إضاءة احترافية', 'ريتوش احترافي'],
    price: 'من 1500 جنيه'
  },
  {
    icon: Sparkles,
    title: 'خدمات التعديل',
    description: 'خدمات تعديل الصور والفيديو بجودة عالية وبأسعار تنافسية',
    features: ['ريتوش الصور', 'تصحيح الألوان', 'إزالة الخلفية', 'تحسين الجودة'],
    price: 'من 500 جنيه'
  }
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header */}
      <div className="pt-24 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          خدماتنا
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          خدمات تصوير احترافية بجودة عالية
        </motion.p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <service.icon size={32} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {service.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <Award size={20} />
                  <span className="font-semibold">{service.price}</span>
                </div>
                <button
                  onClick={() => navigate('/book-now')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  احجز الآن
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">لماذا تختارنا؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Award size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">جودة عالية</h3>
              <p className="text-gray-400">نستخدم أفضل المعدات والبرامج لضمان جودة عالية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Clock size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تسليم في الوقت</h3>
              <p className="text-gray-400">نلتزم بمواعيد التسليم المحددة بدقة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">أسعار تنافسية</h3>
              <p className="text-gray-400">أسعار معقولة تناسب جميع الميزانيات</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
