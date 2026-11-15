import React from 'react';
import { Database } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { MemoryMetrics } from '../../types/metrics';
import { formatBytes } from '../../utils/formatBytes';
import { formatPercentage } from '../../utils/formatPercentage';

interface MemoryCardProps {
  totalRam: number;
  usedRam: number;
  availableRam: number;
  utilizationPercentage: number;
  memDetails?: MemoryMetrics | null;
  onClick?: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  totalRam,
  usedRam,
  availableRam,
  utilizationPercentage,
  memDetails,
  onClick,
}) => {
  const percent = utilizationPercentage ?? 0;
  const progressColor =
    percent > 85
      ? 'bg-rose-500'
      : percent > 70
      ? 'bg-amber-500'
      : 'bg-sky-500';

  const swap = memDetails?.swap;
  const swapPercentage =
    swap && swap.total > 0 ? Math.round((swap.used / swap.total) * 1000) / 10 : 0;

  return (
    <MetricCard
      title="Memory"
      value={formatPercentage(percent)}
      subtitle={`${formatBytes(usedRam)} used of ${formatBytes(totalRam)}`}
      icon={Database}
      iconColor="text-sky-400"
      percentage={percent}
      progressColor={progressColor}
      onClick={onClick}
    >
      <div className="space-y-2 text-xs font-mono">
        {/* Memory Counters */}
        <div className="flex justify-between text-slate-400">
          <span>Available:</span>
          <span className="text-slate-200">{formatBytes(availableRam)}</span>
        </div>

        {memDetails?.free !== undefined && (
          <div className="flex justify-between text-slate-400">
            <span>Free (unallocated):</span>
            <span className="text-slate-300">{formatBytes(memDetails.free)}</span>
          </div>
        )}

        {/* Swap Bar */}
        {swap && swap.total > 0 && (
          <div className="pt-2 border-t border-slate-800/60">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Swap Space</span>
              <span>
                {formatBytes(swap.used)} / {formatBytes(swap.total)} ({swapPercentage}%)
              </span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, swapPercentage)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </MetricCard>
  );
};
