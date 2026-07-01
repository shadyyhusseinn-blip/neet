import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Booking } from '../../types';
import { storage } from '../../services/storage';
import { cn } from '../../lib/utils';

interface BookingCalendarProps {
  onBookingClick?: (booking: Booking) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function BookingCalendar({ onBookingClick, onDateClick, className }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [view, setView] = useState('dayGridMonth');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const allBookings = storage.getBookings();
    const calendarEvents = allBookings
      .filter((booking: Booking) => booking.status !== 'cancelled' && booking.status !== 'expired')
      .map((booking: Booking) => ({
        id: booking.id,
        title: `${booking.clientName} - ${booking.packageName}`,
        start: booking.date,
        end: booking.deliveryDate || booking.date,
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        extendedProps: {
          booking,
        },
      }));
    setBookings(calendarEvents);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981'; // green
      case 'temporary':
        return '#f59e0b'; // amber
      case 'postponed':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking as Booking;
    if (onBookingClick) {
      onBookingClick(booking);
    }
  };

  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  return (
    <div className={cn('bg-[#0B0B0F] rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">التقويم</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('dayGridMonth')}
            className={cn(
              'px-3 py-1 rounded text-sm',
              view === 'dayGridMonth' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
            )}
          >
            شهري
          </button>
          <button
            onClick={() => setView('timeGridWeek')}
            className={cn(
              'px-3 py-1 rounded text-sm',
              view === 'timeGridWeek' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
            )}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setView('timeGridDay')}
            className={cn(
              'px-3 py-1 rounded text-sm',
              view === 'timeGridDay' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
            )}
          >
            يومي
          </button>
          <button
            onClick={() => setView('listWeek')}
            className={cn(
              'px-3 py-1 rounded text-sm',
              view === 'listWeek' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
            )}
          >
            قائمة
          </button>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        events={bookings}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
        locale="ar"
        direction="rtl"
        height="auto"
        eventColor="#8b5cf6"
        eventTextColor="#ffffff"
        dayMaxEvents={3}
        moreLinkClick="popover"
        buttonText={{
          today: 'اليوم',
          month: 'شهر',
          week: 'أسبوع',
          day: 'يوم',
          list: 'قائمة',
        }}
      />
    </div>
  );
}
