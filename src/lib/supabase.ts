// Supabase disabled - reverting to Firebase
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://croohiomrsjwygrzjluj.supabase.co';
// const supabaseAnonKey = 'sb_publishable_QJnmFBid2UKi5WU8fXiNnQ_xVG67t-Z';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types - disabled as we're reverting to Firebase
// export interface Database {
//   public: {
//     Tables: {
//       users: {
//         Row: {
//           id: string;
//           email: string;
//           name: string;
//           role: 'admin' | 'editor' | 'viewer';
//           is_blocked: boolean;
//           force_logout: boolean;
//           created_at: string;
//           last_login: string;
//         };
//         Insert: {
//           id?: string;
//           email: string;
//           name: string;
//           role?: 'admin' | 'editor' | 'viewer';
//           is_blocked?: boolean;
//           force_logout?: boolean;
//           created_at?: string;
//           last_login?: string;
//         };
//         Update: {
//           id?: string;
//           email?: string;
//           name?: string;
//           role?: 'admin' | 'editor' | 'viewer';
//           is_blocked?: boolean;
//           force_logout?: boolean;
//           created_at?: string;
//           last_login?: string;
//         };
//       };
//       bookings: {
//         Row: {
//           id: string;
//           client_name: string;
//           client_phone: string;
//           event_date: string;
//           package_id: string;
//           total_price: number;
//           paid_amount: number;
//           remaining_amount: number;
//           status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
//           notes: string;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           client_name: string;
//           client_phone: string;
//           event_date: string;
//           package_id: string;
//           total_price: number;
//           paid_amount?: number;
//           remaining_amount?: number;
//           status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
//           notes?: string;
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: {
//           id?: string;
//           client_name?: string;
//           client_phone?: string;
//           event_date?: string;
//           package_id?: string;
//           total_price?: number;
//           paid_amount?: number;
//           remaining_amount?: number;
//           status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
//           notes?: string;
//           created_at?: string;
//           updated_at?: string;
//         };
//       };
//       packages: {
//         Row: {
//           id: string;
//           name: string;
//           description: string;
//           price: number;
//           duration: string;
//           features: string[];
//           is_active: boolean;
//           created_at: string;
//         };
//         Insert: {
//           id?: string;
//           name: string;
//           description: string;
//           price: number;
//           duration: string;
//           features?: string[];
//           is_active?: boolean;
//           created_at?: string;
//         };
//         Update: {
//           id?: string;
//           name?: string;
//           description?: string;
//           price?: number;
//           duration?: string;
//           features?: string[];
//           is_active?: boolean;
//           created_at?: string;
//         };
//       };
//       galleries: {
//         Row: {
//           id: string;
//           title: string;
//           client_name: string;
//           event_date: string;
//           has_password_protection: boolean;
//           password: string;
//           photos: Array<{ url: string; title: string }>;
//           total_files_count: number;
//           is_published: boolean;
//           show_on_homepage: boolean;
//           cover_image: string;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           title: string;
//           client_name: string;
//           event_date?: string;
//           has_password_protection?: boolean;
//           password?: string;
//           photos?: Array<{ url: string; title: string }>;
//           total_files_count?: number;
//           is_published?: boolean;
//           show_on_homepage?: boolean;
//           cover_image?: string;
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: {
//           id?: string;
//           title?: string;
//           client_name?: string;
//           event_date?: string;
//           has_password_protection?: boolean;
//           password?: string;
//           photos?: Array<{ url: string; title: string }>;
//           total_files_count?: number;
//           is_published?: boolean;
//           show_on_homepage?: boolean;
//           cover_image?: string;
//           created_at?: string;
//           updated_at?: string;
//         };
//       };
//       client_deliveries: {
//         Row: {
//           id: string;
//           client_name: string;
//           title: string;
//           password: string;
//           payment_completed: boolean;
//           photos: Array<{ url: string; title: string }>;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           client_name: string;
//           title: string;
//           password: string;
//           payment_completed?: boolean;
//           photos?: Array<{ url: string; title: string }>;
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: {
//           id?: string;
//           client_name?: string;
//           title?: string;
//           password?: string;
//           payment_completed?: boolean;
//           photos?: Array<{ url: string; title: string }>;
//           created_at?: string;
//           updated_at?: string;
//         };
//       };
//       reviews: {
//         Row: {
//           id: string;
//           client_name: string;
//           rating: number;
//           comment: string;
//           gallery_id: string;
//           created_at: string;
//         };
//         Insert: {
//           id?: string;
//           client_name: string;
//           rating: number;
//           comment: string;
//           gallery_id?: string;
//           created_at?: string;
//         };
//         Update: {
//           id?: string;
//           client_name?: string;
//           rating?: number;
//           comment?: string;
//           gallery_id?: string;
//           created_at?: string;
//         };
//       };
//       page_content: {
//         Row: {
//           id: string;
//           page: string;
//           content: any;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           page: string;
//           content: any;
//           updated_at?: string;
//         };
//         Update: {
//           id?: string;
//           page?: string;
//           content?: any;
//           updated_at?: string;
//         };
//       };
//     };
//   };
// }
