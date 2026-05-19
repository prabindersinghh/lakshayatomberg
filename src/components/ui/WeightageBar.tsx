import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeightageBarProps {
  total: number;
  className?: string;
  height?: number;
}

export function WeightageBar({ total, className, height = 12 }: WeightageBarProps) {
  const pct = Math.min(total, 100);
  const isOver = total > 100;
  const isExact = total === 100;

  const fillColor = isExact ? '#10B981' : isOver ? '#EF4444' : '#FDB813';
  const textColor = isExact ? '#10B981' : isOver ? '#EF4444' : '#FDB813';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#A1A1AA]">Total Weightage</span>
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: textColor }}>
          {total}% / 100%
        </span>
      </div>

      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: '#1F1F1F' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {total !== 100 && (
        <p className="text-xs" style={{ color: textColor }}>
          {total < 100
            ? `Add ${100 - total}% more to unlock submission.`
            : `Over by ${total - 100}%. Reduce before submitting.`}
        </p>
      )}
      {isExact && (
        <p className="text-xs font-medium" style={{ color: '#10B981' }}>
          Weightage balanced. Ready to submit.
        </p>
      )}
    </div>
  );
}
