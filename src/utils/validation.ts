import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('البريد الإلكتروني غير صالح');
export const phoneSchema = z.string().regex(/^01[0-2,5][0-9]{8}$/, 'رقم الهاتف غير صالح');
export const nameSchema = z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100);
export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), 'التاريخ غير صالح');

// Booking validation
export const bookingSchema = z.object({
  clientName: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  eventType: z.string().min(1, 'نوع المناسبة مطلوب'),
  eventDate: dateSchema,
  location: z.string().optional(),
  notes: z.string().max(500).optional(),
  packageName: z.string().optional(),
  totalPrice: z.number().min(0).optional(),
});

// Gallery validation
export const gallerySchema = z.object({
  title: z.string().min(1, 'عنوان المعرض مطلوب').max(200),
  clientName: nameSchema,
  eventDate: dateSchema,
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل').optional(),
});

// User validation
export const userSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: z.enum(['admin', 'staff', 'gallery-manager', 'editor', 'viewer']),
  phone: phoneSchema.optional(),
});

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Validate and sanitize
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): T {
  const sanitized = Object.keys(data).reduce((acc, key) => {
    if (typeof data[key] === 'string') {
      acc[key] = sanitizeInput(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);

  return schema.parse(sanitized);
}
