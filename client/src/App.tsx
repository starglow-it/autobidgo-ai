import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './hooks/useAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { RequireAdmin, RequireAuth, RequireUser } from './components/RouteGuards';

import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { FAQ } from './pages/public/FAQ';
import { Help } from './pages/public/Help';
import { Privacy } from './pages/public/Privacy';
import { Terms } from './pages/public/Terms';

import { Login } from './pages/Login';
import { ChangePassword } from './pages/user/ChangePassword';
import { ProfileSetup } from './pages/user/ProfileSetup';
import { Dashboard } from './pages/user/Dashboard';
import { Training } from './pages/user/Training';
import { Balance } from './pages/user/Balance';
import { Withdraw } from './pages/user/Withdraw';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminUserNew } from './pages/admin/AdminUserNew';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';
import { AdminScripts } from './pages/admin/AdminScripts';
import { AdminRecordings } from './pages/admin/AdminRecordings';
import { AdminRecordingDetail } from './pages/admin/AdminRecordingDetail';
import { AdminBatches } from './pages/admin/AdminBatches';
import { AdminBatchDetail } from './pages/admin/AdminBatchDetail';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login mode="user" />} />
          </Route>

          <Route path="/change-password" element={<RequireAuth />}>
            <Route element={<UserLayout />}>
              <Route index element={<ChangePassword />} />
            </Route>
          </Route>

          <Route path="/profile-setup" element={<RequireAuth />}>
            <Route element={<UserLayout />}>
              <Route index element={<ProfileSetup />} />
            </Route>
          </Route>

          <Route element={<RequireUser />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training" element={<Training />} />
              <Route path="/balance" element={<Balance />} />
              <Route path="/withdraw" element={<Withdraw />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/new" element={<AdminUserNew />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/scripts" element={<AdminScripts />} />
              <Route path="/admin/recordings" element={<AdminRecordings />} />
              <Route path="/admin/recordings/:id" element={<AdminRecordingDetail />} />
              <Route path="/admin/batches" element={<AdminBatches />} />
              <Route path="/admin/batches/:id" element={<AdminBatchDetail />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
