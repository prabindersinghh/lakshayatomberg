import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS, MOCK_GOAL_SHEETS, MOCK_GOALS, MOCK_ACHIEVEMENTS, MOCK_CHECKINS } from '@/lib/mockData';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { computeWeightedScore } from '@/lib/scoring';
import { getInitials } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Users, Clock, TrendingUp } from 'lucide-react';

export function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const reports = MOCK_USERS.filter((u) => u.manager_id === user?.id);
  const reportSheets = MOCK_GOAL_SHEETS.filter((s) => reports.some((r) => r.id === s.employee_id));

  const pendingApprovals = reportSheets.filter((s) => s.status === 'submitted').length;
  const approved = reportSheets.filter((s) => s.status === 'approved').length;
  const checkinsDone = MOCK_CHECKINS.filter((c) => reports.some((r) => {
    const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === r.id);
    return sheet?.id === c.sheet_id && c.quarter === 'Q1';
  })).length;

  const stats = [
    { label: 'Team Members', value: reports.length, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approvals', value: pendingApprovals, icon: <Clock size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50', action: () => navigate('/manager/approvals') },
    { label: 'Goals Approved', value: approved, icon: <CheckSquare size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Check-ins Done', value: checkinsDone, icon: <TrendingUp size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Manager Dashboard' }]} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Team Overview
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user?.full_name} · {user?.department}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={s.action}
              className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-left transition-all ${s.action ? 'hover:border-[#FDB813] hover:shadow-md cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <div className="font-mono text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Team table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 font-heading">Direct Reports</h2>
            <button
              onClick={() => navigate('/manager/team')}
              className="text-sm text-[#FDB813] hover:underline font-medium"
            >
              View Full Dashboard →
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {reports.map((report) => {
              const sheet = reportSheets.find((s) => s.employee_id === report.id);
              const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
              const achs = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));
              const scoreData = goals.map((g) => ({
                score: achs.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
                       achs.find((a) => a.goal_id === g.id && a.quarter === 'Q1')?.score ?? 0,
                weightage: g.weightage,
              }));
              const overallScore = computeWeightedScore(scoreData);

              return (
                <div
                  key={report.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-yellow-50/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                    {getInitials(report.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{report.full_name}</p>
                    <p className="text-xs text-gray-400">{report.department}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">Goals</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{goals.length}</p>
                  </div>
                  <div>
                    {sheet ? <StatusBadge status={sheet.status} /> : <StatusBadge status="draft" />}
                  </div>
                  <div>
                    {overallScore > 0 ? (
                      <ScoreBadge score={overallScore} size="sm" />
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
