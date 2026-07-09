export type View = 'dashboard' | 'new-booking' | 'booking-records' | 'packages' | 'accounts' | 'backups' | 'settings' | 'editing-tracker' | 'studio-ai' | 'analytics' | 'whatsapp' | 'firebase' | 'activity-log' | 'user-management' | 'gallery-management' | 'gallery-editor' | 'unified-gallery-management' | 'client-delivery-management' | 'client-delivery' | 'developer' | 'landing' | 'login' | 'portfolio' | 'packages-page' | 'clients' | 'book-now' | 'payment' | 'about' | 'public-galleries-admin' | 'client-gallery' | 'staff-dashboard' | 'bookings-page' | 'content' | 'admin-home' | 'development' | 'booking-requests' | 'whatsapp-settings' | 'send-whatsapp' | 'tasks' | 'crm';

export type BookingRecordsTab = 'confirmed' | 'shooting' | 'editing' | 'review' | 'printing' | 'delivered' | 'cancelled' | 'customers' | 'workflow';

export type PricesAndOffersTab = 'packages' | 'offers';

export type BackupStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  date: string;
}

export interface DataLossWarning {
  lastBackupTime: string;
}
