import { Route } from 'react-router-dom';
import DeveloperPortalDashboard from '../pages/developer/DeveloperPortalDashboard';
import DeveloperSettings from '../pages/admin/developer/DeveloperSettings';
import DeveloperLogs from '../pages/admin/developer/DeveloperLogs';
import DeveloperBackup from '../pages/admin/developer/DeveloperBackup';

export const developerRoutes = (
  <>
    <Route path="/developer" element={<DeveloperPortalDashboard />} />
    <Route path="/developer/settings" element={<DeveloperSettings />} />
    <Route path="/developer/logs" element={<DeveloperLogs />} />
    <Route path="/developer/backup" element={<DeveloperBackup />} />
  </>
);
