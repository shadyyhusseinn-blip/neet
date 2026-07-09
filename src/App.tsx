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

// Booking pages - only keep these
const NewBooking = lazy(() => import('./pages/admin/NewBooking'));
const BookingRecords = lazy(() => import('./pages/admin/BookingRecords'));
const BookingsAccountsDashboard = lazy(() => import('./pages/admin/BookingsAccountsDashboard'));
const BookingsAccountsManagement = lazy(() => import('./pages/admin/BookingsAccountsManagement'));

// Public pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const PackagesPage = lazy(() => import('./pages/public/PackagesPage'));
const UnifiedLoginPage = lazy(() => import('./pages/public/UnifiedLoginPage'));

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

  const handleLoginSuccess = (userData: any) => {
    navigate('/admin/new-booking');
  };

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  useEffect(() => {
    firebaseService.initialize().then(() => {
      console.log('Firebase initialized');
      if (firebaseService.isReady()) {
        console.log('Starting Firestore sync...');
        firestoreSync.startSync(5000);
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
    let view = 'landing';

    if (currentPath === '/') view = 'landing';
    else if (currentPath === '/portfolio') view = 'portfolio';
    else if (currentPath === '/packages') view = 'packages';
    else if (currentPath === '/login') view = 'login';
    else if (currentPath === '/unified-login') view = 'login';
    else if (currentPath === '/admin/new-booking') view = 'new-booking';
    else if (currentPath === '/admin/booking-records') view = 'booking-records';
    else if (currentPath === '/admin/bookings-accounts') view = 'bookings-accounts-dashboard';
    else if (currentPath === '/admin/bookings-management') view = 'bookings-accounts-management';
    else if (currentPath === '/new-booking') view = 'new-booking';
    else if (currentPath === '/booking-records') view = 'booking-records';

    if (app.currentView !== view) {
      app.setCurrentView(view);
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
      case 'new-booking':
        return <NewBooking />;
      case 'booking-records':
        return <BookingRecords />;
      case 'bookings-accounts-dashboard':
        return <BookingsAccountsDashboard />;
      case 'bookings-accounts-management':
        return <BookingsAccountsManagement />;
      default:
        return <LandingPage />;
    }
  };

  const isPublicRoute = location.pathname === '/' ||
                        location.pathname === '/portfolio' ||
                        location.pathname === '/packages' ||
                        location.pathname === '/login' ||
                        location.pathname === '/unified-login';

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
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/network-error" element={<NetworkError />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
