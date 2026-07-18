/**
 * Booking Repository
 * Handles all booking-related database operations
 */

import { BaseRepository } from './BaseRepository';
import { where, orderBy } from 'firebase/firestore';

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  date: string;
  category: string;
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
  addons?: Array<{ name: string; price: number }>;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  promoCode?: string;
  discountAmount?: number;
}

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super({ collectionName: 'bookings' });
  }

  /**
   * Find bookings by client phone
   */
  async findByPhone(phone: string): Promise<Booking[]> {
    return this.findWhere([where('phone', '==', phone)]);
  }

  /**
   * Find bookings by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return this.findWhere([
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
    ]);
  }

  /**
   * Find bookings by status
   */
  async findByStatus(status: Booking['status']): Promise<Booking[]> {
    return this.findWhere([where('status', '==', status)]);
  }

  /**
   * Find upcoming bookings
   */
  async findUpcoming(): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.findWhere([
      where('date', '>=', today),
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc'),
    ]);
  }

  /**
   * Check if a date is already booked
   */
  async isDateBooked(date: string): Promise<boolean> {
    try {
      const bookings = await this.findWhere([
        where('date', '==', date),
        where('status', 'in', ['confirmed', 'pending']),
      ]);
      return bookings.length > 0;
    } catch (error) {
      console.error('Error checking if date is booked', { date, error });
      throw error;
    }
  }

  /**
   * Get booking statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const allBookings = await this.findAll();
      
      return {
        total: allBookings.length,
        pending: allBookings.filter(b => b.status === 'pending').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        completed: allBookings.filter(b => b.status === 'completed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      };
    } catch (error) {
      console.error('Error getting booking stats', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookingRepository = new BookingRepository();
