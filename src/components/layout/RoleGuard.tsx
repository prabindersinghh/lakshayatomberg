import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allowed: UserRole[];
}

export function RoleGuard({ allowed }: RoleGuardProps) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!role || !allowed.includes(role)) {
    const redirect =
      role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/employee';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
