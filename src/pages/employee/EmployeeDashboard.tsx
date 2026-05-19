import { useAuth } from '@/contexts/AuthContext';
import { Topbar } from '@/components/layout/Topbar';
import { MOCK_GOAL_SHEETS, MOCK_GOALS, MOCK_ACHIEVEMENTS, MOCK_CYCLE } from '@/lib/mockData';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { computeWeightedScore } from '@/lib/scoring';
import { formatDate } from '@/lib/utils';
import { Target, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === user?.id);
  const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
  const achievements = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));

  const latestAchievements = goals.map((g) => {
    const q2 = achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q2');
    const q1 = achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q1');
    const latest = q2 ?? q1;
    return { score: latest?.score ?? 0, weightage: g.weightage };
  });

  const overallScore = computeWeightedScore(latestAchievements);

  const stats = [
    { label: 'My Goals', value: goals.length, icon: <Target size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: achievements.filter((a) => a.status === 'completed').length, icon: <CheckCircle2 size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'On Track', value: achievements.filter((a) => a.status === 'on_track').length, icon: <Clock size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'At Risk', value: achievements.filter((a) => (a.score ?? 0) < 50).length, icon: <AlertCircle size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Dashboard' }]} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">
              Good morning, {user?.full_name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {MOCK_CYCLE.name} · {sheet ? `Goal sheet is ${sheet.status}` : 'No goal sheet yet'}
            </p>
          </div>
          {sheet && overallScore > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              <ScoreBadge score={overallScore} size="lg" showLabel />
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <div className="font-mono text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Goal status card */}
        {sheet ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 font-heading">Goal Sheet Status</h2>
              <StatusBadge status={sheet.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Total Weightage</p>
                <p className="font-mono font-bold text-gray-900 mt-0.5">{sheet.total_weightage}%</p>
              </div>
              {sheet.submitted_at && (
                <div>
                  <p className="text-gray-400 text-xs">Submitted</p>
                  <p className="font-medium text-gray-700 mt-0.5">{formatDate(sheet.submitted_at)}</p>
                </div>
              )}
              {sheet.approved_at && (
                <div>
                  <p className="text-gray-400 text-xs">Approved</p>
                  <p className="font-medium text-gray-700 mt-0.5">{formatDate(sheet.approved_at)}</p>
                </div>
              )}
              {sheet.return_reason && (
                <div className="col-span-full">
                  <p className="text-gray-400 text-xs">Return Reason</p>
                  <p className="text-red-600 text-sm mt-0.5 bg-red-50 rounded-lg p-2">{sheet.return_reason}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigate('/employee/goals')} className="text-sm font-medium text-[#FDB813] hover:underline">
                View My Goals →
              </button>
              {sheet.status === 'approved' && (
                <button onClick={() => navigate('/employee/checkin')} className="text-sm font-medium text-blue-600 hover:underline ml-4">
                  Q2 Check-in →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Target size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No Goals Yet</h3>
            <p className="text-gray-400 text-sm mt-1 mb-4">Start by creating your goal sheet for {MOCK_CYCLE.name}</p>
            <button
              onClick={() => navigate('/employee/goals')}
              className="bg-[#FDB813] text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              Create Goal Sheet
            </button>
          </div>
        )}

        {/* Cycle timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 font-heading mb-4">Cycle Timeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Goal Setting', open: MOCK_CYCLE.goal_setting_open, close: MOCK_CYCLE.goal_setting_close },
              { label: 'Q1 Check-in', open: MOCK_CYCLE.q1_open!, close: MOCK_CYCLE.q1_close! },
              { label: 'Q2 Check-in', open: MOCK_CYCLE.q2_open!, close: MOCK_CYCLE.q2_close! },
              { label: 'Q3 Check-in', open: MOCK_CYCLE.q3_open!, close: MOCK_CYCLE.q3_close! },
              { label: 'Q4 / Annual', open: MOCK_CYCLE.q4_open!, close: MOCK_CYCLE.q4_close! },
            ].map((period, i) => {
              const isActive = i === 1; // Q2 is active for demo
              return (
                <div key={period.label} className={`rounded-lg p-3 border ${isActive ? 'bg-yellow-50 border-[#FDB813]' : 'border-gray-100 bg-gray-50'}`}>
                  <p className={`text-xs font-semibold ${isActive ? 'text-yellow-700' : 'text-gray-500'}`}>{period.label}</p>
                  <p className="font-mono text-[10px] text-gray-400 mt-1">
                    {new Date(period.open).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    {' – '}
                    {new Date(period.close).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                  {isActive && <span className="inline-block mt-1 text-[10px] font-medium text-[#FDB813] bg-[#FDB813]/10 rounded-full px-2 py-0.5">Active</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
