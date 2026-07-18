import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, Users, Lock, Mail, User, ArrowLeft, Eye, EyeOff, Check, Camera, Code } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clientLogin } from '../../services/clientAuth';
import { toast } from 'sonner';

export default function UnifiedLoginPage() {
  const { signIn, signInStaff } = useAuthStore();
  const [selectedPortal, setSelectedPortal] = useState<'admin' | 'staff' | 'client' | null>(null);
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [rememberAdmin, setRememberAdmin] = useState(false);
  
  // Staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [rememberStaff, setRememberStaff] = useState(false);

  // Client form state
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');
  const [rememberClient, setRememberClient] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedAdminEmail = localStorage.getItem('admin_email');
    const savedAdminPassword = localStorage.getItem('admin_password');
    const savedRememberAdmin = localStorage.getItem('admin_remember');
    
    if (savedRememberAdmin === 'true' && savedAdminEmail && savedAdminPassword) {
      setAdminEmail(savedAdminEmail);
      setAdminPassword(savedAdminPassword);
      setRememberAdmin(true);
    }

    const savedStaffUsername = localStorage.getItem('staff_username');
    const savedStaffPassword = localStorage.getItem('staff_password');
    const savedRememberStaff = localStorage.getItem('staff_remember');
    
    if (savedRememberStaff === 'true' && savedStaffUsername && savedStaffPassword) {
      setStaffUsername(savedStaffUsername);
      setStaffPassword(savedStaffPassword);
      setRememberStaff(true);
    }

    const savedClientEmail = localStorage.getItem('client_email');
    const savedClientPassword = localStorage.getItem('client_password');
    const savedRememberClient = localStorage.getItem('client_remember');
    
    if (savedRememberClient === 'true' && savedClientEmail && savedClientPassword) {
      setClientEmail(savedClientEmail);
      setClientPassword(savedClientPassword);
      setRememberClient(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setAdminError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setAdminLoading(true);
    setAdminError('');

    try {
      await signIn(adminEmail, adminPassword, 'admin');
      
      // Save credentials if remember is checked
      if (rememberAdmin) {
        localStorage.setItem('admin_email', adminEmail);
        localStorage.setItem('admin_password', adminPassword);
        localStorage.setItem('admin_remember', 'true');
      } else {
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_password');
        localStorage.removeItem('admin_remember');
      }
      
      toast.success('تم تسجيل الدخول بنجاح ✅');
      window.location.href = '/admin-general';
    } catch (err: any) {
      setAdminError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername || !staffPassword) {
      setStaffError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setStaffLoading(true);
    setStaffError('');

    try {
      await signInStaff(staffUsername, staffPassword);
      
      // Save credentials if remember is checked
      if (rememberStaff) {
        localStorage.setItem('staff_username', staffUsername);
        localStorage.setItem('staff_password', staffPassword);
        localStorage.setItem('staff_remember', 'true');
      } else {
        localStorage.removeItem('staff_username');
        localStorage.removeItem('staff_password');
        localStorage.removeItem('staff_remember');
      }
      
      toast.success('تم تسجيل الدخول بنجاح ✅');
      window.location.href = '/adminstaff';
    } catch (err: any) {
      setStaffError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDeveloperLogin = () => {
    toast.success('تم الدخول كالمطور ✅');
    window.location.href = '/admin-general';
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientPassword) {
      setClientError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setClientLoading(true);
    setClientError('');

    try {
      await clientLogin(clientEmail, clientPassword);
      
      // Save credentials if remember is checked
      if (rememberClient) {
        localStorage.setItem('client_email', clientEmail);
        localStorage.setItem('client_password', clientPassword);
        localStorage.setItem('client_remember', 'true');
      } else {
        localStorage.removeItem('client_email');
        localStorage.removeItem('client_password');
        localStorage.removeItem('client_remember');
      }
      
      toast.success('تم تسجيل الدخول بنجاح ✅');
      window.location.href = '/client-portal';
    } catch (err: any) {
      setClientError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setClientLoading(false);
    }
  };

  if (selectedPortal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] flex items-center justify-center p-4 sm:p-6" dir="rtl">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPortal(null)}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm sm:text-base">العودة</span>
          </motion.button>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-4 sm:mb-8">
              <div className="inline-block mb-3 sm:mb-4">
                {selectedPortal === 'admin' ? (
                  <Crown size={32} className="text-blue-400 mx-auto" />
                ) : selectedPortal === 'staff' ? (
                  <Users size={32} className="text-emerald-400 mx-auto" />
                ) : (
                  <Camera size={32} className="text-amber-400 mx-auto" />
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                {selectedPortal === 'admin' ? 'بوابة الإدارة' : selectedPortal === 'staff' ? 'بوابة الموظفين' : 'بوابة العملاء'}
              </h1>
              <p className="text-xs sm:text-base text-slate-400">
                {selectedPortal === 'admin' ? 'سجل دخولك للوصول إلى لوحة التحكم' : selectedPortal === 'staff' ? 'سجل دخولك للوحة الموظفين' : 'سجل دخولك للوصول إلى حسابك'}
              </p>
            </div>

            {/* Form */}
            {selectedPortal === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full pr-10 pl-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-12 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberAdmin}
                      onChange={(e) => setRememberAdmin(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                      {rememberAdmin && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400">تذكر بياناتي</span>
                </label>

                {adminError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 sm:p-3 text-red-400 text-xs sm:text-sm">
                    {adminError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {adminLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>

                {/* Developer Quick Access */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeveloperLogin}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl font-medium hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base text-purple-400"
                >
                  <Code size={16} />
                  <span>دخول المطور المباشر</span>
                </motion.button>
              </form>
            ) : selectedPortal === 'staff' ? (
              <form onSubmit={handleStaffLogin} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    اسم المستخدم
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      placeholder="اسم المستخدم"
                      className="w-full pr-10 pl-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-12 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberStaff}
                      onChange={(e) => setRememberStaff(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                      {rememberStaff && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400">تذكر بياناتي</span>
                </label>

                {staffError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 sm:p-3 text-red-400 text-xs sm:text-sm">
                    {staffError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {staffLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>

                {/* Developer Quick Access */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeveloperLogin}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl font-medium hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base text-purple-400"
                >
                  <Code size={16} />
                  <span>دخول المطور المباشر</span>
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleClientLogin} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pr-10 pl-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showClientPassword ? 'text' : 'password'}
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-12 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-sm sm:text-base"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientPassword(!showClientPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showClientPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberClient}
                      onChange={(e) => setRememberClient(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                      {rememberClient && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400">تذكر بياناتي</span>
                </label>

                {clientError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 sm:p-3 text-red-400 text-xs sm:text-sm">
                    {clientError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={clientLoading}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {clientLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>

                {/* Developer Quick Access */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeveloperLogin}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl font-medium hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base text-purple-400"
                >
                  <Code size={16} />
                  <span>دخول المطور المباشر</span>
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-slate-400 to-pink-400 bg-clip-text text-transparent">شادي حسين</h1>
          <p className="text-slate-400 text-sm sm:text-xl">نظام إدارة التصوير الفوتوغرافي</p>
        </motion.div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Admin Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPortal('admin')}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-300 text-right cursor-pointer shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-blue-500/30">
                <Crown size={28} className="text-white" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">بوابة الإدارة العامة</h3>
              <p className="text-slate-400 text-xs sm:text-base mb-4 sm:mb-6">الدخول للوحة التحكم الرئيسية مع جميع الصلاحيات</p>
              <div className="flex items-center gap-2 text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-base shadow-lg shadow-blue-500/20">
                <span>الدخول</span>
                <ArrowLeft size={16} />
              </div>
            </div>
          </motion.button>

          {/* Staff Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPortal('staff')}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 text-right cursor-pointer shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-emerald-500/30">
                <Users size={28} className="text-white" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">بوابة الموظفين</h3>
              <p className="text-slate-400 text-xs sm:text-base mb-4 sm:mb-6">الدخول للوحة تحكم الموظفين والمهام المخصصة</p>
              <div className="flex items-center gap-2 text-white font-medium bg-gradient-to-r from-emerald-500 to-teal-500 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-base shadow-lg shadow-emerald-500/20">
                <span>الدخول</span>
                <ArrowLeft size={16} />
              </div>
            </div>
          </motion.button>

          {/* Client Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPortal('client')}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-amber-500/30 transition-all duration-300 text-right cursor-pointer shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-amber-500/30">
                <Camera size={28} className="text-white" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">بوابة العملاء</h3>
              <p className="text-slate-400 text-xs sm:text-base mb-4 sm:mb-6">الدخول للوصول إلى معرض الصور والخدمات</p>
              <div className="flex items-center gap-2 text-white font-medium bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-base shadow-lg shadow-amber-500/20">
                <span>الدخول</span>
                <ArrowLeft size={16} />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-12 text-gray-500 text-xs sm:text-sm">
          <p>© 2024 شادي حسين - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
