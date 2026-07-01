export type PackageCategory = 'photography' | 'video' | 'printing' | 'locations' | 'rooms' | 'promo';

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  category: PackageCategory;
  isActive: boolean;
  profit?: number;
  year?: number;
  features?: string[];
  extras?: string[];
  bookingTerms?: string;
  expiresAt?: string; // For seasonal packages
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsappPhone?: string;
  totalBookings: number;
  totalPaid: number;
  lastBookingDate?: string;
  createdAt: string;
  notes?: string;
}

export type PaymentStatus = 'paid' | 'deposit' | 'unpaid' | 'confirmed';
export type BookingStatus = 'confirmed' | 'temporary' | 'expired' | 'cancelled' | 'postponed';
export type WorkflowStatus = 'pending' | 'shooting' | 'editing' | 'ready' | 'delivered';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  whatsappPhone?: string;
  date: string;
  packageName: string;
  totalPrice: number;
  profit?: number;
  discount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  workflowStatus: WorkflowStatus;
  paymentMethod?: string;
  deliveryDate?: string;
  deliveryMethod?: string;
  deliveryLink?: string;
  flashDrivePrice?: number;
  eventLocation?: string;
  eventTime?: string;
  eventType?: string;
  clientSource?: string;
  notes?: string;
  paymentScreenshot?: string;
  autoCancelDate?: string;
  createdAt: string;
  expiresAt?: string;
  paymentHistory?: PaymentRecord[];
  modificationHistory?: { id: string, field: string, oldValue: any, newValue: any, date: string }[];
  selectedPackages?: Package[];
  deliveryItems?: DeliveryItem[];
  tags?: { text: string, color: string }[];
  assignedTo?: string;
  profitMargin?: number;
}

export type ExpenseCategory = 'equipment' | 'ads' | 'transport' | 'maintenance' | 'other';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  receiptImage?: string;
}

export type PersonalExpenseCategory = 'food' | 'transport' | 'rent' | 'personal' | 'medical' | 'other';

export interface PersonalExpense {
  id: string;
  name: string;
  category: PersonalExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  isActive: boolean;
  createdAt: string;
}

export type RevenueType = 'deposit' | 'partial' | 'full' | 'manual';

export interface Revenue {
  id: string;
  type: RevenueType;
  clientName?: string;
  bookingId?: string;
  amount: number;
  totalAmount?: number;
  remaining?: number;
  date: string;
  paymentMethod: string;
  notes?: string;
  source: 'booking' | 'manual';
  createdAt: string;
}

export interface Backup {
  id: string;
  timestamp: number;
  date: string;
  source: string;
  size: number;
  data: any;
  description: string;
}

export interface BackupSettings {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  maxBackups: number;
  lastBackupDate?: string;
  cloudSyncUrl?: string;
  cloudSyncSecret?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  bookingId?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  discountValue: number;
  discountType: 'percent' | 'amount';
  isActive: boolean;
  createdAt: string;
}

export interface Supply {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  lastRestocked?: string;
  notes?: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  workerName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedEndingCash: number;
  actualEndingCash?: number;
  difference?: number;
  notes?: string;
  status: 'open' | 'closed';
}

export type UserRole = 'viewer' | 'editor' | 'admin' | 'staff' | 'developer' | 'client-manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBlocked: boolean;
  forceLogout?: boolean;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  avatar?: string;
  username?: string;
  password?: string;
}

export interface StudioSettings {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  facebook: string;
  instagram: string;
  currency: string;
  language: string;
  logo?: string;
  accentColor?: string;
  theme?: 'light' | 'dark';
  monthlyGoal?: number;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface Gallery {
  id: string;
  title: string;
  clientName: string;
  eventDate: string;
  expiryDate?: string;
  coverImage?: string;
  coverImageFileId?: string; // ImageKit file ID for cover image
  totalFilesCount: number;
  totalStorageSize: number;
  createdAt: string;
  updatedAt?: string;
  isPublished: boolean;
  showOnHomepage: boolean;
  showDateOnCover: boolean;
  allowDownload: boolean;
  password: string; // Plain text for admin display (stored as hash in Firestore)
  passwordHash: string; // Hashed password for security
  guestPassword?: string; // Password for guest viewing
  clientPassword?: string; // Password for client access
  bookingId?: string;
  sessionType?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  hasPasswordProtection: boolean;
  downloadQuality?: 'original' | 'web';
  enableAntiScreenshot?: boolean;
  hasOutstandingBalance?: boolean;
  vodafoneCashNumber?: string;
  isPaid?: boolean;
  googleDriveUrl?: string;
  photos?: GalleryPhoto[];
  imagekitFileIds?: string[]; // Array of ImageKit file IDs
  imagekitPaths?: string[]; // Array of ImageKit paths for signed URL generation
  reviews?: Review[];
  viewCount?: number;
  order?: number;
  sections?: {
    session?: 'public' | 'hidden' | 'download-only';
    hall?: 'public' | 'hidden' | 'download-only';
    family?: 'public' | 'hidden' | 'download-only';
  };
}

export interface GallerySection {
  id: string;
  name: string;
  orderIndex: number;
  filesCount: number;
  visibility: 'public' | 'client_only';
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
  title?: string;
  imagekitFileId?: string; // ImageKit file ID
  imagekitPath?: string; // ImageKit path for signed URL generation
  signedUrl?: string; // Temporary signed URL (30 min expiry)
  signedUrlExpiry?: number; // Timestamp when signed URL expires
}
