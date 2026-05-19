import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  MOCK_GOAL_SHEETS,
  MOCK_GOALS,
  MOCK_USERS,
  MOCK_THRUST_AREAS,
} from '@/lib/mockData';
import type { Goal, GoalSheet } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReturnModalProps {
  employeeName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function ReturnModal({ employeeName, onConfirm, onCancel }: ReturnModalProps) {
  const [reason, setReason] = useState('');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md mx-4 p-6 rounded-2xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold font-heading mb-1" style={{ color: '#111827' }}>
            Return for Rework
          </h2>
          <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
            Please provide specific feedback for {employeeName} regarding the changes required in the goal sheet.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Reviewer Comments <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="E.g., The weightage for Goal #1 is too high. Please redistribute or break down the target metric into monthly milestones."
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>

          <div
            className="flex items-start gap-2 p-3 rounded-lg mb-5"
            style={{
              backgroundColor: 'rgba(96,165,250,0.06)',
              border: '1px solid rgba(96,165,250,0.15)',
            }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: 'rgba(96,165,250,0.2)' }}
            >
              <span className="text-[10px] font-bold" style={{ color: '#60A5FA' }}>i</span>
            </div>
            <p className="text-xs" style={{ color: '#60A5FA' }}>
              This comment will be visible to the employee and tracked in the history log.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
              }}
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
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#EF4444', color: '#111827' }}
            >
              Confirm Return
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ApprovalsPage() {
  const { user } = useAuth();

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-6xl mx-auto"
    >
      {returnModal && (
        <ReturnModal
          employeeName={MOCK_USERS.find((u) => u.id === returnModal.employee_id)?.full_name ?? ''}
          onConfirm={(reason) => handleReturn(returnModal, reason)}
          onCancel={() => setReturnModal(null)}
        />
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
          Approval Queue
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          {sheets.length} pending approval{sheets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {sheets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
        >
          <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: '#10B981' }} />
          <h3 className="font-semibold" style={{ color: '#111827' }}>All caught up!</h3>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            No pending approvals at this time.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
          {/* Queue list */}
          <div className="space-y-2">
            {sheets.map((sheet, idx) => {
              const emp = MOCK_USERS.find((u) => u.id === sheet.employee_id);
              const isSelected = selectedSheet?.id === sheet.id;
              return (
                <motion.button
                  key={sheet.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  onClick={() => setSelectedSheet(sheet)}
                  className="w-full text-left p-3.5 rounded-xl transition-all"
                  style={{
                    border: isSelected ? '1px solid #FDB813' : '1px solid #2A2A2A',
                    backgroundColor: isSelected ? '#FFFBEC' : '#1A1A1A',
                    borderLeft: isSelected ? '4px solid #FDB813' : '1px solid #2A2A2A',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: '#FDB813', color: '#000000' }}
                    >
                      {getInitials(emp?.full_name ?? '?')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                        {emp?.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                        {emp?.department}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      style={{ color: isSelected ? '#FDB813' : '#2A2A2A', flexShrink: 0 }}
                    />
                  </div>
                  {sheet.submitted_at && (
                    <p className="text-[10px] mt-2 ml-10" style={{ color: '#9CA3AF' }}>
                      Submitted {formatDate(sheet.submitted_at)}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Goal sheet review */}
          {selectedSheet && selectedEmployee && (
            <motion.div
              key={selectedSheet.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
              }}
            >
              {/* Header */}
              <div
                className="p-5 flex items-start justify-between"
                style={{ borderBottom: '1px solid #E5E7EB' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-bold font-heading" style={{ color: '#111827' }}>
                      Review Goal Sheet
                    </h2>
                    <StatusBadge status={selectedSheet.status} />
                  </div>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Performance Goals — {selectedEmployee.full_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    Review and finalise the KRA targets and weightage for this appraisal cycle.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Total Weightage</p>
                  <p className="font-mono text-xl font-bold" style={{ color: '#111827' }}>
                    {selectedGoals.reduce((s, g) => s + g.weightage, 0)}%
                  </p>
                </div>
              </div>

              {/* Goals */}
              <div className="p-5 space-y-3">
                {selectedGoals.map((goal, idx) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.18 }}
                    className="rounded-xl p-4 transition-colors"
                    style={{ border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#FFFBEC';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#111111';
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                            {goal.description}
                          </p>
                        )}
                        <div className="flex gap-3 mt-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                              UoM
                            </p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              {goal.uom_type === 'numeric_min' ? 'Numeric (Min)' :
                               goal.uom_type === 'numeric_max' ? 'Numeric (Max)' :
                               goal.uom_type === 'timeline' ? 'Timeline' : 'Zero-based'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                              Thrust Area
                            </p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              {MOCK_THRUST_AREAS.find((t) => t.id === goal.thrust_area_id)?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inline editable fields */}
                      <div className="flex items-center gap-3 shrink-0">
                        {(goal.uom_type === 'numeric_min' || goal.uom_type === 'numeric_max') && (
                          <div>
                            <p className="text-[10px] mb-1" style={{ color: '#9CA3AF' }}>Target</p>
                            <input
                              type="number"
                              value={goal.target_value ?? ''}
                              onChange={(e) =>
                                handleTargetEdit(goal.id, 'target_value', parseFloat(e.target.value))
                              }
                              className="w-24 px-2 py-1.5 rounded-lg text-sm font-mono text-center"
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                color: '#111827',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}
                        {goal.uom_type === 'timeline' && (
                          <div>
                            <p className="text-[10px] mb-1" style={{ color: '#9CA3AF' }}>Target Date</p>
                            <input
                              type="date"
                              value={goal.target_date ?? ''}
                              onChange={(e) =>
                                handleTargetEdit(goal.id, 'target_date', e.target.value)
                              }
                              className="px-2 py-1.5 rounded-lg text-sm"
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                color: '#111827',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] mb-1" style={{ color: '#9CA3AF' }}>Weightage %</p>
                          <input
                            type="number"
                            value={goal.weightage}
                            onChange={(e) =>
                              handleTargetEdit(goal.id, 'weightage', parseFloat(e.target.value))
                            }
                            className="w-16 px-2 py-1.5 rounded-lg text-sm font-mono text-center"
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              color: '#111827',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Validation note */}
              {selectedGoals.reduce((s, g) => s + g.weightage, 0) !== 100 && (
                <div
                  className="mx-5 mb-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: '#F87171' }}>
                    Total weightage must equal 100% before approving. Currently:{' '}
                    {selectedGoals.reduce((s, g) => s + g.weightage, 0)}%
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div
                className="px-5 pb-5 flex items-center justify-between pt-4"
                style={{ borderTop: '1px solid #E5E7EB' }}
              >
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  {selectedGoals.length} goals · Last submitted {formatDate(selectedSheet.submitted_at ?? '')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReturnModal(selectedSheet)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      border: '1px solid rgba(239,68,68,0.4)',
                      color: '#F87171',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <RotateCcw size={14} />
                    Return for Rework
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSheet)}
                    disabled={selectedGoals.reduce((s, g) => s + g.weightage, 0) !== 100}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#FDB813', color: '#000000' }}
                  >
                    <CheckCircle2 size={14} />
                    Approve Goals
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
