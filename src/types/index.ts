export type UserRole = 'employee' | 'manager' | 'admin';

export type GoalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'returned';

export type UoMType =
  | 'numeric_min'
  | 'numeric_max'
  | 'timeline'
  | 'zero';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type AchievementStatus =
  | 'not_started'
  | 'on_track'
  | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  manager_id?: string;
  created_at: string;
}

export interface GoalCycle {
  id: string;
  name: string;
  goal_setting_open: string;
  goal_setting_close: string;
  q1_open?: string;
  q1_close?: string;
  q2_open?: string;
  q2_close?: string;
  q3_open?: string;
  q3_close?: string;
  q4_open?: string;
  q4_close?: string;
  is_active: boolean;
}

export interface ThrustArea {
  id: string;
  name: string;
  cycle_id: string;
  is_active: boolean;
}

export interface GoalSheet {
  id: string;
  employee_id: string;
  cycle_id: string;
  status: GoalStatus;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  return_reason?: string;
  is_locked: boolean;
  total_weightage: number;
  overall_score?: number;
}

export interface Goal {
  id: string;
  sheet_id: string;
  thrust_area_id: string;
  title: string;
  description?: string;
  uom_type: UoMType;
  target_value?: number;
  target_date?: string;
  weightage: number;
  is_shared: boolean;
  shared_from_goal_id?: string;
  primary_owner_id?: string;
  display_order: number;
}

export interface Achievement {
  id: string;
  goal_id: string;
  quarter: Quarter;
  actual_value?: number;
  actual_date?: string;
  status?: AchievementStatus;
  score?: number;
  updated_at: string;
  updated_by?: string;
}

export interface Checkin {
  id: string;
  sheet_id: string;
  manager_id: string;
  quarter: Quarter;
  comment: string;
  completed_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  reason?: string;
  created_at: string;
}

export interface GoalDraft {
  title: string;
  uom_type: UoMType | '';
  target_value?: number;
  target_date?: string;
  weightage: number;
  thrust_area_id: string;
  description?: string;
}
