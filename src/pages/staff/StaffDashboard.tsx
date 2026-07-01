import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar, Clock, Users, CheckCircle, AlertCircle,
  ArrowRight, LogOut, Settings, Plus, TrendingUp,
  Target, Award, Zap, Camera as CameraIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuthStore();

  // Firebase Auth protection with role check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (user?.role !== 'admin' && user?.role !== 'staff' && user?.role !== 'employee') {
      navigate('/login'); // Redirect to main login if not authorized
    }
  }, [isLoggedIn, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'المواعيد اليوم', value: '5', icon: Calendar, color: 'from-blue-400 to-cyan-400', bg: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'المهام المكتملة', value: '12', icon: CheckCircle, color: 'from-emerald-400 to-green-400', bg: 'from-emerald-500/20 to-green-500/20' },
    { label: 'المهام المعلقة', value: '3', icon: AlertCircle, color: 'from-amber-400 to-orange-400', bg: 'from-amber-500/20 to-orange-500/20' },
    { label: 'ساعات العمل', value: '6.5', icon: Clock, color: 'from-purple-400 to-pink-400', bg: 'from-purple-500/20 to-pink-500/20' },
  ];

  const tasks = [
    { id: 1, title: 'تعديل صور زفاف أحمد', status: 'pending', time: '10:00' },
    { id: 2, title: 'تسليم معرض سارة', status: 'completed', time: '09:30' },
    { id: 3, title: 'مراجعة صور خطوبة محمد', status: 'pending', time: '11:00' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">لوحة الموظفين</h1>
                <p className="text-sm text-gray-400">مرحباً، {user?.name || 'موظف'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon size={24} className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">مهام اليوم</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-amber-400 shadow-lg shadow-amber-400/50'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full ${
                    task.status === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">إجراءات سريعة</h2>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Plus size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">بدء مهمة جديدة</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">عرض التقارير</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Settings size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">الإعدادات</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
