import { motion, AnimatePresence } from 'motion/react';
import { Star, Eye, Phone, Lock, Camera, MessageSquare, Sparkles, Calendar, Image, Package, User } from 'lucide-react';
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
      action: () => navigate('/booking-wizard')
    },
    {
      title: "استعرض الأعمال",
      icon: Image,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate('/portfolio')
    },
    {
      title: "الباقات",
      icon: Package,
      color: "from-emerald-500 to-teal-500",
      action: () => navigate('/packages')
    },
    {
      title: "تواصل معنا",
      icon: Phone,
      color: "from-orange-500 to-amber-500",
      action: () => navigate('/contact')
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-['Cairo','Tajawal',sans-serif] relative" dir="rtl">
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
              className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">ثبت التطبيق</h2>
                <p className="text-slate-400 text-sm mb-4">
                  احصل على تجربة أفضل
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold"
                  >
                    تثبيت
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-bold"
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">Shady Hussein</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/unified-login')}
            className="p-2 bg-white/10 rounded-xl"
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
          <h1 className="text-2xl font-bold mb-2">مرحباً بك 👋</h1>
          <p className="text-slate-400">كيف يمكننا مساعدتك اليوم؟</p>
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
              onClick={action.action}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-right hover:border-white/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-white">{action.title}</h3>
            </motion.button>
          ))}
        </div>

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-right"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">مساعد ذكي</h3>
                <p className="text-slate-400 text-sm">اسألني أي سؤال</p>
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
            { label: "عميل", value: "500+" },
            { label: "سنة", value: "10+" },
            { label: "مشروع", value: "1000+" },
          ].map((stat, index) => (
            <div key={index} className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { icon: Calendar, label: "حجز", action: () => navigate('/booking-wizard') },
            { icon: Image, label: "أعمال", action: () => navigate('/portfolio') },
            { icon: Package, label: "باقات", action: () => navigate('/packages') },
            { icon: User, label: "حساب", action: () => navigate('/unified-login') },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={item.action}
              className="flex flex-col items-center gap-1"
            >
              <item.icon size={24} className="text-slate-400" />
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
