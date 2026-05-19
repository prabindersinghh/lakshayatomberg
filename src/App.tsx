import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/layout/RoleGuard';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';

// Employee
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { MyGoalsPage } from '@/pages/employee/MyGoalsPage';
import { QuarterlyCheckinPage } from '@/pages/employee/QuarterlyCheckinPage';

// Manager
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard';
import { ApprovalsPage } from '@/pages/manager/ApprovalsPage';
import { TeamPage } from '@/pages/manager/TeamPage';

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { CompletionGridPage } from '@/pages/admin/CompletionGridPage';
import { AuditLogPage } from '@/pages/admin/AuditLogPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<DashboardLayout />}>
            {/* Employee routes */}
            <Route element={<RoleGuard allowed={['employee']} />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/goals" element={<MyGoalsPage />} />
              <Route path="/employee/checkin" element={<QuarterlyCheckinPage />} />
            </Route>

            {/* Manager routes */}
            <Route element={<RoleGuard allowed={['manager']} />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/approvals" element={<ApprovalsPage />} />
              <Route path="/manager/team" element={<TeamPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<RoleGuard allowed={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/completion" element={<CompletionGridPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all — redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
