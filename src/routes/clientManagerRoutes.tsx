import { Route } from 'react-router-dom';
import ClientManagerPortalDashboard from '../pages/client-manager/ClientManagerPortalDashboard';

export const clientManagerRoutes = (
  <>
    <Route path="/client-manager" element={<ClientManagerPortalDashboard />} />
  </>
);
