import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, ClipboardCheck, Users,
  CheckSquare, BarChart3, FileText, LogOut, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface NavItem { label: string; to: string; icon: React.ReactNode }

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
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'manager' ? MANAGER_NAV : EMPLOYEE_NAV;
  const sectionLabel = role === 'admin' ? 'Administration' : role === 'manager' ? 'Management' : 'My Work';

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 flex flex-col z-30 overflow-hidden"
      style={{ background: '#0A0A0A', borderRight: '1px solid #1F1F1F' }}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 shrink-0 relative" style={{ borderBottom: '1px solid #1F1F1F' }}>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/atomberg-logo.png"
            alt="Atomberg"
            className="h-7 shrink-0 object-contain"
            style={{ filter: 'brightness(1.1)' }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-[#A1A1AA] text-[9px] uppercase tracking-[0.15em] leading-none mt-0.5 whitespace-nowrap">
                  Goal Tracking · {role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Employee'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#A1A1AA' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#52525B] px-3 mb-2">
            {sectionLabel}
          </p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to.split('/').length === 2}
                title={collapsed ? item.label : undefined}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                    collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'text-[#FDB813]'
                      : 'text-[#A1A1AA] hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(253,184,19,0.08)' }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[#FDB813]" />
                    )}
                    <span className="relative z-10 shrink-0">{item.icon}</span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative z-10 whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid #1F1F1F' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg text-sm transition-colors text-[#52525B] hover:text-red-400 hover:bg-red-950/30',
            collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
          )}
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User chip */}
      {user && !collapsed && (
        <div className="px-2 pb-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-2.5 rounded-lg"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#FDB813', color: '#000' }}
            >
              {user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-[#52525B] capitalize">{user.role}</p>
            </div>
          </motion.div>
        </div>
      )}
      {user && collapsed && (
        <div className="px-2 pb-3 flex justify-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#FDB813', color: '#000' }}
            title={user.full_name}
          >
            {user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
