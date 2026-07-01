import { useState } from 'react';
import { motion } from 'motion/react';
import { BookingCalendar } from '../../components/admin/BookingCalendar';
import { storage } from '../../services/storage';
import { Booking } from '../../types';
import { cn } from '../../lib/utils';

export function CalendarPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateBooking = () => {
    // Navigate to booking form with selected date
    if (selectedDate) {
      console.log('Create booking for:', selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">التقويم</h1>
          <p className="text-gray-400">عرض وإدارة جميع الحجوزات</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BookingCalendar
              onBookingClick={handleBookingClick}
              onDateClick={handleDateClick}
            />
          </div>

          <div className="space-y-6">
            {/* Selected Date Info */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedDate.toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <button
                  onClick={handleCreateBooking}
                  className="w-full btn-primary"
                >
                  إنشاء حجز جديد
                </button>
              </motion.div>
            )}

            {/* Selected Booking Info */}
            {selectedBooking && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  تفاصيل الحجز
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">العميل</p>
                    <p className="text-white font-medium">{selectedBooking.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الباقة</p>
                    <p className="text-white font-medium">{selectedBooking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">التاريخ</p>
                    <p className="text-white font-medium">
                      {new Date(selectedBooking.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <span
                      className={cn(
                        'inline-block px-3 py-1 rounded-full text-sm',
                        selectedBooking.status === 'confirmed' && 'bg-green-500/20 text-green-400',
                        selectedBooking.status === 'temporary' && 'bg-yellow-500/20 text-yellow-400',
                        selectedBooking.status === 'cancelled' && 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                إحصائيات سريعة
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">إجمالي الحجوزات</span>
                  <span className="text-white font-bold">
                    {storage.getBookings().length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">مؤكدة</span>
                  <span className="text-green-400 font-bold">
                    {storage.getBookings().filter(b => b.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">مؤقتة</span>
                  <span className="text-yellow-400 font-bold">
                    {storage.getBookings().filter(b => b.status === 'temporary').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
