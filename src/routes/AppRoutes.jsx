import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import UsersList from '../pages/users/UsersList';
import UserDetails from '../pages/users/UserDetails';
import UserCreate from '../pages/users/UserCreate';
import DriversList from '../pages/drivers/DriversList';
import DriverDetails from '../pages/drivers/DriverDetails';
import PendingDrivers from '../pages/drivers/PendingDrivers';
import RidesList from '../pages/rides/RidesList';
import ActiveRides from '../pages/rides/ActiveRides';
import RideDetails from '../pages/rides/RideDetails';
import SubscriptionsList from '../pages/subscriptions/SubscriptionsList';
import Reports from '../pages/reports/Reports';
import ComplaintsList from '../pages/complaints/ComplaintsList';
import ComplaintDetails from '../pages/complaints/ComplaintDetails';
import SOSAlerts from '../pages/sos/SOSAlerts';
import ActiveAlerts from '../pages/sos/ActiveAlerts';
import SOSAlertDetails from '../pages/sos/SOSAlertDetails';
import PaymentsList from '../pages/payments/PaymentsList';
import ChatbotMonitoring from '../pages/chatbot/ChatbotMonitoring';
import Settings from '../pages/settings/Settings';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/create" element={<UserCreate />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/drivers" element={<DriversList />} />
        <Route path="/drivers/pending" element={<PendingDrivers />} />
        <Route path="/drivers/:id" element={<DriverDetails />} />
        <Route path="/rides" element={<RidesList />} />
        <Route path="/rides/active" element={<ActiveRides />} />
        <Route path="/rides/:id" element={<RideDetails />} />
        <Route path="/subscriptions" element={<SubscriptionsList />} />
        <Route path="/complaints" element={<ComplaintsList />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/sos" element={<SOSAlerts />} />
        <Route path="/sos/active" element={<ActiveAlerts />} />
        <Route path="/sos/:id" element={<SOSAlertDetails />} />
        <Route path="/payments" element={<PaymentsList />} />
        <Route path="/chatbot" element={<ChatbotMonitoring />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Default - redirect to login if not authenticated, otherwise dashboard */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

