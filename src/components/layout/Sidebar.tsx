import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Users,
  CheckSquare,
  BarChart3,
  FileText,
  LogOut,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/employee', icon: <LayoutDashboard size={18} /> },
  { label: 'My Goals', to: '/employee/goals', icon: <Target size={18} /> },
  { label: 'Quarterly Check-in', to: '/employee/checkin', icon: <ClipboardCheck size={18} /> },
];

const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/manager', icon: <LayoutDashboard size={18} /> },
  { label: 'Approvals', to: '/manager/approvals', icon: <CheckSquare size={18} /> },
  { label: 'Team Performance', to: '/manager/team', icon: <Users size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Completion Grid', to: '/admin/completion', icon: <CheckSquare size={18} /> },
  { label: 'Audit Log', to: '/admin/audit', icon: <FileText size={18} /> },
  { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 size={18} /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
];

export function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    role === 'admin'
      ? ADMIN_NAV
      : role === 'manager'
      ? MANAGER_NAV
      : EMPLOYEE_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-gray-50 border-r border-gray-200 z-30">
      {/* Header */}
      <div className="h-16 bg-gray-900 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#FDB813] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FDB813]" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none font-heading tracking-tight">
              ◎ Lakshya
            </span>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest leading-none mt-0.5">
              Goal Tracking Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1">
            {role === 'admin' ? 'Administration' : role === 'manager' ? 'Management' : 'My Work'}
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to.split('/').length === 2}
                  className={({ isActive }: { isActive: boolean }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-yellow-50 text-gray-900 border-l-[3px] border-[#FDB813] pl-[9px]'
                        : 'text-gray-600 hover:bg-yellow-50 hover:text-gray-900'
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
          <HelpCircle size={16} />
          Help Center
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* User chip */}
      {user && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
            <div className="w-7 h-7 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
              {user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.full_name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
