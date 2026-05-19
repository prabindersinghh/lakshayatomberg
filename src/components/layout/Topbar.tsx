import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_CYCLE } from '@/lib/mockData';
import { getInitials } from '@/lib/utils';

export function Topbar() {
  const { user } = useAuth();

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-6 z-20"
      style={{
        left: 240,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#9CA3AF' }}>Lakshya</span>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <span className="text-xs font-medium" style={{ color: '#374151' }}>{MOCK_CYCLE.name}</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span style={{ color: '#6B7280' }}>Goal Setting Window Open</span>
          <span className="font-mono font-semibold" style={{ color: '#FDB813' }}>Q1 FY26</span>
        </div>

        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
        >
          <Bell size={16} style={{ color: '#6B7280' }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FDB813]" />
        </button>

        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold leading-none" style={{ color: '#111827' }}>{user.full_name}</p>
              <p className="text-[10px] capitalize leading-none mt-0.5" style={{ color: '#9CA3AF' }}>{user.role}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#FDB813', color: '#000' }}
            >
              {getInitials(user.full_name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
