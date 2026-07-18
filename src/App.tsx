import { useEffect, lazy, Suspense, Component, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import { useNotifications } from './hooks/useNotifications';
import { useAuthStore } from './stores/authStore';
import { storage } from './services/storage';
import { firebaseService } from './services/firebase';
import { firestoreSync } from './services/firestoreSync';
import { audioService } from './services/audio';
import { pushNotificationService } from './services/pushNotifications';
import { log } from './core/logger';
import { RefreshCw, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';

// Global Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    log.error('Error caught by boundary', { error, errorInfo }, 'error-boundary');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle size={32} className="text-red-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-3">حدث خطأ غير متوقع</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              نعتذر عن الإزعاج. حدث خطأ تقني أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
            </p>
            
            {this.state.error && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-right">
                <p className="text-xs text-slate-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleRetry}
              className="w-full py-3 bg-gradient-to-r from-slate-600 to-pink-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:from-slate-700 hover:to-pink-700 transition-all"
            >
              <RefreshCw size={18} />
              إعادة المحاولة
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Core components (not lazy loaded)
import { AdminLayout } from './components/layout/AdminLayout';
import CookieBanner from './components/common/CookieBanner';

// Booking pages - only keep these
const AdminIndex = lazy(() => import('./pages/admin/AdminIndex'));
const AdminMemberIndex = lazy(() => import('./pages/admin/AdminMemberIndex'));
const SimpleDashboard = lazy(() => import('./pages/admin/SimpleDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const NewBooking = lazy(() => import('./pages/admin/NewBooking'));
const StaffNewBooking = lazy(() => import('./pages/admin/StaffNewBooking'));
const BookingDetails = lazy(() => import('./pages/admin/BookingDetails'));
const BookingRecords = lazy(() => import('./pages/admin/BookingRecords'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const SiteManager = lazy(() => import('./pages/admin/SiteManager'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const SmartGalleryCreator = lazy(() => import('./pages/admin/SmartGalleryCreator'));
const GalleryEditor = lazy(() => import('./pages/admin/GalleryEditor'));
const VisitorLogsPage = lazy(() => import('./pages/admin/VisitorLogsPage'));
const GoogleDriveSettings = lazy(() => import('./pages/admin/GoogleDriveSettings'));
const SetupGoogleDrive = lazy(() => import('./pages/admin/SetupGoogleDrive'));
const GoogleDriveDashboard = lazy(() => import('./pages/admin/GoogleDriveDashboard'));
const WhatsAppImport = lazy(() => import('./pages/admin/WhatsAppImport'));
const BookingsHub = lazy(() => import('./pages/admin/BookingsHub'));
const ChatManagement = lazy(() => import('./pages/admin/ChatManagement'));
const BookingsPackages = lazy(() => import('./pages/admin/BookingsPackages'));
const AIManagement = lazy(() => import('./pages/admin/AIManagement'));
const ContactManagement = lazy(() => import('./pages/admin/ContactManagement'));
const ContactMessagesPage = lazy(() => import('./pages/admin/ContactMessagesPage'));
const ContractsManagement = lazy(() => import('./pages/admin/ContractsManagement'));
const ExpensesTracker = lazy(() => import('./pages/admin/ExpensesTracker'));
const ManagerNotes = lazy(() => import('./pages/admin/ManagerNotes'));
const QuickBooking = lazy(() => import('./pages/admin/QuickBooking'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const StorageDashboard = lazy(() => import('./pages/admin/StorageDashboard'));
const WhatsAppAlerts = lazy(() => import('./pages/admin/WhatsAppAlerts'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

// Staff pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffBookingRecords = lazy(() => import('./pages/staff/StaffBookingRecords'));

// Client pages
const ClientPortal = lazy(() => import('./pages/client/ClientPortal'));

// Client Manager pages
const ClientManagerPortalDashboard = lazy(() => import('./pages/client-manager/ClientManagerPortalDashboard'));
const ClientManagement = lazy(() => import('./pages/client-manager/ClientManagement'));

// Public pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const PackagesPage = lazy(() => import('./pages/public/PackagesPage'));
const UnifiedLoginPage = lazy(() => import('./pages/public/UnifiedLoginPage'));
const BookingWizard = lazy(() => import('./pages/public/BookingWizard'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const ContractSignPage = lazy(() => import('./pages/public/ContractSignPage'));
const DeletedGalleryPage = lazy(() => import('./pages/public/DeletedGalleryPage'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));

// Error pages
const NotFound = lazy(() => import('./pages/error/NotFound'));
const ServerError = lazy(() => import('./pages/error/ServerError'));
const NetworkError = lazy(() => import('./pages/error/NetworkError'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050508]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">جاري التحميل...</p>
    </div>
  </div>
);

// Universal Navigation Topbar Component
function UniversalNavigationTopbar() {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const updateNavigationState = () => {
      setCanGoBack(window.history.length > 1);
      setCanGoForward(window.history.state?.forward !== null);
    };

    updateNavigationState();
    window.addEventListener('popstate', updateNavigationState);
    return () => window.removeEventListener('popstate', updateNavigationState);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      if (!audioService.getMuteState()) audioService.playClick();
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      if (!audioService.getMuteState()) audioService.playClick();
      navigate(1);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[9999] flex gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        disabled={!canGoBack}
        className={`
          w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300
          ${canGoBack 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30' 
            : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          }
        `}
        title="السابق"
      >
        <ChevronRight size={20} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleForward}
        disabled={!canGoForward}
        className={`
          w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300
          ${canGoForward 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30' 
            : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          }
        `}
        title="التالي"
      >
        <ChevronLeft size={20} />
      </motion.button>
    </div>
  );
}

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

function AppContent() {
  const app = useApp();
  const notifications = useNotifications();
  const { isLoading, initializeAuth, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    firebaseService.initialize().then(() => {
      console.log('Firebase initialized');
      if (firebaseService.isReady()) {
        console.log('Starting Firestore sync...');
        firestoreSync.startSync(5000);
        firestoreSync.subscribeToRealtimeUpdates();
        
        // Initialize push notifications
        pushNotificationService.initialize().catch(err => {
          console.error('Failed to initialize push notifications:', err);
        });
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

  // Admin Route Guard
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');
    const isStaffRoute = location.pathname.startsWith('/staff') || location.pathname.startsWith('/adminstaff');

    if ((isAdminRoute || isStaffRoute) && !isLoading && !user) {
      console.log('Protected route accessed without authentication, redirecting to login');
      navigate('/unified-login', { replace: true });
    }
  }, [location.pathname, isLoading, user, navigate]);

  // Redirect legacy booking routes to new structure
  useEffect(() => {
    const path = location.pathname;
    
    // Legacy booking routes redirect
    if (path === '/admin-general/new-booking') {
      navigate('/admin-general/bookings-hub/new', { replace: true });
    } else if (path === '/admin-general/booking-records') {
      navigate('/admin-general/bookings-hub/records', { replace: true });
    } else if (path.match(/^\/admin-general\/booking-details\/([^/]+)$/)) {
      const bookingId = path.match(/^\/admin-general\/booking-details\/([^/]+)$/)?.[1];
      if (bookingId) {
        navigate(`/admin-general/bookings-hub/details/${bookingId}`, { replace: true });
      }
    } else if (path === '/admin-general/whatsapp-import') {
      navigate('/admin-general/bookings-hub/whatsapp-import', { replace: true });
    }
  }, [location.pathname, navigate]);

  const renderView = () => {
    const currentPath = location.pathname;
    let view = 'landing';

    if (currentPath === '/') view = 'landing';
    else if (currentPath === '/portfolio') view = 'portfolio';
    else if (currentPath.match(/^\/portfolio\/[^/]+$/)) view = 'portfolio';
    else if (currentPath === '/packages') view = 'packages';
    else if (currentPath === '/unified-login') view = 'login';
    else if (currentPath === '/admin-login') view = 'login';
    else if (currentPath === '/staff-login') view = 'login';
    else if (currentPath === '/contact') view = 'contact';
    else if (currentPath === '/book-now') view = 'booking-wizard';
    else if (currentPath === '/contract-sign') view = 'contract-sign';
    else if (currentPath === '/deleted-gallery') view = 'deleted-gallery';
    else if (currentPath === '/admin-general') view = 'admin-index';
    else if (currentPath === '/adminstaff') view = 'admin-member-index';
    else if (currentPath === '/admin-general/dashboard') view = 'simple-dashboard';
    else if (currentPath === '/admin-general/admin-dashboard') view = 'admin-dashboard';
    else if (currentPath === '/admin-general/settings') view = 'settings';
    else if (currentPath === '/adminstaff/new-booking') view = 'staff-new-booking';
    else if (currentPath === '/admin-general/booking-records') view = 'booking-records';
    else if (currentPath === '/admin-general/site-manager') view = 'site-manager';
    else if (currentPath === '/admin-general/websiteadministration') view = 'site-manager';
    else if (currentPath === '/admin-general/gallerieseditor') view = 'smart-gallery-creator';
    else if (currentPath === '/admin-general/websiteadministration/galleries') view = 'smart-gallery-creator';
    else if (currentPath === '/admin-general/galleries') view = 'smart-gallery-creator';
    else if (currentPath === '/admin-general/websiteadministration/visitor-logs') view = 'visitor-logs';
    else if (currentPath === '/admin-general/visitor-logs') view = 'visitor-logs';
    else if (currentPath === '/admin-general/websiteadministration/google-drive') view = 'google-drive-settings';
    else if (currentPath === '/admin-general/google-drive') view = 'google-drive-settings';
    else if (currentPath === '/admin-general/websiteadministration/google-drive-dashboard') view = 'google-drive-dashboard';
    else if (currentPath === '/admin-general/google-drive-dashboard') view = 'google-drive-dashboard';
    else if (currentPath === '/admin-general/google-drive-settings') view = 'google-drive-settings';
    else if (currentPath === '/admin-general/setup-google-drive') view = 'setup-google-drive';
    else if (currentPath === '/admin-general/staff-management') view = 'staff-management';
    else if (currentPath === '/admin-general/chat-management') view = 'chat-management';
    else if (currentPath === '/admin-general/whatsapp-import') view = 'whatsapp-import';
    else if (currentPath === '/admin-general/bookings-hub') view = 'bookings-hub';
    else if (currentPath === '/admin-general/bookings-hub/new') view = 'new-booking';
    else if (currentPath === '/admin-general/bookings-hub/packages') view = 'bookings-packages';
    else if (currentPath === '/admin-general/bookings-hub/records') view = 'booking-records';
    else if (currentPath === '/admin-general/bookings-hub/whatsapp-import') view = 'whatsapp-import';
    else if (currentPath.match(/^\/admin-general\/bookings-hub\/details\/[^/]+$/)) view = 'booking-details';
    else if (currentPath === '/staff') view = 'staff-dashboard';
    else if (currentPath === '/staff/booking-records') view = 'staff-booking-records';
    else if (currentPath === '/staff/new-booking') view = 'staff-new-booking';
    else if (currentPath === '/admin-general/ai-management') view = 'ai-management';
    else if (currentPath === '/admin-general/contact-management') view = 'contact-management';
    else if (currentPath === '/admin-general/contact-messages') view = 'contact-messages';
    else if (currentPath === '/admin-general/contracts-management') view = 'contracts-management';
    else if (currentPath === '/admin-general/expenses-tracker') view = 'expenses-tracker';
    else if (currentPath === '/admin-general/manager-notes') view = 'manager-notes';
    else if (currentPath === '/admin-general/quick-booking') view = 'quick-booking';
    else if (currentPath === '/admin-general/reports') view = 'reports';
    else if (currentPath === '/admin-general/storage-dashboard') view = 'storage-dashboard';
    else if (currentPath === '/admin-general/whatsapp-alerts') view = 'whatsapp-alerts';
    else if (currentPath === '/admin-general/user-management') view = 'user-management';
    else if (currentPath === '/client-portal') view = 'client-portal';
    else if (currentPath === '/client-manager/dashboard') view = 'client-manager-dashboard';
    else if (currentPath === '/client-manager/clients') view = 'client-management';
    else if (currentPath === '/privacy-policy') view = 'privacy-policy';
    else if (currentPath === '/terms-of-service') view = 'terms-of-service';
    else if (currentPath.match(/^\/admin-general\/gallerieseditor\/edit\/[^/]+$/)) {
      view = 'gallery-editor';
    }
    else if (currentPath.match(/^\/admin-general\/gallerieseditor\/edit$/)) {
      view = 'gallery-editor';
    }

    if (app.currentView !== view) {
      app.setCurrentView(view as any);
    }

    switch (view) {
      case 'landing':
        return <LandingPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'packages':
        return <PackagesPage />;
      case 'login':
        return <UnifiedLoginPage />;
      case 'booking-wizard':
        return <BookingWizard />;
      case 'contact':
        return <ContactPage />;
      case 'contract-sign':
        return <ContractSignPage />;
      case 'deleted-gallery':
        return <DeletedGalleryPage />;
      case 'admin-index':
        return <AdminIndex />;
      case 'admin-member-index':
        return <AdminMemberIndex />;
      case 'simple-dashboard':
        return <SimpleDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'settings':
        return <Settings />;
      case 'new-booking':
        return <NewBooking />;
      case 'booking-details':
        return <BookingDetails />;
      case 'staff-new-booking':
        return <StaffNewBooking />;
      case 'booking-records':
        return <BookingRecords />;
      case 'site-manager':
        return <SiteManager />;
      case 'staff-management':
        return <StaffManagement />;
      case 'chat-management':
        return <ChatManagement />;
      case 'whatsapp-import':
        return <WhatsAppImport />;
      case 'bookings-hub':
        return <BookingsHub />;
      case 'bookings-packages':
        return <BookingsPackages />;
      case 'smart-gallery-creator':
        return <SmartGalleryCreator />;
      case 'gallery-editor':
        return <GalleryEditor />;
      case 'visitor-logs':
        return <VisitorLogsPage />;
      case 'google-drive-settings':
        return <GoogleDriveSettings />;
      case 'setup-google-drive':
        return <SetupGoogleDrive />;
      case 'google-drive-dashboard':
        return <GoogleDriveDashboard />;
      case 'staff-dashboard':
        return <StaffDashboard />;
      case 'staff-booking-records':
        return <StaffBookingRecords />;
      case 'ai-management':
        return <AIManagement />;
      case 'contact-management':
        return <ContactManagement />;
      case 'contact-messages':
        return <ContactMessagesPage />;
      case 'contracts-management':
        return <ContractsManagement />;
      case 'expenses-tracker':
        return <ExpensesTracker />;
      case 'manager-notes':
        return <ManagerNotes />;
      case 'quick-booking':
        return <QuickBooking />;
      case 'reports':
        return <ReportsPage />;
      case 'storage-dashboard':
        return <StorageDashboard />;
      case 'whatsapp-alerts':
        return <WhatsAppAlerts />;
      case 'user-management':
        return <UserManagement />;
      case 'client-portal':
        return <ClientPortal />;
      case 'client-manager-dashboard':
        return <ClientManagerPortalDashboard />;
      case 'client-management':
        return <ClientManagement />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'not-found':
        return <NotFound />;
      default:
        return <NotFound />;
    }
  };

  const isPublicRoute = location.pathname === '/' ||
                        location.pathname === '/portfolio' ||
                        location.pathname.match(/^\/portfolio\/[^/]+$/) ||
                        location.pathname === '/packages' ||
                        location.pathname === '/unified-login' ||
                        location.pathname === '/book-now' ||
                        location.pathname === '/contact' ||
                        location.pathname === '/deleted-gallery' ||
                        location.pathname.startsWith('/admin');

  return (
    <>
      <UniversalNavigationTopbar />
      {isLoading && !isPublicRoute ? (
        <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
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
            <AdminLayout>
              <AnimatePresence mode="wait">
                <motion.div key={location.pathname} className="min-h-full" {...pageTransition}>
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </AdminLayout>
          )}
        </>
      )}
      <CookieBanner />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/404" element={<NotFound />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/network-error" element={<NetworkError />} />
              <Route path="*" element={<AppContent />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
