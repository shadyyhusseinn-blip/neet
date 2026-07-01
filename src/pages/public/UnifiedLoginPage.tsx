import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Code, Palette, Mail, Lock, ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const PORTALS = [
  {
    id: 'admin',
    title: 'بوابة الإدارة',
    description: 'الدخول للوحة التحكم الرئيسية مع جميع الصلاحيات',
    icon: Shield,
    color: 'from-purple-500 to-pink-500',
    role: 'admin',
    redirect: '/admin'
  },
  {
    id: 'staff',
    title: 'بوابة الموظفين',
    description: 'الدخول للوحة تحكم الموظفين',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    role: 'staff',
    redirect: '/staff/dashboard'
  },
  {
    id: 'developer',
    title: 'بوابة المطور',
    description: 'الدخول المباشر لأدوات التطوير والإعدادات',
    icon: Code,
    color: 'from-amber-500 to-orange-500',
    role: 'developer',
    redirect: '/developer'
  },
  {
    id: 'client-manager',
    title: 'بوابة إدارة الصفحة الخارجية',
    description: 'الدخول المباشر لإدارة المحتوى والعملاء',
    icon: Palette,
    color: 'from-green-500 to-emerald-500',
    role: 'client-manager',
    redirect: '/client-manager'
  }
];

export default function UnifiedLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePortalSelect = (portalId: string) => {
    setSelectedPortal(portalId);
    setError('');
  };

  const handleBackToPortals = () => {
    setSelectedPortal(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;

    setLoading(true);
    setError('');

    try {
      const portal = PORTALS.find(p => p.id === selectedPortal);
      if (portal) {
        await signIn(email, password, portal.role as 'admin' | 'staff' | 'developer' | 'client-manager');
        navigate(portal.redirect);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const selectedPortalData = PORTALS.find(p => p.id === selectedPortal);

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
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!selectedPortal ? (
            <motion.div
              key="portals"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                  شادي حسين
                </h1>
                <p className="text-gray-400 text-lg md:text-xl">نظام إدارة التصوير الفوتوغرافي</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {PORTALS.map((portal, index) => (
                  <motion.div
                    key={portal.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePortalSelect(portal.id)}
                      className="w-full h-full relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 text-right"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                      
                      <div className="relative z-10 h-full flex flex-col">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <portal.icon size={40} className="text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3">
                          {portal.title}
                        </h3>

                        <p className="text-gray-400 text-base mb-6 flex-grow">
                          {portal.description}
                        </p>

                        <div className={`flex items-center gap-2 text-white font-semibold bg-gradient-to-r ${portal.color} px-6 py-3 rounded-xl group-hover:shadow-lg transition-all duration-300`}>
                          <span>الدخول</span>
                          <ArrowLeft size={18} />
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-gray-500 text-sm text-center"
              >
                <p>اختر البوابة المناسبة للدخول</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                {selectedPortalData && (
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${selectedPortalData.color} flex items-center justify-center`}>
                    <selectedPortalData.icon size={40} className="text-white" />
                  </div>
                )}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {selectedPortalData?.title}
                </h1>
                <p className="text-gray-400">تسجيل الدخول</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToPortals}
                className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                رجوع للبوابات
              </motion.button>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:border-purple-500 transition-colors"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:border-purple-500 transition-colors"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-gradient-to-r ${selectedPortalData?.color} rounded-xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
