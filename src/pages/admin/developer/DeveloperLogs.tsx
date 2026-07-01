import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuthStore } from '../../../stores/authStore';

export default function DeveloperLogs() {
  const db = getFirestore();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const q = collection(db, 'logs');
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const addLog = async (type: string, message: string) => {
    try {
      await addDoc(collection(db, 'logs'), {
        type,
        message,
        timestamp: new Date().toISOString(),
        userId: user?.email || 'unknown'
      });
      loadLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">السجلات</h2>
        <div className="flex gap-3">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">الكل</option>
            <option value="info">معلومات</option>
            <option value="warning">تحذيرات</option>
            <option value="error">أخطاء</option>
            <option value="success">نجاح</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadLogs()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white flex items-center gap-2"
          >
            <RefreshCw size={16} />
            تحديث
          </motion.button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Info size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد سجلات</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    log.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    log.type === 'success' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.type === 'error' ? 'خطأ' :
                     log.type === 'warning' ? 'تحذير' :
                     log.type === 'success' ? 'نجاح' : 'معلومات'}
                  </span>
                  <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <p className="text-gray-300">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('info', 'سجل معلومات جديد')}
          className="flex-1 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Info size={18} />
          إضافة سجل معلومات
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('warning', 'سجل تحذير جديد')}
          className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle size={18} />
          إضافة تحذير
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('error', 'سجل خطأ جديد')}
          className="flex-1 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle size={18} />
          إضافة خطأ
        </motion.button>
      </div>
    </div>
  );
}
