import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, Lock, Mail, User, Shield, Users,
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle,
  RefreshCw, Eye, EyeOff, Camera, Sparkles, Zap,
  ChevronLeft, X
} from 'lucide-react';
import { storage } from '../../services/storage';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { firebaseService } from '../../services/firebase';
import { sendAdminBypassToWebhook } from '../../utils/makeWebhook';
import { useNavigate } from 'react-router-dom';

type LoginType = 'admin' | 'staff'; // Only 2 portals now
type Screen = 'welcome' | 'login';
type AdminStep = 'email' | 'password';
type StaffStep = 'username' | 'password';

interface LoginData {
  type: 'admin' | 'staff';
  role?: 'admin' | 'editor' | 'viewer' | 'staff';
  email?: string;
  username?: string;
  phone?: string;
}

export function NewLoginScreen({ onLoginSuccess }: { onLoginSuccess: (data: LoginData) => void }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [adminStep, setAdminStep] = useState<AdminStep>('email');
  const [staffStep, setStaffStep] = useState<StaffStep>('username');
  const { signIn, signUp } = useAuthStore();
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
  // Staff login state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDevModal, setShowDevModal] = useState(false);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Development mode - set to false in production
  const isDevelopmentMode = false;
  const testStaffAccounts = [
    { username: 'nona', password: '123123', role: 'staff' as const, name: 'نونا' },
    { username: 'staff1', password: '123456', role: 'editor' as const, name: 'موظف 1 (Editor)' },
    { username: 'staff2', password: '111111', role: 'viewer' as const, name: 'موظف 2 (Viewer)' },
  ];
  const adminCredentials = {
    email: 'shadyyhusseinn@gmail.com',
    password: 'admin123',
    username: 'shadyyhusseinn'
  };

  const handleAdminLogin = async () => {
    if (!adminEmail && !adminUsername) {
      setError('الرجاء إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }

    if (!adminPassword) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    // Use Firebase Auth
    try {
      // If username is provided without @, append @studio.com
      const emailToUse = adminEmail || (adminUsername?.includes('@') ? adminUsername : `${adminUsername}@studio.com`);
      console.log('Attempting login with email (Firebase):', emailToUse);
      
      const user = await firebaseService.signInWithEmailAndPassword(emailToUse, adminPassword);
      
      if (user) {
        setLoading(false);
        onLoginSuccess({ type: 'admin', role: 'admin', email: emailToUse, username: adminUsername });
      } else {
        setLoading(false);
        setError('فشل تسجيل الدخول');
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/user-not-found') {
        setError('المستخدم غير موجود');
      } else if (error.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة');
      } else {
        setError('فشل تسجيل الدخول: ' + error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await firebaseService.signInWithGoogle();

      if (user) {
        setLoading(false);
        onLoginSuccess({
          type: 'admin',
          role: 'admin',
          email: user.email || '',
          username: user.displayName || ''
        });
      } else {
        setLoading(false);
        setError('فشل تسجيل الدخول بـ Google');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Google Sign-In error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء تسجيل الدخول');
      } else if (error.code === 'auth/popup-blocked') {
        setError('تم حظر نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة');
      } else {
        setError('فشل تسجيل الدخول بـ Google');
      }
    }
  };

  const handleStaffLogin = async () => {
    if (!staffUsername) {
      setError('الرجاء إدخال اسم المستخدم');
      return;
    }

    if (!staffPassword) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError('');
    
    // Development mode - accept test credentials
    if (isDevelopmentMode) {
      const testAccount = testStaffAccounts.find(t => t.username === staffUsername);
      if (testAccount && staffPassword === testAccount.password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        
        // Set user in authStore with staff role
        const { setUser } = useAuthStore.getState();
        setUser({
          id: testAccount.username,
          email: `${testAccount.username}@staff.local`,
          name: testAccount.name,
          role: 'staff',
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
        
        onLoginSuccess({ 
          type: 'staff', 
          role: 'staff',
          username: staffUsername 
        });
        return;
      } else if (testAccount) {
        setLoading(false);
        setError('كلمة المرور غير صحيحة');
        return;
      }
    }
    
    // If not in development mode or account not found
    setLoading(false);
    setError('المستخدم غير موجود. يرجى التواصل مع الإدارة');
  };

  const renderWelcome = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="inline-block mb-4 md:mb-6"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
            <div className="w-full h-full rounded-full bg-[#050508] flex items-center justify-center">
              <Camera size={28} className="md:size-40 text-purple-400" />
            </div>
          </div>
        </motion.div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            مرحباً بك
          </span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg">اختر نوع الدخول للمتابعة</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setLoginType('admin');
            setScreen('login');
            setAdminStep('email');
            setError('');
            setSuccess('');
          }}
          className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-base md:text-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
        >
          <Shield size={20} className="md:size-24" />
          دخول الإدارة
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setLoginType('staff');
            setScreen('login');
            setStaffStep('username');
            setError('');
            setSuccess('');
          }}
          className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base md:text-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30"
        >
          <Users size={20} className="md:size-24" />
          دخول الموظفين
        </motion.button>

        {/* Developer Bypass Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDevModal(true)}
          className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-semibold text-xs md:text-sm hover:bg-white/10 hover:text-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <span>دخول كمطور</span>
        </motion.button>
      </div>

      {/* Developer Selection Modal */}
      <AnimatePresence>
        {showDevModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-sm w-full"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">اختر نوع الدخول</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const { setUser } = useAuthStore.getState();
                    setUser({
                      id: 'dev-admin',
                      email: 'dev@local',
                      name: 'مطور',
                      role: 'admin',
                      isBlocked: false,
                      createdAt: new Date().toISOString(),
                      lastLogin: new Date().toISOString(),
                    });
                    
                    // Send webhook event
                    await sendAdminBypassToWebhook('admin');
                    
                    setShowDevModal(false);
                    onLoginSuccess({ type: 'admin', role: 'admin', email: 'dev@local', username: 'dev' });
                  }}
                  className="w-full h-10 md:h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs md:text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  دخول كإدارة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const { setUser } = useAuthStore.getState();
                    setUser({
                      id: 'dev-staff',
                      email: 'dev-staff@local',
                      name: 'مطور',
                      role: 'staff',
                      isBlocked: false,
                      createdAt: new Date().toISOString(),
                      lastLogin: new Date().toISOString(),
                    });
                    
                    // Send webhook event
                    await sendAdminBypassToWebhook('staff');
                    
                    setShowDevModal(false);
                    onLoginSuccess({ type: 'staff', role: 'staff', username: 'dev-staff' });
                  }}
                  className="w-full h-10 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs md:text-sm hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  دخول كموظف
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDevModal(false)}
                  className="w-full h-10 md:h-12 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 font-semibold text-xs md:text-sm hover:bg-gray-700 transition-all"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-purple-500/30">
          <Shield size={32} className="md:size-40 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">دخول الإدارة</h2>
        <p className="text-gray-400 text-sm md:text-base">الدخول بصلاحيات المطور والمدير</p>
      </div>

      {isDevelopmentMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-purple-500/20 border border-purple-500/30"
        >
          <p className="text-xs md:text-sm font-bold text-purple-300 mb-2">وضع التطوير - بيانات الدخول:</p>
          <p className="text-xs md:text-sm text-purple-200/80">البريد: {adminCredentials.email}</p>
          <p className="text-xs md:text-sm text-purple-200/80">المستخدم: {adminCredentials.username}</p>
          <p className="text-xs md:text-sm text-purple-200/80">كلمة المرور: {adminCredentials.password}</p>
        </motion.div>
      )}

      {/* Google Sign-In Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-white text-gray-800 font-bold text-xs md:text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <RefreshCw size={18} className="md:size-20 animate-spin" /> : <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98   7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>}
        تسجيل الدخول بـ Google
      </motion.button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/20"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-[#050508] text-pink-300/70">أو</span>
        </div>
      </div>

      {/* Step 1: Email/Username */}
      {adminStep === 'email' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">البريد الإلكتروني أو اسم المستخدم</label>
            <input
              type="text"
              value={adminEmail || adminUsername}
              onChange={(e) => {
                setAdminEmail(e.target.value.includes('@') ? e.target.value : '');
                setAdminUsername(!e.target.value.includes('@') ? e.target.value : '');
              }}
              placeholder="أدخل البريد الإلكتروني الخاص بك"
              className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border border-gray-700 bg-gray-800/50 px-4 text-xs md:text-sm text-white outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScreen('welcome')}
              className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-xs md:text-sm hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight size={18} className="md:size-20" />
              رجوع
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAdminStep('password')}
              disabled={!adminEmail && !adminUsername}
              className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs md:text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              التالي
              <ArrowLeft size={18} className="md:size-20" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Password */}
      {adminStep === 'password' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border border-gray-700 bg-gray-800/50 px-4 pr-12 text-xs md:text-sm text-white outline-none focus:border-purple-500 transition-all"
              />
              <button
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showAdminPassword ? <EyeOff size={18} className="md:size-20" /> : <Eye size={18} className="md:size-20" />}
              </button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs md:text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/30"
          >
            {loading ? <RefreshCw size={18} className="md:size-20 animate-spin" /> : <Shield size={18} className="md:size-20" />}
            {loading ? 'جاري الدخول...' : 'دخول كمسؤول'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAdminStep('email')}
            className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-xs md:text-sm hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={18} className="md:size-20" />
            رجوع
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  const renderStaffLogin = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-blue-500/30">
          <User size={32} className="md:size-40 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">دخول الموظفين</h2>
        <p className="text-gray-400 text-sm md:text-base">الدخول باسم المستخدم وكلمة المرور</p>
      </div>

      <div className="space-y-4">
        {isDevelopmentMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-yellow-500/20 border border-yellow-500/30"
          >
            <p className="text-xs md:text-sm font-bold text-yellow-300 mb-2">وضع التطوير - حسابات تجريبية:</p>
            <div className="space-y-2">
              {testStaffAccounts.map((test) => (
                <motion.button
                  key={test.username}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStaffUsername(test.username);
                    setStaffPassword(test.password);
                  }}
                  className="w-full p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 border border-yellow-500/20 text-xs md:text-sm text-yellow-200/80 hover:bg-yellow-500/30 transition-all text-right"
                >
                  {test.name}: {test.username} (كلمة المرور: {test.password})
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Username */}
        {staffStep === 'username' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={staffUsername}
                onChange={(e) => setStaffUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border border-gray-700 bg-gray-800/50 px-4 text-xs md:text-sm text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setScreen('welcome')}
                className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-xs md:text-sm hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} className="md:size-20" />
                رجوع
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStaffStep('password')}
                disabled={!staffUsername}
                className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xs md:text-sm hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                التالي
                <ArrowLeft size={18} className="md:size-20" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Password */}
        {staffStep === 'password' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border border-gray-700 bg-gray-800/50 px-4 pr-12 text-xs md:text-sm text-white outline-none focus:border-blue-500 transition-all"
                />
                <button
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showStaffPassword ? <EyeOff size={18} className="md:size-20" /> : <Eye size={18} className="md:size-20" />}
                </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStaffLogin}
              disabled={loading}
              className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xs md:text-sm hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              {loading ? <RefreshCw size={18} className="md:size-20 animate-spin" /> : <CheckCircle size={18} className="md:size-20" />}
              {loading ? 'جاري الدخول...' : 'دخول كموظف'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStaffStep('username')}
              className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-xs md:text-sm hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight size={18} className="md:size-20" />
              رجوع
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif] overflow-hidden" dir="rtl">
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
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 z-20 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        رجوع للرئيسية
      </motion.button>

      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-800 bg-[#111111]/80 backdrop-blur-2xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              {screen === 'welcome' && renderWelcome()}
              {screen === 'login' && loginType === 'admin' && renderAdminLogin()}
              {screen === 'login' && loginType === 'staff' && renderStaffLogin()}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              >
                <AlertTriangle size={20} className="text-red-400" />
                <p className="text-sm font-semibold text-red-300">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
              >
                <CheckCircle size={20} className="text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-300">{success}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
