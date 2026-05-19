import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Topbar } from '@/components/layout/Topbar';
import {
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_ACHIEVEMENTS,
  MOCK_THRUST_AREAS,
} from '@/lib/mockData';
import type { Achievement, AchievementStatus, Quarter } from '@/types';
import { computeGoalScore, computeWeightedScore, scoreBg } from '@/lib/scoring';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { uomLabel, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Save, TrendingUp } from 'lucide-react';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function QuarterlyCheckinPage() {
  const { user } = useAuth();
  const activeQuarter: Quarter = 'Q2';

  const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === user?.id);
  const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];

  const [achievements, setAchievements] = useState<Achievement[]>([
    ...MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id)),
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const getAchievement = (goalId: string, quarter: Quarter) =>
    achievements.find((a) => a.goal_id === goalId && a.quarter === quarter);

  const updateAchievement = (
    goalId: string,
    quarter: Quarter,
    field: 'actual_value' | 'actual_date' | 'status',
    value: string | number
  ) => {
    setAchievements((prev) => {
      const existing = prev.find((a) => a.goal_id === goalId && a.quarter === quarter);
      const goal = goals.find((g) => g.id === goalId)!;

      if (existing) {
        const updated = { ...existing, [field]: value };
        const score = computeGoalScore({
          uomType: goal.uom_type,
          targetValue: goal.target_value,
          targetDate: goal.target_date,
          actualValue: updated.actual_value,
          actualDate: updated.actual_date,
        });
        return prev.map((a) =>
          a.goal_id === goalId && a.quarter === quarter ? { ...updated, score } : a
        );
      } else {
        const newAch: Achievement = {
          id: `ach-new-${Date.now()}`,
          goal_id: goalId,
          quarter,
          [field]: value,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        };
        const score = computeGoalScore({
          uomType: goal.uom_type,
          targetValue: goal.target_value,
          targetDate: goal.target_date,
          actualValue: newAch.actual_value,
          actualDate: newAch.actual_date,
        });
        return [...prev, { ...newAch, score }];
      }
    });
  };

  const activeAchievements = goals.map((g) => {
    const ach = getAchievement(g.id, activeQuarter);
    return { score: ach?.score ?? 0, weightage: g.weightage };
  });

  const overallScore = computeWeightedScore(activeAchievements);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success(`${activeQuarter} actuals saved. Last saved 2 minutes ago.`);
  };

  if (!sheet || sheet.status !== 'approved') {
    return (
      <>
        <Topbar breadcrumbs={[{ label: 'Quarterly Check-in' }]} />
        <div className="p-6 text-center mt-20">
          <p className="text-gray-400 text-sm">Goals must be approved before entering actuals.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Quarterly Check-in' }]} />
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">
              Quarterly Performance Check-in
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and update your progress for the current quarter. All Q2 actuals are finalised by end of week.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Overall Score</p>
              <ScoreBadge score={overallScore} size="lg" showLabel />
            </div>
          </div>
        </div>

        {/* Quarter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {QUARTERS.map((q) => (
            <div
              key={q}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                q === activeQuarter
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-500 cursor-default'
              )}
            >
              {q}
              {q === activeQuarter && (
                <span className="ml-1.5 text-[10px] font-normal text-[#FDB813]">Active</span>
              )}
            </div>
          ))}
        </div>

        {/* Goals table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 px-4 py-2.5 gap-4">
            <span>Goal Title</span>
            <span>Target</span>
            <span>Q1 Actual</span>
            <span>Q2 Actual</span>
            <span>Status</span>
            <span>Score</span>
          </div>

          {goals.map((goal, idx) => {
            const thrustArea = MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id);
            const q1Ach = getAchievement(goal.id, 'Q1');
            const q2Ach = getAchievement(goal.id, activeQuarter);
            const isNumeric = goal.uom_type === 'numeric_min' || goal.uom_type === 'numeric_max';
            const isTimeline = goal.uom_type === 'timeline';
            const score = q2Ach?.score ?? q1Ach?.score ?? 0;

            return (
              <div
                key={goal.id}
                className={cn(
                  'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] px-4 py-3 gap-4 items-center border-b border-gray-50 hover:bg-yellow-50/30 transition-colors',
                  idx % 2 === 0 ? '' : 'bg-gray-50/30'
                )}
              >
                {/* Title */}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    {thrustArea && (
                      <span className="text-[10px] text-gray-400">{thrustArea.name}</span>
                    )}
                    <span className="text-[10px] text-gray-400">{uomLabel(goal.uom_type)}</span>
                  </div>
                </div>

                {/* Target */}
                <div className="font-mono text-sm text-gray-700">
                  {isTimeline
                    ? goal.target_date ? formatDate(goal.target_date) : '—'
                    : goal.target_value !== undefined
                    ? goal.target_value
                    : goal.uom_type === 'zero'
                    ? '0'
                    : '—'}
                </div>

                {/* Q1 Actual (read-only if already entered) */}
                <div className="font-mono text-sm text-gray-500">
                  {q1Ach?.actual_value !== undefined
                    ? q1Ach.actual_value
                    : q1Ach?.actual_date
                    ? formatDate(q1Ach.actual_date)
                    : <span className="text-gray-300">—</span>}
                </div>

                {/* Q2 Actual input */}
                <div>
                  {isNumeric && (
                    <input
                      type="number"
                      value={q2Ach?.actual_value ?? ''}
                      onChange={(e) =>
                        updateAchievement(goal.id, activeQuarter, 'actual_value', parseFloat(e.target.value))
                      }
                      placeholder="Enter actual"
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-mono bg-white"
                    />
                  )}
                  {isTimeline && (
                    <input
                      type="date"
                      value={q2Ach?.actual_date ?? ''}
                      onChange={(e) =>
                        updateAchievement(goal.id, activeQuarter, 'actual_date', e.target.value)
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white"
                    />
                  )}
                  {goal.uom_type === 'zero' && (
                    <input
                      type="number"
                      value={q2Ach?.actual_value ?? ''}
                      onChange={(e) =>
                        updateAchievement(goal.id, activeQuarter, 'actual_value', parseFloat(e.target.value))
                      }
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-mono bg-white"
                    />
                  )}
                </div>

                {/* Status */}
                <div>
                  <select
                    value={q2Ach?.status ?? ''}
                    onChange={(e) =>
                      updateAchievement(goal.id, activeQuarter, 'status', e.target.value as AchievementStatus)
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="not_started">Not Started</option>
                    <option value="on_track">On Track</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Score */}
                <div className="flex items-center">
                  {score > 0 ? (
                    <span className={cn('font-mono text-sm font-bold tabular-nums', scoreBg(score).split(' ')[1])}>
                      {score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-gray-300 font-mono text-sm">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save + insight */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <TrendingUp size={16} className="text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Performance Insight</p>
              <p className="text-gray-600 mt-0.5 text-xs">
                Your current Q2 actuals suggest you're exceeding targets in {
                  activeAchievements.filter((a) => a.score >= 80).length
                } out of {goals.length} KRAs.{' '}
                {overallScore >= 80
                  ? 'Excellent performance — keep it up!'
                  : 'Focus on your lower-scored goals to improve the balanced score.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#FDB813] text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-all text-sm disabled:opacity-60"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Draft
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-sm">
              Submit for Review
            </button>
          </div>
        </div>

        {/* Key milestone callout */}
        <div className="bg-gray-900 text-white rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Key Milestone</p>
            <p className="text-sm text-gray-200">Q2 Planning begins in</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-bold text-[#FDB813]">14</p>
            <p className="text-xs text-gray-400">Days</p>
          </div>
        </div>
      </div>
    </>
  );
}
