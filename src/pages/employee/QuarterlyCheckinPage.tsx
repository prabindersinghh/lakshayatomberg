import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_ACHIEVEMENTS,
  MOCK_THRUST_AREAS,
} from '@/lib/mockData';
import type { Achievement, AchievementStatus, Quarter } from '@/types';
import { computeGoalScore, computeWeightedScore, scoreBg } from '@/lib/scoring';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { uomLabel, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Save, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
        className="p-6 text-center mt-20"
      >
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          Goals must be approved before entering actuals.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-5xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
            Quarterly Performance Check-in
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Review and update your progress for the current quarter. All Q2 actuals are finalised by end of week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Overall Score</p>
            <ScoreBadge score={overallScore} size="lg" showLabel />
          </div>
        </div>
      </div>

      {/* Quarter tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        {QUARTERS.map((q) => (
          <div
            key={q}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              q === activeQuarter
                ? {
                    backgroundColor: '#FDB813',
                    color: '#000000',
                    fontWeight: 600,
                  }
                : { color: '#9CA3AF', cursor: 'default' }
            }
          >
            {q}
            {q === activeQuarter && (
              <span className="ml-1.5 text-[10px] font-normal" style={{ color: '#000000', opacity: 0.6 }}>
                Active
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Goals table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5 gap-4"
          style={{
            color: '#9CA3AF',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
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
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] px-4 py-3 gap-4 items-center"
              style={{
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: idx % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
              }}
            >
              {/* Title */}
              <div>
                <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                  {goal.title}
                </p>
                <div className="flex gap-2 mt-0.5">
                  {thrustArea && (
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                      {thrustArea.name}
                    </span>
                  )}
                  <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                    {uomLabel(goal.uom_type)}
                  </span>
                </div>
              </div>

              {/* Target */}
              <div className="font-mono text-sm" style={{ color: '#6B7280' }}>
                {isTimeline
                  ? goal.target_date ? formatDate(goal.target_date) : '—'
                  : goal.target_value !== undefined
                  ? goal.target_value
                  : goal.uom_type === 'zero'
                  ? '0'
                  : '—'}
              </div>

              {/* Q1 Actual (read-only) */}
              <div className="font-mono text-sm" style={{ color: '#9CA3AF' }}>
                {q1Ach?.actual_value !== undefined
                  ? q1Ach.actual_value
                  : q1Ach?.actual_date
                  ? formatDate(q1Ach.actual_date)
                  : <span style={{ color: '#2A2A2A' }}>—</span>}
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
                    className="w-full px-2 py-1.5 rounded-lg text-sm font-mono"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                )}
                {isTimeline && (
                  <input
                    type="date"
                    value={q2Ach?.actual_date ?? ''}
                    onChange={(e) =>
                      updateAchievement(goal.id, activeQuarter, 'actual_date', e.target.value)
                    }
                    className="w-full px-2 py-1.5 rounded-lg text-sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#111827',
                      outline: 'none',
                    }}
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
                    className="w-full px-2 py-1.5 rounded-lg text-sm font-mono"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#111827',
                      outline: 'none',
                    }}
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
                  className="w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    color: '#6B7280',
                    outline: 'none',
                  }}
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
                  <span
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{
                      color: score >= 80 ? '#10B981' : score >= 50 ? '#FDB813' : '#EF4444',
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                ) : (
                  <span className="font-mono text-sm" style={{ color: '#2A2A2A' }}>—</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Save + insight */}
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex-1 flex items-start gap-3 rounded-xl p-4"
          style={{
            backgroundColor: '#FFFBEC',
            border: '1px solid rgba(253,184,19,0.2)',
          }}
        >
          <TrendingUp size={16} className="shrink-0 mt-0.5" style={{ color: '#FDB813' }} />
          <div className="text-sm">
            <p className="font-semibold" style={{ color: '#111827' }}>Performance Insight</p>
            <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>
              Your current Q2 actuals suggest you're exceeding targets in{' '}
              {activeAchievements.filter((a) => a.score >= 80).length} out of {goals.length} KRAs.{' '}
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
            className="flex items-center gap-2 font-semibold px-6 py-2.5 rounded-lg transition-all text-sm disabled:opacity-60"
            style={{ backgroundColor: '#FDB813', color: '#000000' }}
          >
            {isSaving ? (
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000000' }}
              />
            ) : (
              <Save size={15} />
            )}
            Save Draft
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-lg transition-all text-sm"
            style={{ backgroundColor: '#2A2A2A', color: '#111827', border: '1px solid #3A3A3A' }}
          >
            Submit for Review
          </button>
        </div>
      </div>

      {/* Key milestone callout */}
      <div
        className="rounded-xl p-5 flex items-start justify-between"
        style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        <div>
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: '#9CA3AF' }}
          >
            Key Milestone
          </p>
          <p className="text-sm" style={{ color: '#6B7280' }}>Q2 Planning begins in</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-bold" style={{ color: '#FDB813' }}>14</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Days</p>
        </div>
      </div>
    </motion.div>
  );
}
