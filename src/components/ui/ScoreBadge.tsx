import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  const color =
    score >= 80 ? '#10B981' :
    score >= 50 ? '#FDB813' :
    '#EF4444';

  const bg =
    score >= 80 ? 'rgba(16,185,129,0.1)' :
    score >= 50 ? 'rgba(253,184,19,0.1)' :
    'rgba(239,68,68,0.1)';

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5',
  }[size];

  const label = score >= 80 ? 'On Track' : score >= 50 ? 'At Risk' : 'Behind';

  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full font-mono font-semibold border', sizeClass)}
      style={{ color, background: bg, borderColor: color + '33' }}
    >
      {score.toFixed(1)}%
      {showLabel && (
        <span className="font-sans font-medium text-xs ml-0.5">{label}</span>
      )}
    </span>
  );
}
