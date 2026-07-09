import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import Firebase service
import { firebaseService } from './services/firebase';

// Import essential services only
import { securityService } from './lib/security';
import { i18n } from './lib/i18n';
import { currencyService } from './lib/currency';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize essential services immediately
firebaseService.initialize().catch((error) => {
  console.error('❌ Firebase initialization failed:', error);
});

securityService.initialize();
i18n.initialize();
currencyService.initialize();

// Lazy initialize non-essential services after app loads
const initializeNonEssentialServices = () => {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      import('./lib/performance').then(({ performanceOptimizer }) => {
        performanceOptimizer.lazyLoadImages();
      });
      import('./services/backup').then(({ backupService }) => {
        backupService.initialize();
      });
      import('./services/audit').then(({ auditService }) => {
        auditService.initialize();
      });
      import('./services/documents').then(({ documentService }) => {
        documentService.initialize();
      });
      import('./services/chat').then(({ chatService }) => {
        chatService.initialize();
      });
      import('./services/events').then(({ eventService }) => {
        eventService.initialize();
      });
      import('./services/socialMedia').then(({ socialMediaService }) => {
        socialMediaService.initialize();
      });
      import('./services/cloudStorage').then(({ cloudStorageService }) => {
        cloudStorageService.initialize();
      });
      import('./services/sms').then(({ smsService }) => {
        smsService.initialize();
      });
      import('./services/analytics').then(({ analyticsService }) => {
        analyticsService.initialize(import.meta.env.VITE_GA_TRACKING_ID);
      });
    });
  } else {
    setTimeout(() => {
      import('./lib/performance').then(({ performanceOptimizer }) => {
        performanceOptimizer.lazyLoadImages();
      });
      // ... other services
    }, 1000);
  }
};

// Initialize non-essential services after mount
initializeNonEssentialServices();

// Service Worker temporarily disabled
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch((error) => {
//       console.error('Service Worker registration failed:', error);
//     });
//   });
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-center" richColors dir="rtl" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
