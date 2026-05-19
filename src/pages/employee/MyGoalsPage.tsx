import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Topbar } from '@/components/layout/Topbar';
import {
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_THRUST_AREAS,
  MOCK_USERS,
} from '@/lib/mockData';
import type { Goal, GoalDraft, UoMType } from '@/types';
import { WeightageBar } from '@/components/ui/WeightageBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { validateGoal, validateGoalSheet } from '@/lib/validations';
import { toast } from 'sonner';
import { Plus, Send, Lock, AlertTriangle } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export function MyGoalsPage() {
  const { user } = useAuth();

  const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === user?.id) ?? null;
  const [goals, setGoals] = useState<Goal[]>(
    sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : []
  );
  const [sheetStatus, setSheetStatus] = useState(sheet?.status ?? 'draft');
  const [isLocked, setIsLocked] = useState(sheet?.is_locked ?? false);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const totalWeightage = goals.reduce((s, g) => s + g.weightage, 0);
  const approvedBy = sheet?.approved_by
    ? MOCK_USERS.find((u) => u.id === sheet.approved_by)
    : null;

  const canEdit = sheetStatus === 'draft' || sheetStatus === 'returned';

  const handleAddGoal = (draft: GoalDraft) => {
    const validation = validateGoal(draft);
    if (!validation.valid) {
      Object.values(validation.errors).forEach((e) => toast.error(e));
      return;
    }
    if (goals.length >= 8) {
      toast.error('Maximum 8 goals allowed.');
      return;
    }
    const newGoal: Goal = {
      id: `g-new-${Date.now()}`,
      sheet_id: sheet?.id ?? 'sheet-new',
      thrust_area_id: draft.thrust_area_id,
      title: draft.title,
      description: draft.description,
      uom_type: draft.uom_type as UoMType,
      target_value: draft.target_value,
      target_date: draft.target_date,
      weightage: draft.weightage,
      is_shared: false,
      display_order: goals.length + 1,
    };
    setGoals([...goals, newGoal]);
    setShowForm(false);
    toast.success('Goal added successfully.');
  };

  const handleEditGoal = (draft: GoalDraft) => {
    if (!editingGoal) return;
    const validation = validateGoal(draft);
    if (!validation.valid) {
      Object.values(validation.errors).forEach((e) => toast.error(e));
      return;
    }
    setGoals(
      goals.map((g) =>
        g.id === editingGoal.id
          ? {
              ...g,
              title: draft.title,
              description: draft.description,
              uom_type: draft.uom_type as UoMType,
              target_value: draft.target_value,
              target_date: draft.target_date,
              weightage: draft.weightage,
              thrust_area_id: draft.thrust_area_id,
            }
          : g
      )
    );
    setEditingGoal(null);
    toast.success('Goal updated.');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
    toast.success('Goal removed.');
  };

  const handleSubmit = () => {
    const sheetValidation = validateGoalSheet(
      goals.map((g) => ({ ...g, uom_type: g.uom_type, thrust_area_id: g.thrust_area_id, title: g.title }))
    );
    if (!sheetValidation.valid) {
      Object.values(sheetValidation.errors).forEach((e) => toast.error(e));
      return;
    }
    setSheetStatus('submitted');
    toast.success('Goal sheet submitted for approval!');
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'My Goals' }]} />
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">My Goals</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Define and track your performance objectives for the upcoming cycle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={sheetStatus} />
            {isLocked && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Lock size={12} /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Weightage bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <WeightageBar total={totalWeightage} />
        </div>

        {/* Return reason banner */}
        {sheetStatus === 'returned' && sheet?.return_reason && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Returned for Rework</p>
              <p className="text-sm text-red-600 mt-0.5">{sheet.return_reason}</p>
            </div>
          </div>
        )}

        {/* Goal list */}
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              thrustArea={MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id)}
              isLocked={isLocked}
              lockedBy={approvedBy?.full_name}
              lockedAt={sheet?.approved_at}
              onEdit={canEdit && !isLocked ? () => setEditingGoal(goal) : undefined}
              onDelete={canEdit && !isLocked ? () => handleDeleteGoal(goal.id) : undefined}
            />
          ))}

          {/* Add goal placeholder */}
          {canEdit && !isLocked && goals.length < 8 && !showForm && !editingGoal && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#FDB813] hover:text-[#FDB813] hover:bg-yellow-50 transition-all text-sm font-medium"
            >
              <Plus size={18} />
              Add New Performance Goal
            </button>
          )}

          {goals.length === 0 && !showForm && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No goals yet. Click "Add New Performance Goal" to start.</p>
            </div>
          )}
        </div>

        {/* Add / Edit form inline */}
        {showForm && !editingGoal && (
          <GoalForm
            thrustAreas={MOCK_THRUST_AREAS}
            existingTotal={totalWeightage}
            onSave={handleAddGoal}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editingGoal && (
          <GoalForm
            thrustAreas={MOCK_THRUST_AREAS}
            existingTotal={totalWeightage - editingGoal.weightage}
            defaultValues={{
              title: editingGoal.title,
              description: editingGoal.description ?? '',
              thrust_area_id: editingGoal.thrust_area_id,
              uom_type: editingGoal.uom_type,
              target_value: editingGoal.target_value,
              target_date: editingGoal.target_date,
              weightage: editingGoal.weightage,
            }}
            onSave={handleEditGoal}
            onCancel={() => setEditingGoal(null)}
            isEditing
          />
        )}

        {/* Submit button */}
        {canEdit && !isLocked && goals.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className={cn('text-sm', totalWeightage === 100 ? 'text-green-600' : 'text-yellow-700')}>
              {totalWeightage === 100
                ? '✓ Ready to submit — weightage is exactly 100%'
                : `${goals.length} goal${goals.length !== 1 ? 's' : ''} · ${totalWeightage}% weightage allocated`}
            </p>
            <button
              onClick={handleSubmit}
              disabled={totalWeightage !== 100}
              className="flex items-center gap-2 bg-[#FDB813] text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <Send size={15} />
              Submit for Approval
            </button>
          </div>
        )}

        {/* Lock footer */}
        {isLocked && approvedBy && sheet?.approved_at && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500">
            <Lock size={12} />
            Approved &amp; locked by {approvedBy.full_name} on {formatDate(sheet.approved_at)}
          </div>
        )}

        {/* Info boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            {
              title: 'Cycle Timeline',
              body: `Goal setting open till 30 Jun 2026. Please ensure all KRAs are approved by your manager before this date.`,
            },
            {
              title: 'Weightage Rule',
              body: 'Each individual goal must be between 10% and 40%. Cumulative weightage across all goals must equal 100%.',
            },
            {
              title: 'Need Help?',
              body: 'Contact IT Support or view the Goal Setting Guidelines PDF for best practices.',
            },
          ].map((box) => (
            <div key={box.title} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600">{box.title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{box.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
