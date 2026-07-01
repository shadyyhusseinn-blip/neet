import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Download, RefreshCw, Check, AlertTriangle, Server } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

export default function DeveloperBackup() {
  const db = getFirestore();
  const [backupStatus, setBackupStatus] = useState('');
  const [lastBackup, setLastBackup] = useState('');
  const [settings, setSettings] = useState({
    appVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'advanced'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBackup = async () => {
    setBackupStatus('جاري إنشاء النسخة الاحتياطية...');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        timestamp: new Date().toISOString(),
        settings: settings
      };
      
      await addDoc(collection(db, 'backups'), backupData);
      
      setLastBackup(new Date().toISOString());
      setBackupStatus('تم إنشاء النسخة الاحتياطية بنجاح');
      
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupStatus('فشل إنشاء النسخة الاحتياطية');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">النسخ الاحتياطي</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Database size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إنشاء نسخة احتياطية</h3>
              <p className="text-gray-400 text-sm">نسخ احتياطي كامل للبيانات</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackup}
            disabled={backupStatus.includes('جاري')}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {backupStatus.includes('جاري') ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Download size={18} />
                إنشاء نسخة احتياطية
              </>
            )}
          </motion.button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Server size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">آخر نسخة احتياطية</h3>
              <p className="text-gray-400 text-sm">
                {lastBackup ? new Date(lastBackup).toLocaleString('ar-EG') : 'لا توجد نسخ احتياطية'}
              </p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            <p>الحالة: {backupStatus || 'جاهز'}</p>
          </div>
        </div>
      </div>

      {backupStatus && (
        <div className={`p-4 rounded-xl border ${
          backupStatus.includes('نجح') ? 'bg-green-500/20 border-green-500/30 text-green-400' :
          backupStatus.includes('فشل') ? 'bg-red-500/20 border-red-500/30 text-red-400' :
          'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            {backupStatus.includes('نجح') ? <Check size={20} /> :
             backupStatus.includes('فشل') ? <AlertTriangle size={20} /> :
             <RefreshCw size={20} className="animate-spin" />}
            <span>{backupStatus}</span>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">معلومات النظام</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span>إصدار التطبيق:</span>
            <span className="text-white">{settings.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>وضع الصيانة:</span>
            <span className={settings.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}>
              {settings.maintenanceMode ? 'مفعل' : 'معطل'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>وضع التصحيح:</span>
            <span className={settings.debugMode ? 'text-yellow-400' : 'text-green-400'}>
              {settings.debugMode ? 'مفعل' : 'معطل'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
