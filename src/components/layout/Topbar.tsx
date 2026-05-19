import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_CYCLE } from '@/lib/mockData';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Topbar({ title, breadcrumbs }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-400'}>
                  {b.label}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-base font-semibold text-gray-900 font-heading">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Cycle badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
          <span className="font-mono font-semibold text-gray-700">{MOCK_CYCLE.name}</span>
          <span>·</span>
          <span className="text-[#FDB813] font-medium">Q2 FY26</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FDB813]" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user.full_name}</p>
              <p className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900">
              {getInitials(user.full_name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
