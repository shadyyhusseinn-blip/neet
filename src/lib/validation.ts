import { z } from 'zod';

// Home page content schema
export const homeContentSchema = z.object({
  studioName: z.string().min(2, 'اسم المصور يجب أن يكون 2 أحرف على الأقل'),
  tagline: z.string().min(5, 'الوصف الرئيسي يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف التفصيلي يجب أن يكون 10 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  instagram: z.string().url('رابط انستغرام غير صالح').optional().or(z.literal('')),
  facebook: z.string().url('رابط فيسبوك غير صالح').optional().or(z.literal('')),
});

// Portfolio page content schema
export const portfolioContentSchema = z.object({
  pageTitle: z.string().min(2, 'عنوان الصفحة يجب أن يكون 2 أحرف على الأقل'),
  pageDescription: z.string().min(10, 'وصف الصفحة يجب أن يكون 10 أحرف على الأقل'),
  clientInstructions: z.string().min(10, 'إرشادات العملاء يجب أن تكون 10 أحرف على الأقل'),
});

// Packages page content schema
export const packagesContentSchema = z.object({
  pageTitle: z.string().min(2, 'عنوان الصفحة يجب أن يكون 2 أحرف على الأقل'),
  pageDescription: z.string().min(10, 'وصف الصفحة يجب أن يكون 10 أحرف على الأقل'),
  buttonText: z.string().min(2, 'نص الزر يجب أن يكون 2 أحرف على الأقل'),
});

// About page content schema
export const aboutContentSchema = z.object({
  photographerName: z.string().min(2, 'اسم المصور يجب أن يكون 2 أحرف على الأقل'),
  photographerTitle: z.string().min(5, 'العنوان التعريفي يجب أن يكون 5 أحرف على الأقل'),
  bio: z.string().min(20, 'السيرة الذاتية يجب أن تكون 20 حرف على الأقل'),
  yearsOfExperience: z.number().min(0, 'سنوات الخبرة يجب أن تكون رقم موجب'),
  weddingsCount: z.number().min(0, 'عدد الأفراح يجب أن يكون رقم موجب'),
});

// Booking validation schema
export const bookingSchema = z.object({
  clientName: z.string().min(3, 'اسم العميل يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم'),
  whatsappPhone: z.string().regex(/^01[0-9]{9}$/, 'رقم الواتساب يجب أن يبدأ بـ 01 ويكون 11 رقم').optional().or(z.literal('')),
  date: z.string().datetime('تاريخ الحجز غير صالح'),
  packageName: z.string().min(1, 'يجب اختيار باقة'),
  totalPrice: z.number().min(0, 'السعر الإجمالي يجب أن يكون رقم موجب'),
  discount: z.number().min(0, 'الخصم يجب أن يكون رقم موجب'),
  paidAmount: z.number().min(0, 'المبلغ المدفوع يجب أن يكون رقم موجب'),
  paymentStatus: z.enum(['paid', 'deposit', 'unpaid', 'confirmed']),
  status: z.enum(['confirmed', 'temporary', 'expired', 'cancelled', 'postponed']),
  workflowStatus: z.enum(['pending', 'shooting', 'editing', 'ready', 'delivered']),
  paymentMethod: z.string().optional(),
  deliveryDate: z.string().datetime('تاريخ التسليم غير صالح').optional(),
  deliveryMethod: z.string().optional(),
  eventLocation: z.string().optional(),
  eventTime: z.string().optional(),
  eventType: z.string().optional(),
  clientSource: z.string().optional(),
  notes: z.string().optional(),
});

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(3, 'اسم العميل يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم'),
  whatsappPhone: z.string().regex(/^01[0-9]{9}$/, 'رقم الواتساب يجب أن يبدأ بـ 01 ويكون 11 رقم').optional().or(z.literal('')),
  notes: z.string().optional(),
});

// Package validation schema
export const packageSchema = z.object({
  name: z.string().min(3, 'اسم الباقة يجب أن يكون 3 أحرف على الأقل'),
  price: z.number().min(0, 'السعر يجب أن يكون رقم موجب'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  category: z.enum(['photography', 'video', 'printing', 'locations', 'rooms', 'promo']),
  isActive: z.boolean(),
  features: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  bookingTerms: z.string().optional(),
});

// Expense validation schema
export const expenseSchema = z.object({
  name: z.string().min(3, 'اسم المصروف يجب أن يكون 3 أحرف على الأقل'),
  category: z.enum(['equipment', 'ads', 'transport', 'maintenance', 'other']),
  amount: z.number().min(0, 'المبلغ يجب أن يكون رقم موجب'),
  date: z.string().datetime('التاريخ غير صالح'),
  notes: z.string().optional(),
});

// Revenue validation schema
export const revenueSchema = z.object({
  type: z.enum(['deposit', 'partial', 'full', 'manual']),
  clientName: z.string().min(3, 'اسم العميل يجب أن يكون 3 أحرف على الأقل').optional(),
  bookingId: z.string().optional(),
  amount: z.number().min(0, 'المبلغ يجب أن يكون رقم موجب'),
  totalAmount: z.number().min(0, 'المبلغ الإجمالي يجب أن يكون رقم موجب').optional(),
  remaining: z.number().min(0, 'المبلغ المتبقي يجب أن يكون رقم موجب').optional(),
  date: z.string().datetime('التاريخ غير صالح'),
  paymentMethod: z.string().min(1, 'طريقة الدفع مطلوبة'),
  notes: z.string().optional(),
  source: z.enum(['booking', 'manual']),
});

// User validation schema
export const userSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  role: z.enum(['viewer', 'editor', 'admin', 'staff', 'developer', 'client-manager', 'employee']),
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم').optional().or(z.literal('')),
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل').optional(),
});

// Gallery validation schema
export const gallerySchema = z.object({
  title: z.string().min(3, 'عنوان المعرض يجب أن يكون 3 أحرف على الأقل'),
  clientName: z.string().min(3, 'اسم العميل يجب أن يكون 3 أحرف على الأقل'),
  eventDate: z.string().datetime('تاريخ الحدث غير صالح'),
  expiryDate: z.string().datetime('تاريخ الانتهاء غير صالح').optional(),
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'),
  isPublished: z.boolean(),
  showOnHomepage: z.boolean(),
  allowDownload: z.boolean(),
});

export type HomeContent = z.infer<typeof homeContentSchema>;
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
export type PackagesContent = z.infer<typeof packagesContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type PackageInput = z.infer<typeof packageSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type RevenueInput = z.infer<typeof revenueSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
