import { Topbar } from '@/components/layout/Topbar';
import { MOCK_ORG_COMPLETION, MOCK_GOAL_SHEETS, MOCK_USERS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare, CheckCircle2, Calendar, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

export function AdminDashboard() {
  const navigate = useNavigate();

  const totalEmployees = MOCK_USERS.filter((u) => u.role === 'employee').length;
  const goalsSubmitted = MOCK_ORG_COMPLETION.filter((e) => e.goalSet).length;
  const goalsApproved = MOCK_ORG_COMPLETION.filter((e) => e.approved).length;
  const checkinsQ1 = MOCK_ORG_COMPLETION.filter((e) => e.q1Mgr).length;

  const stats = [
    { label: 'Total Employees', value: totalEmployees.toLocaleString(), sub: '+12 this month', icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Goals Submitted', value: goalsSubmitted, sub: `${Math.round((goalsSubmitted/totalEmployees)*100)}% Completion`, icon: <CheckSquare size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Goals Approved', value: goalsApproved, sub: `${totalEmployees - goalsApproved} Pending Mgr`, icon: <CheckCircle2 size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Check-ins Done', value: checkinsQ1, sub: 'On track', icon: <Calendar size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleExportCSV = () => {
    const data = MOCK_ORG_COMPLETION.map((e) => ({
      Employee: e.name,
      Department: e.dept,
      Manager: e.manager,
      'Goal Set': e.goalSet ? 'Yes' : 'No',
      Approved: e.approved ? 'Yes' : 'No',
      'Q1 Employee': e.q1Emp ? 'Yes' : 'No',
      'Q1 Manager': e.q1Mgr ? 'Yes' : 'No',
      'Q2 Employee': e.q2Emp ? 'Yes' : 'No',
      'Q2 Manager': e.q2Mgr ? 'Yes' : 'No',
    }));
    exportToCSV(data, 'lakshya-completion-report');
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Admin Dashboard' }]} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Completion Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Strategic performance analysis across all business units for FY 2026-27
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB813] text-gray-900 text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              View Analytics →
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <div className="font-mono text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Completion Grid', desc: 'RAG status by employee', to: '/admin/completion', icon: '📊' },
            { label: 'Audit Log', desc: 'All post-lock changes', to: '/admin/audit', icon: '📋' },
            { label: 'Analytics', desc: 'Trends, heatmap, charts', to: '/admin/analytics', icon: '📈' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-[#FDB813] hover:bg-yellow-50/30 transition-all shadow-sm"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="font-semibold text-gray-900 mt-2 text-sm">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 font-heading mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {MOCK_GOAL_SHEETS.slice(0, 4).map((sheet) => {
              const emp = MOCK_USERS.find((u) => u.id === sheet.employee_id);
              const statusIcons: Record<string, string> = { approved: '✅', submitted: '⏳', returned: '↩️', draft: '📝' };
              return (
                <div key={sheet.id} className="flex items-center gap-3 text-sm">
                  <span className="text-base">{statusIcons[sheet.status] ?? '📝'}</span>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{emp?.full_name}</span>
                    <span className="text-gray-400"> — goal sheet </span>
                    <span className="text-gray-700 font-medium">{sheet.status}</span>
                  </div>
                  {sheet.submitted_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(sheet.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
