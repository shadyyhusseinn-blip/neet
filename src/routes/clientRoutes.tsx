import { Route } from 'react-router-dom';
import { ClientLogin } from '../pages/client/ClientLogin';
import { ClientPortal } from '../pages/client/ClientPortal';

export const clientRoutes = (
  <>
    <Route path="/client/login" element={<ClientLogin />} />
    <Route path="/client/portal/:clientId" element={<ClientPortal />} />
  </>
);
