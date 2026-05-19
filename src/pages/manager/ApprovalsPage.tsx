import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_USERS,
  MOCK_THRUST_AREAS,
} from '@/lib/mockData';
import type { Goal, GoalSheet } from '@/types';
import { GoalCard } from '@/components/goals/GoalCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, RotateCcw, ChevronRight, Users } from 'lucide-react';

interface ReturnModalProps {
  employeeName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function ReturnModal({ employeeName, onConfirm, onCancel }: ReturnModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 font-heading mb-1">Return for Rework</h2>
        <p className="text-sm text-gray-500 mb-5">
          Please provide specific feedback for {employeeName} regarding the changes required in the goal sheet.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Reviewer Comments <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="E.g., The weightage for Goal #1 is too high. Please redistribute or break down the target metric into monthly milestones."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none"
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 mb-5">
          <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-blue-700 text-[10px] font-bold">i</span>
          </div>
          <p className="text-xs text-blue-600">
            This comment will be visible to the employee and tracked in the history log.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                toast.error('Return reason is required.');
                return;
              }
              onConfirm(reason);
            }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApprovalsPage() {
  const { user } = useAuth();

  // Get direct reports
  const directReports = MOCK_USERS.filter((u) => u.manager_id === user?.id);
  const reportIds = directReports.map((u) => u.id);

  const [sheets, setSheets] = useState<GoalSheet[]>(
    MOCK_GOAL_SHEETS.filter(
      (s) => reportIds.includes(s.employee_id) && s.status === 'submitted'
    )
  );
  const [selectedSheet, setSelectedSheet] = useState<GoalSheet | null>(
    sheets.length > 0 ? sheets[0] : null
  );
  const [editingGoals, setEditingGoals] = useState<Record<string, Goal>>({});
  const [returnModal, setReturnModal] = useState<GoalSheet | null>(null);

  const selectedGoals = selectedSheet
    ? MOCK_GOALS.filter((g) => g.sheet_id === selectedSheet.id).map((g) => ({
        ...g,
        ...(editingGoals[g.id] ?? {}),
      }))
    : [];

  const selectedEmployee = selectedSheet
    ? MOCK_USERS.find((u) => u.id === selectedSheet.employee_id)
    : null;

  const handleApprove = (sheet: GoalSheet) => {
    setSheets((prev) => prev.filter((s) => s.id !== sheet.id));
    setSelectedSheet(null);
    toast.success(`${MOCK_USERS.find((u) => u.id === sheet.employee_id)?.full_name}'s goals approved and locked!`);
  };

  const handleReturn = (sheet: GoalSheet, reason: string) => {
    setSheets((prev) => prev.filter((s) => s.id !== sheet.id));
    setReturnModal(null);
    setSelectedSheet(null);
    toast.error(`Goal sheet returned to employee with feedback.`);
  };

  const handleTargetEdit = (goalId: string, field: string, value: unknown) => {
    setEditingGoals((prev) => ({
      ...prev,
      [goalId]: { ...(prev[goalId] ?? MOCK_GOALS.find((g) => g.id === goalId)!), [field]: value },
    }));
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Approvals' }]} />
      {returnModal && (
        <ReturnModal
          employeeName={MOCK_USERS.find((u) => u.id === returnModal.employee_id)?.full_name ?? ''}
          onConfirm={(reason) => handleReturn(returnModal, reason)}
          onCancel={() => setReturnModal(null)}
        />
      )}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Approval Queue</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {sheets.length} pending approval{sheets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {sheets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">All caught up!</h3>
            <p className="text-gray-400 text-sm mt-1">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
            {/* Queue list */}
            <div className="space-y-2">
              {sheets.map((sheet) => {
                const emp = MOCK_USERS.find((u) => u.id === sheet.employee_id);
                const isSelected = selectedSheet?.id === sheet.id;
                return (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheet(sheet)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-all',
                      isSelected
                        ? 'border-[#FDB813] bg-yellow-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-yellow-50/30'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                        {getInitials(emp?.full_name ?? '?')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{emp?.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{emp?.department}</p>
                      </div>
                      <ChevronRight size={14} className={cn('text-gray-300 shrink-0', isSelected && 'text-[#FDB813]')} />
                    </div>
                    {sheet.submitted_at && (
                      <p className="text-[10px] text-gray-400 mt-2 ml-10.5">
                        Submitted {formatDate(sheet.submitted_at)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Goal sheet review */}
            {selectedSheet && selectedEmployee && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-lg font-bold text-gray-900 font-heading">
                        Review Goal Sheet
                      </h2>
                      <StatusBadge status={selectedSheet.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      Performance Goals — {selectedEmployee.full_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Review and finalise the KRA targets and weightage for this appraisal cycle.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Weightage</p>
                    <p className="font-mono text-xl font-bold text-gray-900">
                      {selectedGoals.reduce((s, g) => s + g.weightage, 0)}%
                    </p>
                  </div>
                </div>

                {/* Goals */}
                <div className="p-5 space-y-3">
                  {selectedGoals.map((goal) => (
                    <div key={goal.id} className="border border-gray-100 rounded-xl p-4 hover:bg-yellow-50/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                          {goal.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{goal.description}</p>
                          )}
                          <div className="flex gap-3 mt-2">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">UoM</p>
                              <p className="text-xs text-gray-600">
                                {goal.uom_type === 'numeric_min' ? 'Numeric (Min)' :
                                 goal.uom_type === 'numeric_max' ? 'Numeric (Max)' :
                                 goal.uom_type === 'timeline' ? 'Timeline' : 'Zero-based'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Thrust Area</p>
                              <p className="text-xs text-gray-600">
                                {MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id)?.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Inline editable fields */}
                        <div className="flex items-center gap-3 shrink-0">
                          {(goal.uom_type === 'numeric_min' || goal.uom_type === 'numeric_max') && (
                            <div>
                              <p className="text-[10px] text-gray-400 mb-1">Target</p>
                              <input
                                type="number"
                                value={goal.target_value ?? ''}
                                onChange={(e) =>
                                  handleTargetEdit(goal.id, 'target_value', parseFloat(e.target.value))
                                }
                                className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-mono text-center"
                              />
                            </div>
                          )}
                          {goal.uom_type === 'timeline' && (
                            <div>
                              <p className="text-[10px] text-gray-400 mb-1">Target Date</p>
                              <input
                                type="date"
                                value={goal.target_date ?? ''}
                                onChange={(e) =>
                                  handleTargetEdit(goal.id, 'target_date', e.target.value)
                                }
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Weightage %</p>
                            <input
                              type="number"
                              value={goal.weightage}
                              onChange={(e) =>
                                handleTargetEdit(goal.id, 'weightage', parseFloat(e.target.value))
                              }
                              className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation note */}
                {selectedGoals.reduce((s, g) => s + g.weightage, 0) !== 100 && (
                  <div className="mx-5 mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 font-medium">
                      Total weightage must equal 100% before approving. Currently:{' '}
                      {selectedGoals.reduce((s, g) => s + g.weightage, 0)}%
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="px-5 pb-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    {selectedGoals.length} goals · Last submitted {formatDate(selectedSheet.submitted_at ?? '')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReturnModal(selectedSheet)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Return for Rework
                    </button>
                    <button
                      onClick={() => handleApprove(selectedSheet)}
                      disabled={selectedGoals.reduce((s, g) => s + g.weightage, 0) !== 100}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FDB813] text-gray-900 text-sm font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={14} />
                      Approve Goals
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
