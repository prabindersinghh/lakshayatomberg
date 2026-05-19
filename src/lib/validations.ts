import type { GoalDraft } from '@/types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateGoal(goal: Partial<GoalDraft>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!goal.title?.trim()) {
    errors.title = 'Goal title is required';
  }
  if (!goal.thrust_area_id) {
    errors.thrust_area_id = 'Please select a Thrust Area';
  }
  if (!goal.uom_type) {
    errors.uom_type = 'Please select a unit of measurement';
  }
  if (goal.uom_type && ['numeric_min', 'numeric_max'].includes(goal.uom_type)) {
    if (!goal.target_value || goal.target_value <= 0) {
      errors.target_value = 'Target value must be greater than zero';
    }
  }
  if (goal.uom_type === 'timeline') {
    if (!goal.target_date) {
      errors.target_date = 'Target date is required for timeline goals';
    }
  }
  if (!goal.weightage || goal.weightage < 10) {
    errors.weightage = 'Minimum weightage is 10%';
  }
  if (goal.weightage && goal.weightage > 100) {
    errors.weightage = 'Weightage cannot exceed 100%';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateGoalSheet(
  goals: GoalDraft[],
  existingCount = 0
): ValidationResult {
  const errors: Record<string, string> = {};

  const totalGoals = goals.length + existingCount;
  if (totalGoals > 8) {
    errors.count = `Maximum 8 goals allowed. You have ${totalGoals}.`;
  }

  const totalWeightage = Math.round(
    goals.reduce((sum, g) => sum + (g.weightage || 0), 0) * 100
  ) / 100;

  if (Math.abs(totalWeightage - 100) > 0.01) {
    errors.weightage = `Total weightage must equal 100%. Currently: ${totalWeightage}%`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
