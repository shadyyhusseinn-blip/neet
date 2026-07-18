import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Types
export interface TimeSlot {
  start: string; // e.g., "09:00"
  end: string;   // e.g., "11:00"
}

export interface Photographer {
  id: string;
  name: string;
  email?: string;
}

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings: Array<{
    id: string;
    clientName: string;
    timeSlot: TimeSlot;
    date: string;
  }>;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: BookingConflict;
  warnings?: string[];
}

const db = getFirestore();

/**
 * Check if a photographer has confirmed bookings at the specified date and time
 * @param photographerId - The ID of the photographer to check
 * @param date - The date of the booking (YYYY-MM-DD format)
 * @param timeSlot - The time slot to check
 * @param excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns Promise with conflict information
 */
export async function checkPhotographerAvailability(
  photographerId: string,
  date: string,
  timeSlot: TimeSlot,
  excludeBookingId?: string
): Promise<BookingConflict> {
  try {
    const bookingsCollection = collection(db, 'bookings');
    
    // Query for confirmed bookings on the same date for the same photographer
    let bookingsQuery = query(
      bookingsCollection,
      where('photographerId', '==', photographerId),
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    const querySnapshot = await getDocs(bookingsQuery);
    const conflictingBookings: Array<{
      id: string;
      clientName: string;
      timeSlot: TimeSlot;
      date: string;
    }> = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Exclude the current booking if updating
      if (excludeBookingId && doc.id === excludeBookingId) {
        return;
      }

      const bookingTimeSlot: TimeSlot = data.timeSlot || { start: '00:00', end: '23:59' };
      
      // Check for time overlap
      if (doTimeSlotsOverlap(timeSlot, bookingTimeSlot)) {
        conflictingBookings.push({
          id: doc.id,
          clientName: data.clientName || 'عميل',
          timeSlot: bookingTimeSlot,
          date: data.date || date
        });
      }
    });

    const hasConflict = conflictingBookings.length > 0;

    return {
      hasConflict,
      conflictingBookings,
      message: hasConflict 
        ? 'هذا المصور لديه جلسة تصوير أخرى في هذا الوقت، يرجى اختيار مصور آخر أو تغيير الموعد'
        : undefined
    };
  } catch (error) {
    console.error('Error checking photographer availability:', error);
    throw new Error('فشل التحقق من توفر المصور. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Check if two time slots overlap
 * @param slot1 - First time slot
 * @param slot2 - Second time slot
 * @returns true if slots overlap
 */
function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);

  // Check for overlap
  return start1 < end2 && end1 > start2;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param time - Time string in HH:MM format
 * @returns minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate a new booking before creation
 * @param bookingData - The booking data to validate
 * @returns Promise with validation result
 */
export async function validateNewBooking(
  bookingData: {
    photographerId: string;
    date: string;
    timeSlot: TimeSlot;
    clientName: string;
    phone: string;
    packageType: string;
    totalAmount: number;
  }
): Promise<ValidationResult> {
  const warnings: string[] = [];

  // Check photographer availability
  const conflictCheck = await checkPhotographerAvailability(
    bookingData.photographerId,
    bookingData.date,
    bookingData.timeSlot
  );

  if (conflictCheck.hasConflict) {
    return {
      isValid: false,
      conflicts: conflictCheck,
      warnings
    };
  }

  // Additional validations can be added here
  // e.g., check if client has unpaid bookings, etc.

  return {
    isValid: true,
    conflicts: {
      hasConflict: false,
      conflictingBookings: []
    },
    warnings
  };
}

/**
 * Get available photographers for a specific date and time slot
 * @param photographerIds - Array of photographer IDs to check
 * @param date - The date to check
 * @param timeSlot - The time slot to check
 * @returns Promise with available photographer IDs
 */
export async function getAvailablePhotographers(
  photographerIds: string[],
  date: string,
  timeSlot: TimeSlot
): Promise<string[]> {
  const availablePhotographers: string[] = [];

  for (const photographerId of photographerIds) {
    const conflictCheck = await checkPhotographerAvailability(
      photographerId,
      date,
      timeSlot
    );

    if (!conflictCheck.hasConflict) {
      availablePhotographers.push(photographerId);
    }
  }

  return availablePhotographers;
}

/**
 * Check for any booking conflicts on a specific date
 * @param date - The date to check
 * @returns Promise with all conflicts on that date
 */
export async function checkDateConflicts(
  date: string
): Promise<Record<string, BookingConflict>> {
  try {
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    const querySnapshot = await getDocs(bookingsQuery);
    const conflicts: Record<string, BookingConflict> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const photographerId = data.photographerId || 'unassigned';
      
      if (!conflicts[photographerId]) {
        conflicts[photographerId] = {
          hasConflict: true,
          conflictingBookings: []
        };
      }

      conflicts[photographerId].conflictingBookings.push({
        id: doc.id,
        clientName: data.clientName || 'عميل',
        timeSlot: data.timeSlot || { start: '00:00', end: '23:59' },
        date: data.date || date
      });
    });

    return conflicts;
  } catch (error) {
    console.error('Error checking date conflicts:', error);
    throw new Error('فشل التحقق من تعارضات التاريخ. يرجى المحاولة مرة أخرى.');
  }
}
