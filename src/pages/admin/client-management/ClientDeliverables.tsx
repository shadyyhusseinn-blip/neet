import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Check } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function ClientDeliverables() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deliverables, setDeliverables] = useState({
    autoNotify: true,
    defaultDeliveryDays: 30,
    watermarkEnabled: true,
    maxPhotosPerSession: 200,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'clientManagement'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.deliverables) setDeliverables(data.deliverables);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'clientManagement'), {
        deliverables,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
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
        <h2 className="text-2xl font-bold text-white">تسليمات العملاء</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50"
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
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>إشعار تلقائي للعميل</span>
            <input
              type="checkbox"
              checked={deliverables.autoNotify}
              onChange={(e) => setDeliverables({ ...deliverables, autoNotify: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إرسال إشعار تلقائي عند إتمام التسليم</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تفعيل العلامة المائية</span>
            <input
              type="checkbox"
              checked={deliverables.watermarkEnabled}
              onChange={(e) => setDeliverables({ ...deliverables, watermarkEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إضافة علامة مائية على الصور</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">أيام التسليم الافتراضية</label>
          <input
            type="number"
            value={deliverables.defaultDeliveryDays}
            onChange={(e) => setDeliverables({ ...deliverables, defaultDeliveryDays: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
          <p className="text-gray-400 text-sm mt-2">عدد الأيام الافتراضي لتسليم الصور</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">أقصى عدد صور للجلسة</label>
          <input
            type="number"
            value={deliverables.maxPhotosPerSession}
            onChange={(e) => setDeliverables({ ...deliverables, maxPhotosPerSession: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
          <p className="text-gray-400 text-sm mt-2">الحد الأقصى للصور المسموحة لكل جلسة</p>
        </div>
      </div>
    </div>
  );
}
