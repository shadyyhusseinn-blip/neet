import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Check } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function ClientAppearance() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [appearance, setAppearance] = useState({
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    backgroundColor: '#050508',
    textColor: '#ffffff',
    accentColor: '#6366f1',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'clientManagement'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.appearance) setAppearance(data.appearance);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'clientManagement'), {
        appearance,
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
        <h2 className="text-2xl font-bold text-white">المظهر العام</h2>
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
          <label className="block text-gray-300 mb-2">اللون الأساسي</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.primaryColor}
              onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.primaryColor}
              onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">اللون الثانوي</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.secondaryColor}
              onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.secondaryColor}
              onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">لون الخلفية</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.backgroundColor}
              onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.backgroundColor}
              onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">لون التركيز</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-gray-300 mb-2">معاينة الألوان</label>
        <div className="flex gap-4">
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.primaryColor }}
          />
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.secondaryColor }}
          />
          <div 
            className="w-16 h-16 rounded-xl"
            style={{ backgroundColor: appearance.accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
