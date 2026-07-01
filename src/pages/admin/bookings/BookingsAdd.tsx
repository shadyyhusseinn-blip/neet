import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

export default function BookingsAdd() {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [newBooking, setNewBooking] = useState({
    clientName: '',
    phone: '',
    email: '',
    date: '',
    packageType: '',
    deposit: 0,
    totalAmount: 0,
    notes: '',
    status: 'pending'
  });

  const handleAddBooking = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setNewBooking({
        clientName: '',
        phone: '',
        email: '',
        date: '',
        packageType: '',
        deposit: 0,
        totalAmount: 0,
        notes: '',
        status: 'pending'
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding booking:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">إضافة حجز جديد</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">اسم العميل</label>
          <input
            type="text"
            value={newBooking.clientName}
            onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">رقم الهاتف</label>
          <input
            type="text"
            value={newBooking.phone}
            onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={newBooking.email}
            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">التاريخ</label>
          <input
            type="date"
            value={newBooking.date}
            onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">نوع الباقة</label>
          <select
            value={newBooking.packageType}
            onChange={(e) => setNewBooking({ ...newBooking, packageType: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="">اختر الباقة</option>
            <option value="الباقة الذهبية">الباقة الذهبية</option>
            <option value="الباقة المميزة">الباقة المميزة</option>
            <option value="الباقة الأساسية">الباقة الأساسية</option>
            <option value="باقة مخصصة">باقة مخصصة</option>
          </select>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">المبلغ الكلي</label>
          <input
            type="number"
            value={newBooking.totalAmount}
            onChange={(e) => setNewBooking({ ...newBooking, totalAmount: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">المقدم</label>
          <input
            type="number"
            value={newBooking.deposit}
            onChange={(e) => setNewBooking({ ...newBooking, deposit: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">الحالة</label>
          <select
            value={newBooking.status}
            onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <label className="block text-gray-300 mb-2">ملاحظات</label>
        <textarea
          value={newBooking.notes}
          onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddBooking}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saveSuccess ? (
          <>
            <Check size={20} />
            تم الحفظ
          </>
        ) : (
          <>
            <Plus size={20} />
            {saving ? 'جاري الحفظ...' : 'إضافة الحجز'}
          </>
        )}
      </motion.button>
    </div>
  );
}
