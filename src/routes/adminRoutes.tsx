import { Route } from 'react-router-dom';
import AdminHome from '../pages/admin/AdminHome';
import Dashboard from '../pages/admin/Dashboard';
import NewBooking from '../pages/admin/NewBooking';
import BookingRecords from '../pages/admin/BookingRecords';
import Packages from '../pages/admin/Packages';
import Accounts from '../pages/admin/Accounts';
import Settings from '../pages/admin/Settings';
import UnifiedBackup from '../pages/admin/UnifiedBackup';
import EditingTracker from '../pages/admin/EditingTracker';
import StudioAI from '../pages/admin/StudioAI';
import WhatsAppParser from '../pages/admin/WhatsAppParser';
import FirebaseConfigPage from '../pages/admin/FirebaseConfigPage';
import ActivityLog from '../pages/admin/ActivityLog';
import { UserManagement } from '../pages/admin/UserManagement';
import { Developer } from '../pages/admin/Developer';
import { GalleryManagement } from '../pages/admin/GalleryManagement';
import GalleryEditor from '../pages/admin/GalleryEditor';
import PublicGalleriesAdmin from '../pages/admin/PublicGalleriesAdmin';
import BookingsAccountsDashboard from '../pages/admin/BookingsAccountsDashboard';
import BookingsAccountsManagement from '../pages/admin/BookingsAccountsManagement';
import DeveloperToolsDashboard from '../pages/admin/DeveloperToolsDashboard';
import DeveloperToolsManagement from '../pages/admin/DeveloperToolsManagement';
import { ClientGalleryManagement } from '../pages/admin/ClientGalleryManagement';
import AdvancedAnalyticsPage from '../pages/admin/AdvancedAnalyticsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import FinancialManagementPage from '../pages/admin/FinancialManagementPage';

// Wrapper for Dashboard to handle setView prop
const DashboardWrapper = () => {
  const setView = (view: string) => {
    console.log('Navigate to:', view);
    // Navigate logic can be added here if needed
  };
  return <Dashboard setView={setView} />;
};

export const adminRoutes = (
  <>
    <Route path="/admin" element={<AdminHome />} />
    <Route path="/admin/dashboard" element={<DashboardWrapper />} />
    <Route path="/admin/new-booking" element={<NewBooking />} />
    <Route path="/admin/bookings" element={<BookingRecords />} />
    <Route path="/admin/packages" element={<Packages />} />
    <Route path="/admin/accounts" element={<Accounts />} />
    <Route path="/admin/settings" element={<Settings />} />
    <Route path="/admin/backup" element={<UnifiedBackup />} />
    <Route path="/admin/editing" element={<EditingTracker />} />
    <Route path="/admin/ai" element={<StudioAI />} />
    <Route path="/admin/whatsapp" element={<WhatsAppParser />} />
    <Route path="/admin/firebase" element={<FirebaseConfigPage />} />
    <Route path="/admin/activity" element={<ActivityLog />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/developer" element={<Developer />} />
    <Route path="/admin/galleries" element={<GalleryManagement />} />
    <Route path="/admin/gallery-editor" element={<GalleryEditor />} />
    <Route path="/admin/public-galleries" element={<PublicGalleriesAdmin />} />
    <Route path="/admin/bookings-accounts" element={<BookingsAccountsDashboard />} />
    <Route path="/admin/bookings-management" element={<BookingsAccountsManagement />} />
    <Route path="/admin/developer-tools" element={<DeveloperToolsDashboard />} />
    <Route path="/admin/developer-management" element={<DeveloperToolsManagement />} />
    <Route path="/admin/client-gallery" element={<ClientGalleryManagement />} />
    <Route path="/admin/analytics" element={<AdvancedAnalyticsPage />} />
    <Route path="/admin/reports" element={<ReportsPage />} />
    <Route path="/admin/financial" element={<FinancialManagementPage />} />
  </>
);
