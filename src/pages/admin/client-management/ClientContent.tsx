import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Check } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function ClientContent() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [content, setContent] = useState({
    heroTitle: 'شادي حسين',
    heroSubtitle: 'مصور محترف لحفظ ذكرياتك الثمينة',
    aboutText: 'نحول لحظاتك إلى ذكريات خالدة بلمسة فنية وإبداعية',
    contactPhone: '+20 123 456 7890',
    contactEmail: 'contact@shadyhussein.com',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'clientManagement'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.content) setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'clientManagement'), {
        content,
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
        <h2 className="text-2xl font-bold text-white">إدارة المحتوى</h2>
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

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">عنوان الصفحة الرئيسية</label>
          <input
            type="text"
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">العنوان الفرعي</label>
          <input
            type="text"
            value={content.heroSubtitle}
            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">نص "عننا"</label>
          <textarea
            value={content.aboutText}
            onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-gray-300 mb-2">رقم الهاتف</label>
            <input
              type="text"
              value={content.contactPhone}
              onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={content.contactEmail}
              onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
