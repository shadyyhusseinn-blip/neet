import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Check, DollarSign } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export default function BookingsFinance() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [accounts, setAccounts] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsDoc = await getDoc(doc(db, 'settings', 'accounts'));
      if (accountsDoc.exists()) {
        setAccounts(accountsDoc.data());
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'accounts'), accounts, { merge: true });
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
        <h2 className="text-2xl font-bold text-white">الحسابات المالية</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 disabled:opacity-50"
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

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">إجمالي الإيرادات</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.totalRevenue.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-red-400" />
            <span className="text-red-400 text-sm font-semibold">إجمالي المصروفات</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.totalExpenses.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">مدفوعات معلقة</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.pendingPayments.toLocaleString()} ج.م</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">مدفوعات مكتملة</span>
          </div>
          <p className="text-3xl font-bold text-white">{accounts.completedPayments.toLocaleString()} ج.م</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إجمالي الإيرادات</label>
          <input
            type="number"
            value={accounts.totalRevenue}
            onChange={(e) => setAccounts({ ...accounts, totalRevenue: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إجمالي المصروفات</label>
          <input
            type="number"
            value={accounts.totalExpenses}
            onChange={(e) => setAccounts({ ...accounts, totalExpenses: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">مدفوعات معلقة</label>
          <input
            type="number"
            value={accounts.pendingPayments}
            onChange={(e) => setAccounts({ ...accounts, pendingPayments: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">مدفوعات مكتملة</label>
          <input
            type="number"
            value={accounts.completedPayments}
            onChange={(e) => setAccounts({ ...accounts, completedPayments: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>
  );
}
