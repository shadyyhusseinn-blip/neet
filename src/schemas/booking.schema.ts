/**
 * Booking Validation Schema
 * Shared Zod schema for booking validation
 * Can be used in both frontend and Firebase Functions
 */

import { z } from 'zod';

export const bookingCategorySchema = z.enum([
  'wedding',
  'engagement',
  'birthday',
  'corporate',
  'portrait',
  'event',
]);

export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export const bookingAddonSchema = z.object({
  name: z.string().min(1, 'Addon name is required'),
  price: z.number().min(0, 'Price must be positive'),
});

export const bookingSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\d+$/, 'Phone must contain only digits'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  category: bookingCategorySchema,
  packageId: z.string().optional(),
  packageName: z.string().optional(),
  packagePrice: z.number().min(0).optional(),
  addons: z.array(bookingAddonSchema).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  status: bookingStatusSchema.default('pending'),
  promoCode: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
});

export const createBookingSchema = bookingSchema;

export const updateBookingSchema = bookingSchema.partial();

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
export type BookingCategory = z.infer<typeof bookingCategorySchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
