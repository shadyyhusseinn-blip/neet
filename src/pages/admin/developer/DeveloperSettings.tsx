import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Check } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function DeveloperSettings() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    appVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false,
    maxUploadSize: 10,
    sessionTimeout: 30,
    enableAnalytics: true,
    enableErrorReporting: true,
    apiRateLimit: 100
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

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'advanced'), settings, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">الإعدادات المتقدمة</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check size={16} />
              تم الحفظ
            </>
          ) : (
            <>
              <Save size={16} />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </>
          )}
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إصدار التطبيق</label>
          <input
            type="text"
            value={settings.appVersion}
            onChange={(e) => setSettings({ ...settings, appVersion: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>وضع الصيانة</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">تعطيل الوصول للعميل عند التفعيل</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>وضع التصحيح</span>
            <input
              type="checkbox"
              checked={settings.debugMode}
              onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">تفعيل سجلات التصحيح التفصيلية</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تحليلات البيانات</span>
            <input
              type="checkbox"
              checked={settings.enableAnalytics}
              onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">جمع بيانات الاستخدام</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تقارير الأخطاء</span>
            <input
              type="checkbox"
              checked={settings.enableErrorReporting}
              onChange={(e) => setSettings({ ...settings, enableErrorReporting: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إرسال تقارير الأخطاء تلقائياً</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">الحد الأقصى للرفع (MB)</label>
          <input
            type="number"
            value={settings.maxUploadSize}
            onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">انتهاء الجلسة (دقيقة)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">حد معدل الطلبات</label>
          <input
            type="number"
            value={settings.apiRateLimit}
            onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>
  );
}
