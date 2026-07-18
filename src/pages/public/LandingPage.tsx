import { motion, AnimatePresence } from 'motion/react';
import { Star, Eye, Phone, Lock, Camera, MessageSquare, Sparkles, Heart, Award, Zap, ArrowRight, Play, Menu, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { googleDriveService } from '../../services/googleDrive';
import { toast } from 'sonner';
import { audioService } from '../../services/audio';
import { confettiService } from '../../services/confetti';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import AIChat from '../../components/shared/AIChat';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const { isInstallable, promptInstall } = usePWAInstall();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    if (isInstallable) {
      setShowInstallPrompt(true);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    await promptInstall();
    setShowInstallPrompt(false);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const db = getFirestore();
        const galleriesRef = collection(db, 'client-galleries');
        const q = query(galleriesRef, where('coverImage', '!=', null), limit(10));
        const querySnapshot = await getDocs(q);
        const images = querySnapshot.docs
          .map(doc => doc.data().coverImage)
          .filter((img): img is string => img !== undefined && img !== null);
        
        if (images.length > 0) {
          setBackgroundImages(images);
        }
      } catch (error) {
        console.error('Error loading gallery images:', error);
      }
    };

    loadGalleryImages();
  }, []);

  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % backgroundImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [backgroundImages.length]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string, redirectPath?: string | null) => {
    try {
      await googleDriveService.handleCallback(code);
      googleDriveService.reloadTokens();
      if (!audioService.getMuteState()) audioService.playClick();
      confettiService.fireSides();
      toast.success('تم ربط Google Drive بنجاح ✅');
      const targetPath = redirectPath || '/admin/google-drive-management';
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('فشل ربط Google Drive');
      navigate('/', { replace: true });
    }
  };

  const services = [
    {
      title: "تصوير الأفراح",
      description: "نوثق أجمل لحظات يومك الخاص",
      icon: Camera,
      color: "from-rose-500 to-pink-600",
      bg: "from-rose-500/10 to-pink-600/10",
      action: () => navigate('/booking-wizard')
    },
    {
      title: "معارض فنية",
      description: "استعرض أعمالنا الإبداعية",
      icon: Eye,
      color: "from-blue-500 to-cyan-600",
      bg: "from-blue-500/10 to-cyan-600/10",
      action: () => navigate('/portfolio')
    },
    {
      title: "الباقات",
      description: "اختر الباقة المناسبة لك",
      icon: Star,
      color: "from-emerald-500 to-teal-600",
      bg: "from-emerald-500/10 to-teal-600/10",
      action: () => navigate('/packages')
    },
    {
      title: "تواصل معنا",
      description: "نحن هنا لمساعدتك",
      icon: Phone,
      color: "from-orange-500 to-amber-600",
      bg: "from-orange-500/10 to-amber-600/10",
      action: () => navigate('/contact')
    }
  ];

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-slate-950 text-white font-['Cairo','Tajawal',sans-serif] relative" dir="rtl">
      {/* Install Prompt Modal */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-purple-500/50">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">ثبت التطبيق الآن!</h2>
                <p className="text-slate-400 text-sm mb-6">
                  احصل على تجربة أفضل مع Sh-ph على جهازك
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
                  >
                    تثبيت
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          {backgroundImages.length > 0 ? (
            <motion.img
              key={currentBgIndex}
              src={backgroundImages[currentBgIndex]}
              alt="Gallery Background"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.1),transparent_50%)]" />
            </div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 backdrop-blur-sm" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Camera size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold">Shady Hussein</span>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {services.slice(0, 3).map((service, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={service.action}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {service.title}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/unified-login')}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
          >
            تسجيل الدخول
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-20 px-6"
          >
            <div className="flex flex-col gap-4">
              {services.map((service, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    service.action();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                    <service.icon size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{service.title}</div>
                    <div className="text-sm text-slate-400">{service.description}</div>
                  </div>
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/unified-login');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
              >
                <Lock size={24} />
                تسجيل الدخول
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center max-w-7xl mx-auto w-full px-6 py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-1 shadow-2xl shadow-purple-500/50">
                  <div className="w-full h-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <Camera size={56} className="text-white" />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 -m-3"
                >
                  <div className="w-full h-full border-2 border-purple-500/30 rounded-3xl" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                نحول لحظاتك
              </span>
              <br />
              <span className="text-white">إلى ذكريات خالدة</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-slate-400 mb-8 max-w-lg"
            >
              استوديو تصوير احترافي يوثق أجمل لحظاتك بأعلى جودة وإبداع
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/booking-wizard')}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/30"
              >
                <Play size={20} />
                ابدأ الآن
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/portfolio')}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                <Eye size={20} />
                استعرض الأعمال
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Heart, label: "عميل سعيد", value: "500+" },
              { icon: Award, label: "سنوات خبرة", value: "10+" },
              { icon: Zap, label: "مشروع ناجح", value: "1000+" },
              { icon: Star, label: "تقييم 5 نجوم", value: "98%" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <stat.icon size={24} className="text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">خدماتنا</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={service.action}
                className={`relative bg-gradient-to-br ${service.bg} backdrop-blur-sm border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-white/20 transition-all overflow-hidden`}
              >
                <motion.div
                  animate={{
                    opacity: hoveredCard === index ? 1 : 0,
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                />
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-xl`}>
                  <service.icon size={32} className="text-white" />
                </div>
                <h3 className="relative text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="relative text-slate-400 text-sm mb-4">{service.description}</p>
                <div className="relative flex items-center gap-2 text-purple-400">
                  <span className="font-semibold text-sm">اكتشف المزيد</span>
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">جاهز للبدء؟</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              احجز موعدك الآن ودعنا نساعدك في توثيق أجمل لحظاتك
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/booking-wizard')}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/30"
              >
                <Star size={20} />
                احجز الآن
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                <MessageSquare size={20} />
                مساعد ذكي
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Chat Component */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
