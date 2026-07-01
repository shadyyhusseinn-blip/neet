/**
 * Simple Admin Dashboard
 * لوحة تحكم الأدمن الموحدة
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, Image, Plus, ArrowRight, LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../../services/firebase';

export default function SimpleAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    galleries: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const db = firebaseService.getDB();
      
      // Load galleries count
      const galleriesSnapshot = await db.collection('galleries').get();
      const galleriesCount = galleriesSnapshot.size;
      
      setStats({
        galleries: galleriesCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">لوحة التحكم</h1>
            <p className="text-gray-400">إدارة المعارض البسيطة</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <Image size={32} className="text-purple-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{stats.galleries}</div>
            <div className="text-gray-400">المعارض المنشأة</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <Camera size={32} className="text-pink-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">بسيط</div>
            <div className="text-gray-400">نظام المعرض</div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/simple-gallery-create')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl p-8 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-4">
              <Plus size={32} />
              <span className="text-2xl">إنشاء معرض جديد</span>
              <ArrowRight size={32} />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
