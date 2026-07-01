import React from 'react';
import { motion } from 'motion/react';
import { Camera, Heart, Award, Users, Star, Eye, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { icon: Heart, value: '500+', label: 'زفاف ناجح', color: 'text-pink-400', bg: 'from-pink-500/20 to-pink-600/20' },
  { icon: Award, value: '10+', label: 'سنوات خبرة', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/20' },
  { icon: Users, value: '1000+', label: 'عميل سعيد', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/20' },
  { icon: Star, value: '4.9', label: 'تقييم العملاء', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/20' },
];

const FEATURES = [
  { icon: Star, title: 'جودة فائقة', desc: 'تصوير احترافي بأحدث الكاميرات' },
  { icon: Camera, title: 'سرعة التسليم', desc: 'استلام صورك في وقت قياسي' },
  { icon: Heart, title: 'أسعار تنافسية', desc: 'باقات تناسب جميع الميزانيات' },
];

const content = {
  tagline: 'مصور محترف لحفظ ذكرياتك الثمينة',
  description: 'نحول لحظاتك إلى ذكريات خالدة بلمسة فنية وإبداعية'
};

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400'
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#050508]" />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.15, 0.35, 0.15],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/25 to-purple-600/25 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-pink-600/20 to-amber-600/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="inline-block relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-[3px]">
              <div className="w-full h-full rounded-full bg-[#050508] flex items-center justify-center">
                <Camera size={60} md:size={70} className="text-purple-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="text-6xl md:text-8xl lg:text-[120px] font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
            شادي حسين
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="text-2xl md:text-3xl lg:text-5xl text-gray-300 mb-6 font-light"
        >
          {content.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
        >
          {content.description}
        </motion.p>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <feature.icon size={40} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Gallery Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            معرض الصور الحي
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.05 }}
                whileHover={{ scale: 1.1, y: -10, rotate: 2 }}
                className="aspect-square rounded-3xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-purple-500/50 transition-all duration-300 shadow-2xl"
                onClick={() => navigate('/portfolio')}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-300`}
              >
                <stat.icon size={32} className={`${stat.color} mx-auto mb-3`} />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 + i * 0.1, type: "spring" }}
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/book-now')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
          >
            <Camera size={20} className="inline ml-2" />
            احجز الآن
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/portfolio')}
            className="px-8 py-4 rounded-2xl bg-white/5 text-white font-semibold text-lg border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
          >
            <Eye size={20} className="inline ml-2" />
            تصفح المعرض
          </motion.button>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-1 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
            >
              <Camera size={16} className="sm:size-20" />
              <span className="font-semibold text-xs sm:text-sm hidden sm:block">الرئيسية</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/5 text-gray-400 hover:bg-white/10"
            >
              <Eye size={16} className="sm:size-20" />
              <span className="font-semibold text-xs sm:text-sm hidden sm:block">المعارض</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/packages')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/5 text-gray-400 hover:bg-white/10"
            >
              <Star size={16} className="sm:size-20" />
              <span className="font-semibold text-xs sm:text-sm hidden sm:block">الباقات</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/5 text-gray-400 hover:bg-white/10"
            >
              <Phone size={16} className="sm:size-20" />
              <span className="font-semibold text-xs sm:text-sm hidden sm:block">تواصل</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
