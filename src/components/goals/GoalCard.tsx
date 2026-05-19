import { Lock, Pencil, Trash2, Share2 } from 'lucide-react';
import type { Goal, ThrustArea } from '@/types';
import { uomLabel, formatDate, cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  thrustArea?: ThrustArea;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  score?: number;
  showScore?: boolean;
  readonly?: boolean;
}

const THRUST_COLORS: Record<string, string> = {
  'Revenue Growth': 'bg-yellow-100 text-yellow-800',
  'Cost Reduction': 'bg-gray-100 text-gray-700',
  'Customer Satisfaction': 'bg-blue-100 text-blue-700',
  'Safety & Compliance': 'bg-red-100 text-red-700',
  'Operational Excellence': 'bg-green-100 text-green-700',
};

export function GoalCard({
  goal,
  thrustArea,
  isLocked,
  lockedBy,
  lockedAt,
  onEdit,
  onDelete,
  score,
  showScore,
}: GoalCardProps) {
  const scoreColor =
    score === undefined
      ? ''
      : score >= 80
      ? 'text-green-600'
      : score >= 50
      ? 'text-yellow-600'
      : 'text-red-600';

  const thrustColor = thrustArea
    ? THRUST_COLORS[thrustArea.name] ?? 'bg-purple-100 text-purple-700'
    : 'bg-gray-100 text-gray-600';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm p-4 transition-all',
        isLocked ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:border-gray-300',
        isLocked && 'bg-gray-50/50'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {thrustArea && (
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full', thrustColor)}>
                {thrustArea.name}
              </span>
            )}
            {goal.is_shared && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
                <Share2 size={9} />
                Shared Goal
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Lock size={10} />
                Locked
              </span>
            )}
          </div>
          <h3 className={cn('text-sm font-semibold text-gray-900 font-heading', isLocked && 'text-gray-600')}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showScore && score !== undefined && (
            <span className={cn('font-mono text-sm font-bold tabular-nums', scoreColor)}>
              {score.toFixed(1)}%
            </span>
          )}
          <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 rounded-lg px-2.5 py-1">
            {goal.weightage}%
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-gray-700 transition-colors"
              title="Edit goal"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove goal"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">UoM</p>
          <p className="text-xs font-medium text-gray-700">{uomLabel(goal.uom_type)}</p>
        </div>
        {goal.target_value !== undefined && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Target</p>
            <p className="font-mono text-xs font-medium text-gray-700">{goal.target_value}</p>
          </div>
        )}
        {goal.target_date && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Target Date</p>
            <p className="font-mono text-xs font-medium text-gray-700">{formatDate(goal.target_date)}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Weightage</p>
          <p className="font-mono text-xs font-bold text-gray-900">{goal.weightage}%</p>
        </div>
      </div>

      {/* Lock footer */}
      {isLocked && lockedBy && lockedAt && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400">
          <Lock size={10} />
          Approved &amp; locked by {lockedBy} on {formatDate(lockedAt)}
        </div>
      )}
    </div>
  );
}
