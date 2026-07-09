import { Route } from 'react-router-dom';
import NewBooking from '../pages/admin/NewBooking';
import BookingRecords from '../pages/admin/BookingRecords';
import BookingsAccountsDashboard from '../pages/admin/BookingsAccountsDashboard';
import BookingsAccountsManagement from '../pages/admin/BookingsAccountsManagement';

export const adminRoutes = (
  <>
    <Route path="/admin/new-booking" element={<NewBooking />} />
    <Route path="/admin/booking-records" element={<BookingRecords />} />
    <Route path="/admin/bookings-accounts" element={<BookingsAccountsDashboard />} />
    <Route path="/admin/bookings-management" element={<BookingsAccountsManagement />} />
  </>
);
