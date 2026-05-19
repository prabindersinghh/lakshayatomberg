import { cn } from '@/lib/utils';

interface WeightageBarProps {
  total: number;
  className?: string;
}

export function WeightageBar({ total, className }: WeightageBarProps) {
  const clamped = Math.min(total, 110);
  const pct = Math.min(clamped, 100);

  const fillColor =
    total === 100
      ? 'bg-green-500'
      : total > 100
      ? 'bg-red-500'
      : 'bg-brand-yellow';

  const textColor =
    total === 100
      ? 'text-green-700'
      : total > 100
      ? 'text-red-600'
      : 'text-yellow-700';

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Total Weightage Utilisation</span>
        <span className={cn('font-mono text-sm font-bold tabular-nums', textColor)}>
          {total}% / 100% used
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', fillColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {total !== 100 && (
        <p className={cn('text-xs', textColor)}>
          {total < 100
            ? `You must add ${100 - total}% more before submitting for approval.`
            : `Weightage exceeds 100% by ${total - 100}%. Please reduce before submitting.`}
        </p>
      )}
    </div>
  );
}
