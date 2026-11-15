import React from 'react';
import { HardDrive } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { formatBytes } from '../../utils/formatBytes';
import { formatPercentage } from '../../utils/formatPercentage';

interface DiskCardProps {
  total: number;
  used: number;
  available: number;
  percentage: number;
  mountPoint?: string;
  onClick?: () => void;
}

export const DiskCard: React.FC<DiskCardProps> = ({
  total,
  used,
  available,
  percentage,
  mountPoint = '/',
  onClick,
}) => {
  const percent = percentage ?? 0;
  const progressColor =
    percent > 90
      ? 'bg-rose-500'
      : percent > 75
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <MetricCard
      title="Root Storage"
      value={formatPercentage(percent)}
      subtitle={`${formatBytes(used)} used of ${formatBytes(total)}`}
      icon={HardDrive}
      iconColor="text-emerald-400"
      percentage={percent}
      progressColor={progressColor}
      onClick={onClick}
    >
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-slate-400">
          <span>Mount Point:</span>
          <span className="text-slate-200">{mountPoint}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Available Space:</span>
          <span className="text-slate-200">{formatBytes(available)}</span>
        </div>
      </div>
    </MetricCard>
  );
};
