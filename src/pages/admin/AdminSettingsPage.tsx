import { Topbar } from '@/components/layout/Topbar';
import { MOCK_CYCLE, MOCK_THRUST_AREAS } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { Settings, Calendar, Tag, AlertTriangle } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Admin Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage cycle configuration, thrust areas, and escalation rules.</p>
        </div>

        {/* Active Cycle */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-[#FDB813]" />
            <h2 className="font-semibold text-gray-900 font-heading">Active Cycle</h2>
            <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Cycle Name</p>
              <p className="font-semibold text-gray-900">{MOCK_CYCLE.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Goal Setting Window</p>
              <p className="text-sm text-gray-700 font-mono">
                {formatDate(MOCK_CYCLE.goal_setting_open)} → {formatDate(MOCK_CYCLE.goal_setting_close)}
              </p>
            </div>
            {[
              { label: 'Q1 Window', open: MOCK_CYCLE.q1_open, close: MOCK_CYCLE.q1_close },
              { label: 'Q2 Window', open: MOCK_CYCLE.q2_open, close: MOCK_CYCLE.q2_close },
              { label: 'Q3 Window', open: MOCK_CYCLE.q3_open, close: MOCK_CYCLE.q3_close },
              { label: 'Q4 Window', open: MOCK_CYCLE.q4_open, close: MOCK_CYCLE.q4_close },
            ].map((w) => (
              <div key={w.label}>
                <p className="text-xs text-gray-400 mb-1">{w.label}</p>
                <p className="text-sm text-gray-700 font-mono">
                  {w.open && w.close ? `${formatDate(w.open)} → ${formatDate(w.close)}` : '—'}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Override any window date for demo purposes:</p>
            <button className="text-sm font-medium text-[#FDB813] hover:underline">
              Edit Cycle Dates →
            </button>
          </div>
        </div>

        {/* Thrust Areas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-[#FDB813]" />
            <h2 className="font-semibold text-gray-900 font-heading">Thrust Areas</h2>
            <span className="ml-auto text-xs text-gray-400">{MOCK_THRUST_AREAS.length} active</span>
          </div>
          <div className="space-y-2">
            {MOCK_THRUST_AREAS.map((ta) => (
              <div key={ta.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-yellow-50/20 transition-colors">
                <span className="text-sm font-medium text-gray-900">{ta.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">Active</span>
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">Deactivate</button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm font-medium text-[#FDB813] hover:underline">
            + Add Thrust Area
          </button>
        </div>

        {/* Escalation rules */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[#FDB813]" />
            <h2 className="font-semibold text-gray-900 font-heading">Escalation Rules</h2>
          </div>
          <div className="space-y-3">
            {[
              { trigger: 'Goal not submitted within 7 days of cycle open', targets: ['Employee', 'Manager'] },
              { trigger: 'Goal not approved within 5 days of submission', targets: ['Manager', 'HR'] },
              { trigger: 'Check-in not completed within active window', targets: ['Employee', 'Manager', 'HR'] },
            ].map((rule, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-sm font-medium text-gray-800">{rule.trigger}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs text-gray-400">Notify:</span>
                  {rule.targets.map((t) => (
                    <span key={t} className="text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm font-medium text-[#FDB813] hover:underline">
            + Configure Escalation Rule
          </button>
        </div>
      </div>
    </>
  );
}
