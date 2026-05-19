import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  const colorClass =
    score >= 80
      ? 'bg-green-50 text-green-700 border-green-200'
      : score >= 50
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-red-50 text-red-700 border-red-200';

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-mono font-semibold',
        colorClass,
        sizeClass
      )}
    >
      {score.toFixed(1)}%
      {showLabel && (
        <span className="font-sans font-normal text-xs ml-1">
          {score >= 80 ? 'On Track' : score >= 50 ? 'At Risk' : 'Behind'}
        </span>
      )}
    </span>
  );
}
