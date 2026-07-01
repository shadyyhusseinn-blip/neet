import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function BookingsLogs() {
  const db = getFirestore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.phone?.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">سجل الحجوزات</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">العميل</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">التاريخ</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">الباقة</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">المبلغ</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">الحالة</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white">{booking.clientName}</td>
                <td className="px-6 py-4 text-gray-300">{booking.date}</td>
                <td className="px-6 py-4 text-gray-300">{booking.packageType}</td>
                <td className="px-6 py-4 text-gray-300">{booking.totalAmount} ج.م</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' :
                     booking.status === 'pending' ? 'قيد الانتظار' :
                     booking.status === 'completed' ? 'مكتمل' : 'ملغي'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye size={16} className="text-blue-400" />
                    </button>
                    <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Edit size={16} className="text-green-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
