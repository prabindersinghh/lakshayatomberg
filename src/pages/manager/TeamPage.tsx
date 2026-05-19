import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  MOCK_USERS,
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_ACHIEVEMENTS,
  MOCK_CHECKINS,
  MOCK_THRUST_AREAS,
} from '@/lib/mockData';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { computeWeightedScore } from '@/lib/scoring';
import { getInitials, uomLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export function TeamPage() {
  const { user } = useAuth();
  const reports = MOCK_USERS.filter((u) => u.manager_id === user?.id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reports[0]?.id ?? null);
  const [checkinComments, setCheckinComments] = useState<Record<string, string>>({});
  const [completedCheckins, setCompletedCheckins] = useState<string[]>(
    MOCK_CHECKINS.map((c) => c.sheet_id)
  );

  const selectedEmployee = reports.find((r) => r.id === selectedEmployeeId);
  const sheet = selectedEmployee
    ? MOCK_GOAL_SHEETS.find((s) => s.employee_id === selectedEmployee.id)
    : null;
  const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
  const achievements = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));

  const scoreData = goals.map((g) => ({
    score: achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
           achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q1')?.score ?? 0,
    weightage: g.weightage,
  }));
  const overallScore = computeWeightedScore(scoreData);

  const existingCheckin = sheet
    ? MOCK_CHECKINS.find((c) => c.sheet_id === sheet.id && c.quarter === 'Q2')
    : null;

  const handleCompleteCheckin = (sheetId: string) => {
    const comment = checkinComments[sheetId];
    if (!comment?.trim()) {
      toast.error('Please enter a check-in comment before marking complete.');
      return;
    }
    setCompletedCheckins((prev) => [...prev, sheetId]);
    toast.success('Q2 check-in marked complete!');
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Team Performance' }]} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Team Performance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Planned vs. actual view and check-in management.</p>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-4 items-start">
          {/* Employee list */}
          <div className="space-y-2">
            {reports.map((report) => {
              const s = MOCK_GOAL_SHEETS.find((sh) => sh.employee_id === report.id);
              const isSelected = selectedEmployeeId === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedEmployeeId(report.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#FDB813] bg-yellow-50'
                      : 'border-gray-200 bg-white hover:bg-yellow-50/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                      {getInitials(report.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{report.full_name}</p>
                      {s && <StatusBadge status={s.status} className="mt-0.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedEmployee && sheet ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-heading">{selectedEmployee.full_name}</h2>
                  <p className="text-sm text-gray-400">{selectedEmployee.department}</p>
                </div>
                {overallScore > 0 && <ScoreBadge score={overallScore} size="lg" showLabel />}
              </div>

              {/* Planned vs Actual table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">Q2 Planned vs. Actual</h3>
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr] text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100 px-4 py-2 gap-3">
                  <span>Goal</span>
                  <span>Target</span>
                  <span>Q1 Actual</span>
                  <span>Q2 Actual</span>
                  <span>Score</span>
                </div>
                {goals.map((goal) => {
                  const thrustArea = MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id);
                  const q1Ach = achievements.find((a) => a.goal_id === goal.id && a.quarter === 'Q1');
                  const q2Ach = achievements.find((a) => a.goal_id === goal.id && a.quarter === 'Q2');
                  const score = q2Ach?.score ?? q1Ach?.score ?? 0;
                  return (
                    <div key={goal.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr] px-4 py-3 gap-3 items-center border-b border-gray-50 hover:bg-yellow-50/20 transition-colors text-sm">
                      <div>
                        <p className="font-medium text-gray-900 truncate">{goal.title}</p>
                        <p className="text-[10px] text-gray-400">{thrustArea?.name} · {uomLabel(goal.uom_type)}</p>
                      </div>
                      <div className="font-mono text-gray-700">
                        {goal.target_value !== undefined ? goal.target_value :
                         goal.target_date ? formatDate(goal.target_date) : '0'}
                      </div>
                      <div className="font-mono text-gray-500">
                        {q1Ach?.actual_value !== undefined ? q1Ach.actual_value :
                         q1Ach?.actual_date ? formatDate(q1Ach.actual_date) : '—'}
                      </div>
                      <div className="font-mono text-gray-700">
                        {q2Ach?.actual_value !== undefined ? q2Ach.actual_value :
                         q2Ach?.actual_date ? formatDate(q2Ach.actual_date) : '—'}
                      </div>
                      <div>
                        {score > 0 ? (
                          <ScoreBadge score={score} size="sm" />
                        ) : (
                          <span className="text-gray-300 font-mono text-xs">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Check-in module */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 font-heading">Q2 Manager Check-in</h3>
                  {completedCheckins.includes(sheet.id) && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}
                </div>

                {existingCheckin && (
                  <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Previous check-in (Q1)</p>
                    <p className="text-sm text-gray-700">{existingCheckin.comment}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(existingCheckin.completed_at)}</p>
                  </div>
                )}

                {!completedCheckins.includes(sheet.id) ? (
                  <>
                    <textarea
                      rows={4}
                      value={checkinComments[sheet.id] ?? ''}
                      onChange={(e) =>
                        setCheckinComments((prev) => ({ ...prev, [sheet.id]: e.target.value }))
                      }
                      placeholder="Enter structured check-in comment: progress assessment, blockers, coaching notes, next quarter priorities..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none mb-3"
                    />
                    <button
                      onClick={() => handleCompleteCheckin(sheet.id)}
                      className="flex items-center gap-2 bg-[#FDB813] text-gray-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-all text-sm"
                    >
                      <CheckCircle2 size={15} />
                      Mark Q2 Check-in Complete
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                    <CheckCircle2 size={16} />
                    Q2 check-in completed successfully.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">Select an employee to view their performance.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
