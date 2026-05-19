import type { UoMType } from '@/types';

export interface ScoreInput {
  uomType: UoMType;
  targetValue?: number;
  targetDate?: string;
  actualValue?: number;
  actualDate?: string;
}

export function computeGoalScore(a: ScoreInput): number {
  switch (a.uomType) {
    case 'numeric_min':
      if (!a.targetValue || !a.actualValue) return 0;
      return parseFloat(Math.min((a.actualValue / a.targetValue) * 100, 150).toFixed(2));

    case 'numeric_max':
      if (!a.targetValue || !a.actualValue) return 0;
      if (a.actualValue === 0) return 150;
      return parseFloat(Math.min((a.targetValue / a.actualValue) * 100, 150).toFixed(2));

    case 'timeline': {
      if (!a.targetDate || !a.actualDate) return 0;
      const deadline = new Date(a.targetDate).getTime();
      const completion = new Date(a.actualDate).getTime();
      const daysLate = Math.floor((completion - deadline) / (1000 * 60 * 60 * 24));
      return Math.max(100 - Math.max(daysLate, 0) * 5, 0);
    }

    case 'zero':
      if (a.actualValue === undefined || a.actualValue === null) return 0;
      return a.actualValue === 0 ? 100 : 0;

    default:
      return 0;
  }
}

export function computeWeightedScore(
  goals: Array<{ score: number; weightage: number }>
): number {
  const total = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (total === 0) return 0;
  const weighted = goals.reduce((sum, g) => sum + g.score * g.weightage, 0);
  return parseFloat((weighted / total).toFixed(2));
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-700 border-red-200';
}
