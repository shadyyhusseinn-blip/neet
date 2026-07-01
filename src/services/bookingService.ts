import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Types
export interface Booking {
  id?: string;
  clientName: string;
  phone: string;
  email?: string;
  date: string;
  packageType: string;
  totalAmount: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const db = getFirestore();

/**
 * Create a new booking document in the bookings collection
 * @param bookingData - The booking data to create
 * @returns Promise with the created booking document ID
 */
export async function createNewBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const bookingWithTimestamps = {
      ...bookingData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingWithTimestamps);
    console.log('Booking created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('فشل إنشاء الحجز. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Fetch booking logs with optional status filtering
 * @param status - Optional status filter (pending, confirmed, completed, cancelled)
 * @returns Promise with array of booking documents
 */
export async function fetchBookingLogs(status?: BookingStatus): Promise<Booking[]> {
  try {
    let bookingsQuery;
    const bookingsCollection = collection(db, 'bookings');

    if (status) {
      // Filter by status and order by date descending
      bookingsQuery = query(
        bookingsCollection,
        where('status', '==', status),
        orderBy('date', 'desc')
      );
    } else {
      // No filter, just order by date descending
      bookingsQuery = query(
        bookingsCollection,
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      bookings.push({
        id: doc.id,
        clientName: data.clientName || '',
        phone: data.phone || '',
        email: data.email || '',
        date: data.date || '',
        packageType: data.packageType || '',
        totalAmount: data.totalAmount || 0,
        deposit: data.deposit || 0,
        status: data.status || 'pending',
        notes: data.notes || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    console.log(`Fetched ${bookings.length} bookings${status ? ` with status: ${status}` : ''}`);
    return bookings;
  } catch (error) {
    console.error('Error fetching booking logs:', error);
    throw new Error('فشل جلب سجل الحجوزات. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Update an existing booking
 * @param bookingId - The ID of the booking to update
 * @param updateData - The data to update
 * @returns Promise<void>
 */
export async function updateBooking(
  bookingId: string,
  updateData: Partial<Omit<Booking, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const bookingRef = doc(db, 'bookings', bookingId);
    
    await updateDoc(bookingRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
    
    console.log('Booking updated successfully:', bookingId);
  } catch (error) {
    console.error('Error updating booking:', error);
    throw new Error('فشل تحديث الحجز. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Delete a booking
 * @param bookingId - The ID of the booking to delete
 * @returns Promise<void>
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const bookingRef = doc(db, 'bookings', bookingId);
    
    await deleteDoc(bookingRef);
    console.log('Booking deleted successfully:', bookingId);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw new Error('فشل حذف الحجز. يرجى المحاولة مرة أخرى.');
  }
}
