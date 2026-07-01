/**
 * Simple Login Page
 * صفحة تسجيل دخول بسيطة موحدة
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../../services/firebase';
import { toast } from 'sonner';

export default function SimpleLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'staff'>('admin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const user = await firebaseService.signInWithEmailAndPassword(email, password);
      
      if (user) {
        toast.success('تم تسجيل الدخول بنجاح');
        
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/staff/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('فشل تسجيل الدخول: ' + (error.message || 'البريد أو كلمة المرور غير صحيحة'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-[3px]">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                <Camera size={32} className="text-purple-400" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">شادي حسين</h1>
          <p className="text-gray-400">نظام إدارة الاستوديو</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setRole('staff')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                role === 'staff'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Staff
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-semibold mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
          >
            العودة للصفحة الرئيسية
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
