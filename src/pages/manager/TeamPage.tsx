import { useState } from 'react';
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
import { CheckCircle2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

type SortKey = 'name' | 'score' | 'department';

export function TeamPage() {
  const { user } = useAuth();
  const reports = MOCK_USERS.filter((u) => u.manager_id === user?.id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reports[0]?.id ?? null);
  const [checkinComments, setCheckinComments] = useState<Record<string, string>>({});
  const [completedCheckins, setCompletedCheckins] = useState<string[]>(
    MOCK_CHECKINS.map((c) => c.sheet_id)
  );
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const selectedEmployee = reports.find((r) => r.id === selectedEmployeeId);
  const sheet = selectedEmployee
    ? MOCK_GOAL_SHEETS.find((s) => s.employee_id === selectedEmployee.id)
    : null;
  const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
  const achievements = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));

  const scoreData = goals.map((g) => ({
    score:
      achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') {
      cmp = a.full_name.localeCompare(b.full_name);
    } else if (sortKey === 'department') {
      cmp = (a.department ?? '').localeCompare(b.department ?? '');
    } else if (sortKey === 'score') {
      const getScore = (uid: string) => {
        const s = MOCK_GOAL_SHEETS.find((sh) => sh.employee_id === uid);
        const gs = s ? MOCK_GOALS.filter((g) => g.sheet_id === s.id) : [];
        const achs = MOCK_ACHIEVEMENTS.filter((a) => gs.some((g) => g.id === a.goal_id));
        return computeWeightedScore(
          gs.map((g) => ({
            score:
              achs.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
              achs.find((a) => a.goal_id === g.id && a.quarter === 'Q1')?.score ?? 0,
            weightage: g.weightage,
          }))
        );
      };
      cmp = getScore(a.id) - getScore(b.id);
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="mb-5">
        <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
          Team Performance
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          Planned vs. actual view and check-in management.
        </p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-4 items-start">
        {/* Employee list / leaderboard sidebar */}
        <div className="space-y-2">
          {/* Sort controls */}
          <div className="flex gap-1 mb-3">
            {(['name', 'score', 'department'] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize"
                style={{
                  color: sortKey === key ? '#FDB813' : '#52525B',
                  backgroundColor: sortKey === key ? 'rgba(253,184,19,0.1)' : 'transparent',
                  border: sortKey === key ? '1px solid rgba(253,184,19,0.2)' : '1px solid transparent',
                }}
              >
                {key}
                {sortKey === key && <ArrowUpDown size={8} />}
              </button>
            ))}
          </div>

          {sortedReports.map((report, idx) => {
            const s = MOCK_GOAL_SHEETS.find((sh) => sh.employee_id === report.id);
            const gs = s ? MOCK_GOALS.filter((g) => g.sheet_id === s.id) : [];
            const achs = MOCK_ACHIEVEMENTS.filter((a) => gs.some((g) => g.id === a.goal_id));
            const empScore = computeWeightedScore(
              gs.map((g) => ({
                score:
                  achs.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
                  achs.find((a) => a.goal_id === g.id && a.quarter === 'Q1')?.score ?? 0,
                weightage: g.weightage,
              }))
            );
            const isSelected = selectedEmployeeId === report.id;

            return (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                onClick={() => setSelectedEmployeeId(report.id)}
                className="w-full text-left p-3 rounded-xl transition-all"
                style={{
                  border: isSelected ? '1px solid #FDB813' : '1px solid #2A2A2A',
                  backgroundColor: isSelected ? '#FFFBEC' : '#1A1A1A',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(253,184,19,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1A1A1A';
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: '#FDB813', color: '#000000' }}
                  >
                    {getInitials(report.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                      {report.full_name}
                    </p>
                    {s && <StatusBadge status={s.status} className="mt-0.5" />}
                  </div>
                  {empScore > 0 && (
                    <span
                      className="font-mono text-xs font-bold"
                      style={{
                        color: empScore >= 80 ? '#10B981' : empScore >= 50 ? '#FDB813' : '#EF4444',
                      }}
                    >
                      {empScore.toFixed(0)}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedEmployee && sheet ? (
          <motion.div
            key={selectedEmployee.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header */}
            <div
              className="rounded-xl p-5 flex items-center justify-between"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <div>
                <h2 className="text-lg font-bold font-heading" style={{ color: '#111827' }}>
                  {selectedEmployee.full_name}
                </h2>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {selectedEmployee.department}
                </p>
              </div>
              {overallScore > 0 && <ScoreBadge score={overallScore} size="lg" showLabel />}
            </div>

            {/* Planned vs Actual table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <div
                className="px-5 py-3"
                style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
              >
                <h3 className="text-sm font-semibold" style={{ color: '#6B7280' }}>
                  Q2 Planned vs. Actual
                </h3>
              </div>
              {/* Column headers */}
              <div
                className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr] text-[10px] font-semibold uppercase tracking-wider px-4 py-2 gap-3"
                style={{ color: '#9CA3AF', borderBottom: '1px solid #E5E7EB' }}
              >
                {['Goal', 'Target', 'Q1 Actual', 'Q2 Actual', 'Score'].map((col) => (
                  <span key={col}>{col}</span>
                ))}
              </div>
              {goals.map((goal, idx) => {
                const thrustArea = MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id);
                const q1Ach = achievements.find((a) => a.goal_id === goal.id && a.quarter === 'Q1');
                const q2Ach = achievements.find((a) => a.goal_id === goal.id && a.quarter === 'Q2');
                const score = q2Ach?.score ?? q1Ach?.score ?? 0;
                return (
                  <div
                    key={goal.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr] px-4 py-3 gap-3 items-center text-sm transition-colors"
                    style={{
                      borderBottom: idx < goals.length - 1 ? '1px solid #2A2A2A' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#FFFBEC';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <p className="font-medium truncate" style={{ color: '#111827' }}>
                        {goal.title}
                      </p>
                      <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                        {thrustArea?.name} · {uomLabel(goal.uom_type)}
                      </p>
                    </div>
                    <div className="font-mono" style={{ color: '#6B7280' }}>
                      {goal.target_value !== undefined
                        ? goal.target_value
                        : goal.target_date
                        ? formatDate(goal.target_date)
                        : '0'}
                    </div>
                    <div className="font-mono" style={{ color: '#9CA3AF' }}>
                      {q1Ach?.actual_value !== undefined
                        ? q1Ach.actual_value
                        : q1Ach?.actual_date
                        ? formatDate(q1Ach.actual_date)
                        : '—'}
                    </div>
                    <div className="font-mono" style={{ color: '#6B7280' }}>
                      {q2Ach?.actual_value !== undefined
                        ? q2Ach.actual_value
                        : q2Ach?.actual_date
                        ? formatDate(q2Ach.actual_date)
                        : '—'}
                    </div>
                    <div>
                      {score > 0 ? (
                        <ScoreBadge score={score} size="sm" />
                      ) : (
                        <span className="font-mono text-xs" style={{ color: '#2A2A2A' }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Check-in module */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-heading" style={{ color: '#111827' }}>
                  Q2 Manager Check-in
                </h3>
                {completedCheckins.includes(sheet.id) && (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10B981' }}>
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>

              {existingCheckin && (
                <div
                  className="mb-4 p-3 rounded-lg"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
                    Previous check-in (Q1)
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {existingCheckin.comment}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                    {formatDate(existingCheckin.completed_at)}
                  </p>
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
                    className="w-full px-3 py-2.5 rounded-lg text-sm resize-none mb-3"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleCompleteCheckin(sheet.id)}
                    className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition-all text-sm"
                    style={{ backgroundColor: '#FDB813', color: '#000000' }}
                  >
                    <CheckCircle2 size={15} />
                    Mark Q2 Check-in Complete
                  </button>
                </>
              ) : (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#10B981',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Q2 check-in completed successfully.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              Select an employee to view their performance.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
