import { motion, AnimatePresence } from 'motion/react';
import { Star, Eye, Phone, Lock, Camera, MessageSquare, Sparkles, Heart, Award, Zap, ArrowRight } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState(0);

  // Show install prompt if installable
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

  // Load gallery cover images from Firestore
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

  // Auto-rotate background images every 5 seconds
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % backgroundImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [backgroundImages.length]);

  // Auto-rotate sections
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const sections = [
    {
      title: "تصوير احترافي",
      description: "نوثق أجمل لحظاتك بأعلى جودة",
      icon: Camera,
      color: "from-pink-500 to-rose-500",
      action: () => navigate('/booking-wizard')
    },
    {
      title: "معارض إبداعية",
      description: "استعرض أعمالنا الفنية",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate('/portfolio')
    },
    {
      title: "باقات مميزة",
      description: "اختر الباقة المناسبة لك",
      icon: Star,
      color: "from-emerald-500 to-teal-500",
      action: () => navigate('/packages')
    }
  ];

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white font-['Cairo','Tajawal',sans-serif] relative" dir="rtl">
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

      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          {backgroundImages.length > 0 ? (
            <motion.img
              key={currentBgIndex}
              src={backgroundImages[currentBgIndex]}
              alt="Gallery Background"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,0,255,0.1),transparent_50%)]" />
            </div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center max-w-7xl mx-auto w-full px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-1 shadow-2xl shadow-purple-500/50">
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                  <Camera size={40} className="sm:size-48 text-white" />
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -m-2"
              >
                <div className="w-full h-full border-2 border-purple-500/30 rounded-3xl" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Shady Hussein
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl text-slate-300 font-light mb-6"
          >
            استوديو تصوير احترافي
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-12"
          >
            نحول أجمل لحظاتك إلى ذكريات خالدة تصمد أمام الزمن
          </motion.p>
        </motion.div>

        {/* Dynamic Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="w-full max-w-4xl mb-12"
        >
          <div className="relative h-64 sm:h-80">
            <AnimatePresence mode="wait">
              {sections.map((section, index) => (
                activeSection === index && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={section.action}
                      className="w-full max-w-md bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 cursor-pointer shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-6 shadow-xl`}>
                          <section.icon size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{section.title}</h3>
                        <p className="text-slate-400 mb-6">{section.description}</p>
                        <div className="flex items-center gap-2 text-purple-400">
                          <span className="font-semibold">اكتشف المزيد</span>
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Section Indicators */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeSection === index
                      ? 'bg-purple-500 w-8'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contact')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold shadow-lg shadow-orange-500/30 border border-white/20"
          >
            <Phone size={20} />
            <span>تواصل معنا</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/unified-login')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl font-semibold shadow-lg shadow-slate-500/30 border border-white/20"
          >
            <Lock size={20} />
            <span>الأدمن</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold shadow-lg shadow-purple-500/30 border border-white/20"
          >
            <MessageSquare size={20} />
            <span>مساعد ذكي</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { icon: Heart, label: "عماء سعداء", value: "500+" },
            { icon: Award, label: "سنوات خبرة", value: "10+" },
            { icon: Zap, label: "مشروع ناجح", value: "1000+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <stat.icon size={24} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* AI Chat Component */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
