import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import { useNotifications } from './hooks/useNotifications';
import { useAuthStore } from './stores/authStore';
import { cn } from './lib/utils';
import { storage } from './services/storage';
import { firebaseService } from './services/firebase';
import { firestoreSync } from './services/firestoreSync';

// Core components (not lazy loaded)
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/shared/ToastContainer';
import CommandPalette from './components/shared/CommandPalette';
import NotificationPanel from './components/shared/NotificationPanel';
import DeliveryAlarmModal from './components/modals/DeliveryAlarmModal';
import DataLossWarningModal from './components/modals/DataLossWarningModal';
import EditingStatusOverlay from './components/layout/EditingStatusOverlay';

// Lazy loaded components for code splitting
const UnifiedLayout = lazy(() => import('./design-system/layouts').then(m => ({ default: m.UnifiedLayout })));
const UnifiedDashboard = lazy(() => import('./pages/unified/UnifiedDashboard'));
const ImmersiveLanding = lazy(() => import('./pages/public/ImmersiveLanding'));
const ClientLanding = lazy(() => import('./pages/new-design/ClientLanding'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const NewBooking = lazy(() => import('./pages/admin/NewBooking'));
const BookingRecords = lazy(() => import('./pages/admin/BookingRecords'));
const Packages = lazy(() => import('./pages/admin/Packages'));
const Accounts = lazy(() => import('./pages/admin/Accounts'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const UnifiedBackup = lazy(() => import('./pages/admin/UnifiedBackup'));
const EditingTracker = lazy(() => import('./pages/admin/EditingTracker'));
const StudioAI = lazy(() => import('./pages/admin/StudioAI'));
const WhatsAppParser = lazy(() => import('./pages/admin/WhatsAppParser'));
const FirebaseConfigPage = lazy(() => import('./pages/admin/FirebaseConfigPage'));
const ActivityLog = lazy(() => import('./pages/admin/ActivityLog'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const Developer = lazy(() => import('./pages/admin/Developer').then(m => ({ default: m.Developer })));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement').then(m => ({ default: m.GalleryManagement })));
const GalleryEditor = lazy(() => import('./pages/admin/GalleryEditor'));
const PublicGalleriesAdmin = lazy(() => import('./pages/admin/PublicGalleriesAdmin'));
const ClientCRM = lazy(() => import('./pages/admin/ClientCRM'));
const ClientPhotoGallery = lazy(() => import('./pages/admin/ClientPhotoGallery').then(m => ({ default: m.ClientPhotoGallery })));
const ContractPreview = lazy(() => import('./pages/admin/ContractPreview'));
const MessagesSection = lazy(() => import('./pages/admin/MessagesSection').then(m => ({ default: m.MessagesSection })));
const NotificationSettings = lazy(() => import('./pages/admin/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const PricesAndOffers = lazy(() => import('./pages/admin/PricesAndOffers'));
const Workflow = lazy(() => import('./pages/admin/Workflow'));
const BookingForm = lazy(() => import('./pages/admin/BookingForm'));
const EditBookingModal = lazy(() => import('./pages/admin/EditBookingModal'));
const NewLoginScreen = lazy(() => import('./pages/auth/NewLoginScreen').then(m => ({ default: m.NewLoginScreen })));
const PublicGalleries = lazy(() => import('./components/shared/PublicGalleries'));
const PublicGalleryLanding = lazy(() => import('./components/shared/PublicGalleryLanding'));
const ClientLayout = lazy(() => import('./layouts/ClientLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DeveloperLayout = lazy(() => import('./layouts/DeveloperLayout'));
const ClientManagementLayout = lazy(() => import('./layouts/ClientManagementLayout'));
const BookingsLayout = lazy(() => import('./layouts/BookingsLayout'));
const DeveloperDashboard = lazy(() => import('./pages/admin/developer/DeveloperDashboard'));
const DeveloperSettings = lazy(() => import('./pages/admin/developer/DeveloperSettings'));
const DeveloperLogs = lazy(() => import('./pages/admin/developer/DeveloperLogs'));
const DeveloperBackup = lazy(() => import('./pages/admin/developer/DeveloperBackup'));
const DeveloperPortalDashboard = lazy(() => import('./pages/developer/DeveloperPortalDashboard'));
const ClientManagerPortalDashboard = lazy(() => import('./pages/client-manager/ClientManagerPortalDashboard'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const PackagesPage = lazy(() => import('./pages/public/PackagesPage'));
const UnifiedLoginPage = lazy(() => import('./pages/public/UnifiedLoginPage'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminSelectionPage = lazy(() => import('./pages/admin/AdminSelectionPage'));
const ExternalClientsDashboard = lazy(() => import('./pages/admin/ExternalClientsDashboard'));
const ExternalClientManagement = lazy(() => import('./pages/admin/ExternalClientManagement'));
const BookingsAccountsDashboard = lazy(() => import('./pages/admin/BookingsAccountsDashboard'));
const BookingsAccountsManagement = lazy(() => import('./pages/admin/BookingsAccountsManagement'));
const DeveloperToolsDashboard = lazy(() => import('./pages/admin/DeveloperToolsDashboard'));
const DeveloperToolsManagement = lazy(() => import('./pages/admin/DeveloperToolsManagement'));
const DevelopmentPage = lazy(() => import('./pages/admin/DevelopmentPage'));

// New nested routing pages
const ClientDashboard = lazy(() => import('./pages/admin/client-management/ClientDashboard'));
const ClientAppearance = lazy(() => import('./pages/admin/client-management/ClientAppearance'));
const ClientDeliverables = lazy(() => import('./pages/admin/client-management/ClientDeliverables'));
const ClientContent = lazy(() => import('./pages/admin/client-management/ClientContent'));
const BookingsDashboard = lazy(() => import('./pages/admin/bookings/BookingsDashboard'));
const BookingsLogs = lazy(() => import('./pages/admin/bookings/BookingsLogs'));
const BookingsAdd = lazy(() => import('./pages/admin/bookings/BookingsAdd'));
const BookingsFinance = lazy(() => import('./pages/admin/bookings/BookingsFinance'));
const BookingsPage = lazy(() => import('./pages/admin/BookingsPage'));
const ContentPage = lazy(() => import('./pages/admin/ContentPage'));
const SendWhatsApp = lazy(() => import('./pages/admin/SendWhatsApp'));
const BookNowPage = lazy(() => import('./pages/public/BookNowPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const UnifiedGalleryManagement = lazy(() => import('./pages/admin/UnifiedGalleryManagement'));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard'));

// New pages from design improvements
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const TeamManagementPage = lazy(() => import('./pages/admin/TeamManagementPage'));
const EquipmentManagementPage = lazy(() => import('./pages/admin/EquipmentManagementPage'));

// Heavy components - lazy loaded for performance
const OffersPage = lazy(() => import('./pages/admin/OffersPage'));
const FinancialReportsPage = lazy(() => import('./pages/admin/FinancialReportsPage'));

// New pages from additional suggestions
const TaskManagementPage = lazy(() => import('./pages/admin/TaskManagementPage'));
const CRMPage = lazy(() => import('./pages/admin/CRMPage'));
const ClientDeliveryManagement = lazy(() => import('./pages/admin/ClientDeliveryManagement'));
const ClientDeliveryPage = lazy(() => import('./pages/public/ClientDeliveryPage'));
const ClientGallery = lazy(() => import('./pages/public/ClientGallery'));
const ClientGalleryManagement = lazy(() => import('./pages/admin/ClientGalleryManagement').then(m => ({ default: m.ClientGalleryManagement })));

// Simple Gallery System
const SimpleGalleryCreate = lazy(() => import('./pages/admin/SimpleGalleryCreate'));
const SimpleGalleryView = lazy(() => import('./pages/public/SimpleGalleryView'));

// Simple Login
const SimpleLogin = lazy(() => import('./pages/auth/SimpleLogin'));

// Simple Dashboards
const SimpleAdminDashboard = lazy(() => import('./pages/admin/SimpleAdminDashboard'));
const SimpleStaffDashboard = lazy(() => import('./pages/staff/SimpleStaffDashboard'));

// Error pages
const NotFound = lazy(() => import('./pages/error/NotFound'));
const ServerError = lazy(() => import('./pages/error/ServerError'));
const NetworkError = lazy(() => import('./pages/error/NetworkError'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050508]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">جاري التحميل...</p>
    </div>
  </div>
);

const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const PaymentPage = lazy(() => import('./pages/public/PaymentPage'));
const BookingRequests = lazy(() => import('./pages/admin/BookingRequests'));
const WhatsAppSettings = lazy(() => import('./pages/admin/WhatsAppSettings'));

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

function AppContent() {
  const app = useApp();
  const notifications = useNotifications();
  const { user, isLoggedIn, isLoading, initializeAuth, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isGalleryView = location.pathname.startsWith('/gallery/') && !location.pathname.startsWith('/admin/galleries/');
  const galleryBookingId = isGalleryView ? location.pathname.split('/gallery/')[1] : null;
  const isPublicGalleries = location.pathname === '/galleries';
  const isAdminGallery = location.pathname.startsWith('/admin/galleries/');
  const isDeliveryView = location.pathname.startsWith('/delivery/');
  const deliveryId = isDeliveryView ? location.pathname.split('/delivery/')[1] : null;

  const handleLoginSuccess = (userData: any) => {
    if (userData.role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/admin/selection');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  useEffect(() => {
    // Initialize Firebase
    firebaseService.initialize().then(() => {
      console.log('Firebase initialized');
      // Start Firestore sync after Firebase is ready
      if (firebaseService.isReady()) {
        console.log('Starting Firestore sync...');
        firestoreSync.startSync(5000); // Sync every 5 seconds
        firestoreSync.subscribeToRealtimeUpdates();
      }
    }).catch((error) => {
      console.error('Failed to initialize Firebase:', error);
    });

    initializeAuth();
    storage.initCrossTabSync();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        app.setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        app.setIsCommandPaletteOpen(false);
        notifications.setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) app.navigateTo(detail);
    };
    window.addEventListener('navigate-to', handleNavigate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('navigate-to', handleNavigate);
      firestoreSync.stopSync();
      firestoreSync.unsubscribeFromRealtimeUpdates();
    };
  }, []);

  const renderView = () => {
    const currentPath = location.pathname;
    let view = 'dashboard';

    if (currentPath === '/') view = 'landing';
    else if (currentPath === '/new-design') view = 'client-landing';
    else if (currentPath === '/old-design') view = 'landing';
    else if (currentPath === '/portfolio') view = 'portfolio';
    else if (currentPath === '/packages') view = 'packages';
    else if (currentPath === '/contact') view = 'contact';
    else if (currentPath === '/clients') view = 'clients';
    else if (currentPath === '/book-now') view = 'book-now';
    else if (currentPath === '/payment') view = 'payment';
    else if (currentPath === '/about') view = 'about';
    else if (currentPath === '/galleries') view = 'portfolio';
    else if (currentPath === '/home') view = 'landing';
    else if (currentPath === '/login') view = 'simple-login';
    else if (currentPath === '/unified-login') view = 'simple-login';
    else if (currentPath === '/staff/dashboard') view = 'simple-staff-dashboard';
    // Developer routes moved to /admin/developer/*
    else if (currentPath === '/developer') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/developer/dashboard') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/developer/settings') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/developer/logs') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/developer/backup') view = 'admin-home'; // Redirect to admin
    // Client-manager routes moved to /admin/*
    else if (currentPath === '/client-manager') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/client-manager/dashboard') view = 'admin-home'; // Redirect to admin
    else if (currentPath === '/client-manager/clients') view = 'external-clients-dashboard'; // Keep as admin page
    else if (currentPath === '/client-manager/galleries') view = 'unified-gallery-management'; // Keep as admin page
    else if (currentPath === '/client-manager/gallery-editor') view = 'gallery-editor'; // Keep as admin page
    else if (currentPath === '/client-manager/public-galleries') view = 'public-galleries-admin'; // Keep as admin page
    else if (currentPath === '/admin/selection') view = 'admin-selection';
    else if (currentPath === '/admin/new-design') view = 'new-design-placeholder';
    // Unified dashboard routes
    else if (currentPath === '/admin/unified') view = 'unified-dashboard';
    else if (currentPath === '/staff/unified') view = 'unified-dashboard';
    else if (currentPath === '/developer/unified') view = 'unified-dashboard';
    else if (currentPath === '/client-manager/unified') view = 'unified-dashboard';
    else if (currentPath === '/admin/external-clients') view = 'external-clients-dashboard';
    else if (currentPath === '/admin/client-management') view = 'external-client-management';
    else if (currentPath === '/admin/bookings-accounts') view = 'bookings-accounts-dashboard';
    else if (currentPath === '/admin/bookings-management') view = 'bookings-accounts-management';
    else if (currentPath === '/admin/developer-tools') view = 'developer-tools-dashboard';
    else if (currentPath === '/admin/developer-management') view = 'developer-tools-management';
    // New nested routing
    else if (currentPath.startsWith('/admin/developer/')) view = 'developer-layout';
    else if (currentPath.startsWith('/admin/client-management/')) view = 'client-management-layout';
    else if (currentPath.startsWith('/admin/bookings/')) view = 'bookings-layout';
    else if (currentPath === '/admin') view = 'simple-admin-dashboard';
    else if (currentPath === '/admin/development') view = 'development';
    else if (currentPath === '/admin/bookings') view = 'bookings-page';
    else if (currentPath === '/admin/content') view = 'content';
    else if (currentPath === '/admin/dashboard') view = 'dashboard';
    else if (currentPath === '/admin/analytics') view = 'analytics';
    else if (currentPath === '/admin/galleries') view = 'unified-gallery-management';
    else if (currentPath === '/admin/client-deliveries') view = 'client-delivery-management';
    else if (currentPath === '/admin/booking-requests') view = 'booking-requests';
    else if (currentPath === '/admin/whatsapp-settings') view = 'whatsapp-settings';
    else if (currentPath === '/admin/send-whatsapp') view = 'send-whatsapp';
    else if (currentPath === '/admin/users') view = 'user-management';
    else if (currentPath === '/admin/client-gallery') view = 'client-gallery-management';
    else if (currentPath === '/admin/settings') view = 'settings';
    else if (currentPath === '/galleries-admin') {
      navigate('/admin/content');
      return null;
    }
    else if (currentPath === '/dashboard') {
      navigate('/admin');
      return null;
    }
    else if (currentPath === '/login') view = 'login';
    else if (currentPath === '/new-booking') view = 'new-booking';
    else if (currentPath === '/accounts') view = 'accounts';
    else if (currentPath === '/studio-ai') view = 'studio-ai';
    else if (currentPath === '/backups' || currentPath === '/backup-sync') view = 'backups';
    else if (currentPath === '/editing-tracker') view = 'editing-tracker';
    else if (currentPath === '/whatsapp') view = 'whatsapp';
    else if (currentPath === '/firebase') view = 'firebase-config';
    else if (currentPath === '/activity-log') view = 'activity-log';
    else if (currentPath === '/public-galleries-admin') view = 'public-galleries-admin';
    else if (currentPath.startsWith('/admin/galleries/')) view = 'gallery-editor';
    else if (currentPath.startsWith('/gallery/')) view = 'simple-gallery-view';
    else if (currentPath === '/admin/simple-gallery-create') view = 'simple-gallery-create';
    else if (currentPath.startsWith('/delivery/')) view = 'client-delivery';
    else if (currentPath === '/tasks') view = 'tasks';
    else if (currentPath === '/crm') view = 'crm';

    if (app.currentView !== view) {
      app.setCurrentView(view);
    }

    switch (view) {
      case 'client-landing':
        return <ClientLanding />;
      case 'immersive-landing':
        return <ImmersiveLanding />;
      case 'landing':
        return <LandingPage />;
      case 'simple-login':
        return <SimpleLogin />;
      case 'login':
        return <SimpleLogin />;
      case 'unified-login':
        return <SimpleLogin />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'packages':
        return <PackagesPage />;
      case 'contact':
        return <ContactPage />;
      case 'book-now':
        return <BookNowPage />;
      case 'payment':
        return <PaymentPage />;
      case 'about':
        return <AboutPage />;
      case 'public-galleries-admin':
        return <PublicGalleriesAdmin />;
      case 'client-gallery':
        return <ClientGallery />;
      case 'staff-dashboard':
        return <StaffDashboard />;
      case 'developer-portal-dashboard':
        return <DeveloperPortalDashboard />;
      case 'developer-dashboard':
        return <DeveloperDashboard />;
      case 'developer-settings':
        return <DeveloperSettings />;
      case 'developer-logs':
        return <DeveloperLogs />;
      case 'developer-backup':
        return <DeveloperBackup />;
      case 'client-manager-portal-dashboard':
        return <ClientManagerPortalDashboard />;
      case 'admin-selection':
        return <AdminSelectionPage />;
      case 'unified-dashboard':
        const role = user?.role === 'viewer' ? 'admin' : (user?.role || 'admin');
        return (
          <UnifiedLayout role={role as 'admin' | 'staff' | 'developer' | 'client-manager'}>
            <UnifiedDashboard />
          </UnifiedLayout>
        );
      case 'external-clients-dashboard':
        return <ExternalClientsDashboard />;
      case 'external-client-management':
        return <ExternalClientManagement />;
      case 'bookings-accounts-dashboard':
        return <BookingsAccountsDashboard />;
      case 'bookings-accounts-management':
        return <BookingsAccountsManagement />;
      case 'developer-tools-dashboard':
        return <DeveloperToolsDashboard />;
      case 'developer-tools-management':
        return <DeveloperToolsManagement />;
      case 'developer-layout':
        return (
          <DeveloperLayout>
            {location.pathname === '/admin/developer/dashboard' && <DeveloperDashboard />}
            {location.pathname === '/admin/developer/settings' && <DeveloperSettings />}
            {location.pathname === '/admin/developer/logs' && <DeveloperLogs />}
            {location.pathname === '/admin/developer/backup' && <DeveloperBackup />}
          </DeveloperLayout>
        );
      case 'client-management-layout':
        return (
          <ClientManagementLayout>
            {location.pathname === '/admin/client-management/dashboard' && <ClientDashboard />}
            {location.pathname === '/admin/client-management/appearance' && <ClientAppearance />}
            {location.pathname === '/admin/client-management/deliverables' && <ClientDeliverables />}
            {location.pathname === '/admin/client-management/content' && <ClientContent />}
          </ClientManagementLayout>
        );
      case 'bookings-layout':
        return (
          <BookingsLayout>
            {location.pathname === '/admin/bookings/dashboard' && <BookingsDashboard />}
            {location.pathname === '/admin/bookings/logs' && <BookingsLogs />}
            {location.pathname === '/admin/bookings/add' && <BookingsAdd />}
            {location.pathname === '/admin/bookings/finance' && <BookingsFinance />}
          </BookingsLayout>
        );
      case 'admin-home':
        return <AdminHome />;
      case 'development':
        return <DevelopmentPage />;
      case 'bookings-page':
        return <BookingsPage />;
      case 'content':
        return <ContentPage />;
      case 'dashboard':
        return <Dashboard setView={(v) => navigate('/' + v)} />;
      case 'new-booking':
        return (
          <NewBooking
            onComplete={() => navigate('/bookings')}
            onCancel={() => navigate('/dashboard')}
          />
        );
      case 'booking-records':
        return (
          <BookingRecords
            activeTab={app.bookingRecordsTab}
            onTabChange={app.setBookingRecordsTab}
          />
        );
      case 'booking-requests':
        return <BookingRequests />;
      case 'whatsapp-settings':
        return <WhatsAppSettings />;
      case 'send-whatsapp':
        return <SendWhatsApp />;
      case 'accounts':
        return <Accounts setView={(v) => navigate('/' + v)} />;
      case 'studio-ai':
        return <StudioAI />;
      case 'settings':
        return <Settings />;
      case 'backups':
      case 'backup-sync':
        return <UnifiedBackup />;
      case 'editing-tracker':
        return <EditingTracker />;
      case 'whatsapp':
        return <WhatsAppParser />;
      case 'firebase-config':
        return <FirebaseConfigPage />;
      case 'activity-log':
        return <ActivityLog />;
      case 'user-management':
        return <UserManagement />;
      case 'client-gallery-management':
        return <ClientGalleryManagement />;
      case 'simple-gallery-create':
        return <SimpleGalleryCreate />;
      case 'simple-gallery-view':
        return <SimpleGalleryView />;
      case 'simple-admin-dashboard':
        return <SimpleAdminDashboard />;
      case 'simple-staff-dashboard':
        return <SimpleStaffDashboard />;
      case 'gallery-management':
        return <GalleryManagement />;
      case 'gallery-editor':
        return <GalleryEditor />;
      case 'unified-gallery-management':
        return <UnifiedGalleryManagement />;
      case 'client-delivery-management':
        return <ClientDeliveryManagement />;
      case 'client-delivery':
        return <ClientDeliveryPage />;
      case 'developer':
        return <Developer />;
      // New pages from design improvements
      case 'calendar':
        return <CalendarPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'team':
        return <TeamManagementPage />;
      case 'equipment':
        return <EquipmentManagementPage />;
      case 'offers':
        return <OffersPage />;
      case 'financial-reports':
        return <FinancialReportsPage />;
      // New pages from additional suggestions
      case 'tasks':
        return <TaskManagementPage />;
      case 'crm':
        return <CRMPage />;
      default:
        return <Dashboard setView={(v) => navigate('/' + v)} />;
    }
  };

  const isPublicRoute = location.pathname === '/' ||
                        location.pathname === '/home' ||
                        location.pathname === '/portfolio' ||
                        location.pathname === '/packages' ||
                        location.pathname === '/clients' ||
                        location.pathname === '/book-now' ||
                        location.pathname === '/about' ||
                        location.pathname === '/galleries' ||
                        location.pathname.startsWith('/gallery/') ||
                        location.pathname.startsWith('/delivery/') ||
                        location.pathname === '/login' ||
                        location.pathname === '/admin/login' ||
                        location.pathname === '/staff/dashboard' ||
                        // TEMPORARILY MAKE DEVELOPER AND CLIENT-MANAGER PUBLIC FOR REDIRECT
                        location.pathname.startsWith('/developer/') ||
                        location.pathname === '/developer' ||
                        location.pathname.startsWith('/client-manager/') ||
                        location.pathname === '/client-manager';

  const isAdminRoute = location.pathname.startsWith('/admin/');
  const isAdminLoginRoute = location.pathname === '/admin/login';
  const isStaffRoute = location.pathname.startsWith('/staff/');
  const isStaffDashboard = location.pathname === '/staff/dashboard';

  useEffect(() => {
    // TEMPORARILY DISABLED FOR DEVELOPMENT
    // if (isAdminRoute && !isAdminLoginRoute && !isLoading && !isLoggedIn) {
    //   navigate('/login');
    // }
    // if (isStaffRoute && !isStaffDashboard && !isLoading && !isLoggedIn) {
    //   navigate('/login');
    // }
    // if (location.pathname.startsWith('/developer/') && !isLoading && !isLoggedIn) {
    //   navigate('/login');
    // }
    // if (location.pathname.startsWith('/client-manager/') && !isLoading && !isLoggedIn) {
    //   navigate('/login');
    // }
  }, [isAdminRoute, isAdminLoginRoute, isStaffRoute, isStaffDashboard, isLoading, isLoggedIn, navigate, location.pathname]);

  return (
    <>
      {isLoading && !isPublicRoute ? (
        <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        </div>
      ) : (
        <>
          {isPublicRoute ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                {...pageTransition}
                className="min-h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          ) : (
            // TEMPORARILY DISABLED FOR DEVELOPMENT - SKIP LOGIN CHECK
            // !isLoggedIn ? (
            //   <NewLoginScreen onLoginSuccess={handleLoginSuccess} />
            // ) : (
            <div className="page-shell flex min-h-screen" dir="rtl">
            <AnimatePresence>
              {app.isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={app.toggleSidebar}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] lg:hidden"
                />
              )}
            </AnimatePresence>

            <Sidebar
              isOpen={app.isSidebarOpen}
              currentView={app.currentView}
              onNavigate={app.navigateTo}
              onToggle={app.toggleSidebar}
              currentUser={user}
            />

            <div
              className={cn(
                'flex-1 flex flex-col min-h-screen relative z-10 transition-[margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                'lg:mr-[17rem]',
                !app.isSidebarOpen && 'lg:mr-[5.25rem]',
                'mr-0'
              )}
            >
              <Header
                isDarkMode={app.isDarkMode}
                onToggleTheme={app.toggleTheme}
                notifications={notifications.notifications}
                onOpenNotifications={() => notifications.setIsNotificationsOpen(true)}
                onOpenCommandPalette={() => app.setIsCommandPaletteOpen(true)}
                isSidebarOpen={app.isSidebarOpen}
                onToggleSidebar={app.toggleSidebar}
                onLogout={handleLogout}
              />

              <main className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 pb-6 sm:pb-8 pt-3 sm:pt-4">
                <AnimatePresence mode="wait">
                  <motion.div key={location.pathname} className="min-h-full" {...pageTransition}>
                    {renderView()}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>

            <NotificationPanel
              isOpen={notifications.isNotificationsOpen}
              onClose={() => notifications.setIsNotificationsOpen(false)}
              notifications={notifications.notifications}
              onClear={notifications.clearNotification}
              onClearAll={notifications.clearAllNotifications}
            />

            <DeliveryAlarmModal
              isOpen={notifications.showDeliveryAlarm}
              onClose={() => notifications.setShowDeliveryAlarm(false)}
              deliveries={notifications.deliveriesToday}
              onAddToast={app.addToast}
            />

            <DataLossWarningModal
              isOpen={!!app.dataLossWarning}
              warning={app.dataLossWarning}
              onDismiss={() => app.setDataLossWarning(null)}
              onBackup={() => {
                app.setDataLossWarning(null);
                app.navigateTo('backups');
              }}
            />

            <CommandPalette
              isOpen={app.isCommandPaletteOpen}
              onClose={() => app.setIsCommandPaletteOpen(false)}
              onNavigate={app.navigateTo}
            />

            <EditingStatusOverlay onNavigate={app.navigateTo} />
            <ToastContainer toasts={app.toasts} onRemove={app.removeToast} />
          </div>
          )}
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Error pages */}
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/network-error" element={<NetworkError />} />
          {/* Main app */}
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
