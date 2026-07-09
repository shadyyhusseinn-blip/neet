/**
 * Booking Store
 * متجر إدارة الحجوزات
 */

import { create } from 'zustand';
import { Booking } from '../types';

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setBookings: (bookings: Booking[]) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,

  setBookings: (bookings) => set({ bookings }),
  
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, booking]
  })),
  
  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map((booking) =>
      booking.id === id ? { ...booking, ...updates } : booking
    ),
    selectedBooking: state.selectedBooking?.id === id
      ? { ...state.selectedBooking, ...updates }
      : state.selectedBooking
  })),
  
  removeBooking: (id) => set((state) => ({
    bookings: state.bookings.filter((booking) => booking.id !== id),
    selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));
