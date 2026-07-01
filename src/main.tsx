import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import Firebase service
import { firebaseService } from './services/firebase';

// Import new services
import { performanceOptimizer } from './lib/performance';
import { securityService } from './lib/security';
import { backupService } from './services/backup';
import { auditService } from './services/audit';
import { documentService } from './services/documents';
import { chatService } from './services/chat';
import { eventService } from './services/events';
import { socialMediaService } from './services/socialMedia';
import { cloudStorageService } from './services/cloudStorage';
import { smsService } from './services/sms';
import { analyticsService } from './services/analytics';
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

// Initialize Firebase
firebaseService.initialize().catch((error) => {
  console.error('❌ Firebase initialization failed:', error);
});

// Initialize new services
performanceOptimizer.lazyLoadImages();
securityService.initialize();
backupService.initialize();
auditService.initialize();
documentService.initialize();
chatService.initialize();
eventService.initialize();
socialMediaService.initialize();
cloudStorageService.initialize();
smsService.initialize();
analyticsService.initialize(import.meta.env.VITE_GA_TRACKING_ID);
i18n.initialize();
currencyService.initialize();

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
