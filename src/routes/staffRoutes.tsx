import { Route } from 'react-router-dom';
import StaffDashboard from '../pages/staff/StaffDashboard';

export const staffRoutes = (
  <>
    <Route path="/staff/dashboard" element={<StaffDashboard />} />
  </>
);
