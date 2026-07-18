import { motion, AnimatePresence } from 'motion/react';
import { Lock, Camera, MessageSquare, Sparkles, Calendar, Image, Package, User, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { googleDriveService } from '../../services/googleDrive';
import { toast } from 'sonner';
import { audioService } from '../../services/audio';
import { confettiService } from '../../services/confetti';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import AIChat from '../../components/shared/AIChat';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const quickActions = [
    {
      title: "احجز موعد",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bg: "from-purple-500/10 to-pink-500/10",
      description: "احجز موعدك الآن",
      action: () => navigate('/booking-wizard')
    },
    {
      title: "استعرض الأعمال",
      icon: Image,
      color: "from-blue-500 to-cyan-500",
      bg: "from-blue-500/10 to-cyan-500/10",
      description: "شاهد معرضنا",
      action: () => navigate('/portfolio')
    },
    {
      title: "الباقات",
      icon: Package,
      color: "from-emerald-500 to-teal-500",
      bg: "from-emerald-500/10 to-teal-500/10",
      description: "اختر باقتك",
      action: () => navigate('/packages')
    },
    {
      title: "تواصل معنا",
      icon: Phone,
      color: "from-orange-500 to-amber-500",
      bg: "from-orange-500/10 to-amber-500/10",
      description: "تواصل مباشر",
      action: () => navigate('/contact')
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-['Cairo','Tajawal',sans-serif] relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"
        />
      </div>

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
              className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Sparkles size={32} className="text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">ثبت التطبيق</h2>
                <p className="text-slate-400 text-sm mb-4">
                  احصل على تجربة أفضل
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    تثبيت
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">Shady Hussein</span>
          </motion.div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/unified-login')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <Lock size={20} />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 pb-24">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            مرحباً بك 👋
          </h1>
          <p className="text-slate-400 text-lg">كيف يمكننا مساعدتك اليوم؟</p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={action.action}
              className={`bg-gradient-to-br ${action.bg} backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-right hover:border-white/20 transition-all shadow-lg`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                <action.icon size={28} className="text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-slate-400 text-xs">{action.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: TrendingUp, label: "جودة عالية", color: "text-emerald-400" },
              { icon: Award, label: "خبرة 10 سنوات", color: "text-amber-400" },
              { icon: Clock, label: "تسليم سريع", color: "text-blue-400" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center"
              >
                <feature.icon size={20} className={`${feature.color} mx-auto mb-1`} />
                <p className="text-xs text-slate-300">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-5 text-right shadow-xl shadow-purple-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">مساعد ذكي</h3>
                <p className="text-slate-400 text-sm">اسألني أي سؤال</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles size={16} className="text-purple-400" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "عميل", value: "500+", color: "from-purple-500 to-pink-500" },
            { label: "سنة", value: "10+", color: "from-blue-500 to-cyan-500" },
            { label: "مشروع", value: "1000+", color: "from-emerald-500 to-teal-500" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
            >
              <div className={`text-2xl font-bold text-white mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { icon: Calendar, label: "حجز", action: () => navigate('/booking-wizard'), color: "text-purple-400" },
            { icon: Image, label: "أعمال", action: () => navigate('/portfolio'), color: "text-blue-400" },
            { icon: Package, label: "باقات", action: () => navigate('/packages'), color: "text-emerald-400" },
            { icon: User, label: "حساب", action: () => navigate('/unified-login'), color: "text-amber-400" },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={item.action}
              className="flex flex-col items-center gap-1"
            >
              <item.icon size={24} className={item.color} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Chat Component */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
