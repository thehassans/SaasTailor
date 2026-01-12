import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import WorkerLayout from './layouts/WorkerLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Workers from './pages/user/Workers';
import WorkerForm from './pages/user/WorkerForm';
import WorkerAmounts from './pages/user/WorkerAmounts';
import Customers from './pages/user/Customers';
import CustomerForm from './pages/user/CustomerForm';
import Stitchings from './pages/user/Stitchings';
import StitchingForm from './pages/user/StitchingForm';
import Loyalty from './pages/user/Loyalty';
import WhatsApp from './pages/user/WhatsApp';
import Settings from './pages/user/Settings';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerStitchings from './pages/worker/Stitchings';
import WorkerAmountsPage from './pages/worker/Amounts';
import WorkerSettings from './pages/worker/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'ur'].includes(i18n.language);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/new" element={<AdminUserForm />} />
          <Route path="users/:id/edit" element={<AdminUserForm />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="workers" element={<Workers />} />
          <Route path="workers/new" element={<WorkerForm />} />
          <Route path="workers/:id/edit" element={<WorkerForm />} />
          <Route path="worker-amounts" element={<WorkerAmounts />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="stitchings" element={<Stitchings />} />
          <Route path="stitchings/new" element={<StitchingForm />} />
          <Route path="stitchings/:id/edit" element={<StitchingForm />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="whatsapp" element={<WhatsApp />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Worker Routes */}
        <Route path="/worker" element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/worker/dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="stitchings" element={<WorkerStitchings />} />
          <Route path="amounts" element={<WorkerAmountsPage />} />
          <Route path="settings" element={<WorkerSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '10px',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
