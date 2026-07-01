/**
 * Router Configuration
 * إعدادات المسارات باستخدام React Router v6
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Import layouts
import { PublicLayout } from '../../components/layout/PublicLayout';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StaffLayout } from '../../components/layout/StaffLayout';

// Lazy load heavy components
const LandingPage = lazy(() => import('../../pages/public/LandingPage'));
const PortfolioPage = lazy(() => import('../../pages/public/PortfolioPage'));
const PackagesPage = lazy(() => import('../../pages/public/PackagesPage'));
const ContactPage = lazy(() => import('../../pages/public/ContactPage'));
const ClientGallery = lazy(() => import('../../pages/public/ClientGallery'));
const ClientDeliveryPage = lazy(() => import('../../pages/public/ClientDeliveryPage'));

const AdminDashboard = lazy(() => import('../../pages/admin/Dashboard'));
const BookingsPage = lazy(() => import('../../pages/admin/BookingsPage'));
const NewBooking = lazy(() => import('../../pages/admin/NewBooking'));
const ClientGalleryManagement = lazy(() => import('../../pages/admin/ClientGalleryManagement'));
const UnifiedGalleryManagement = lazy(() => import('../../pages/admin/UnifiedGalleryManagement'));
const GalleryManagement = lazy(() => import('../../pages/admin/GalleryManagement'));
const CRMPage = lazy(() => import('../../pages/admin/CRMPage'));
const ExternalClientManagement = lazy(() => import('../../pages/admin/ExternalClientManagement'));
const StaffDashboard = lazy(() => import('../../pages/staff/StaffDashboard'));

const NewLoginScreen = lazy(() => import('../../pages/auth/NewLoginScreen'));
const AdminSelectionPage = lazy(() => import('../../pages/admin/AdminSelectionPage'));

const NotFound = lazy(() => import('../../pages/error/NotFound'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">جاري التحميل...</p>
    </div>
  </div>
);

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'gallery/:id', element: <ClientGallery /> },
      { path: 'delivery/:id', element: <ClientDeliveryPage /> },
      { path: 'home', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'new-booking', element: <NewBooking /> },
      { path: 'client-gallery', element: <ClientGalleryManagement /> },
      { path: 'galleries', element: <UnifiedGalleryManagement /> },
      { path: 'gallery-management', element: <GalleryManagement /> },
      { path: 'crm', element: <CRMPage /> },
      { path: 'clients', element: <ExternalClientManagement /> },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: 'dashboard', element: <StaffDashboard /> },
    ],
  },
  {
    path: '/login',
    element: <NewLoginScreen />,
  },
  {
    path: '/admin/selection',
    element: <AdminSelectionPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
