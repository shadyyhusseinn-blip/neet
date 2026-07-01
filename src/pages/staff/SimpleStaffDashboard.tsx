/**
 * Simple Staff Dashboard
 * لوحة تحكم الموظفين البسيطة
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle, Clock, LogOut, User, 
  Bell, Settings, ListTodo as TaskIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../../services/firebase';

export default function SimpleStaffDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'تحرير صور زفاف أحمد', status: 'pending', dueDate: '2024-07-05' },
    { id: 2, title: 'تسليم صور خطوبة محمد', status: 'completed', dueDate: '2024-07-03' },
    { id: 3, title: 'تصوير حفل تخرج سارة', status: 'pending', dueDate: '2024-07-10' },
  ]);

  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    total: tasks.length
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">لوحة الموظفين</h1>
            <p className="text-gray-400">إدارة المهام والجداول</p>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <Clock size={32} className="text-blue-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{stats.pending}</div>
            <div className="text-gray-400">مهام معلقة</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <CheckCircle size={32} className="text-green-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{stats.completed}</div>
            <div className="text-gray-400">مهام مكتملة</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <TaskIcon size={32} className="text-purple-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-gray-400">إجمالي المهام</div>
          </div>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">المهام</h2>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${
                  task.status === 'completed' 
                    ? 'bg-green-500/20' 
                    : 'bg-blue-500/20'
                }`}>
                  {task.status === 'completed' ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <Clock size={20} className="text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{task.title}</p>
                  <p className="text-gray-400 text-sm">تاريخ الاستحقاق: {task.dueDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  task.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
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
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <button className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calendar size={24} className="text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">الجدول</p>
              <p className="text-gray-400 text-sm">عرض الجدول الزمني</p>
            </div>
          </button>
          <button className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Bell size={24} className="text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">الإشعارات</p>
              <p className="text-gray-400 text-sm">عرض الإشعارات</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
