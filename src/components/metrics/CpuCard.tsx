import React from 'react';
import { Cpu } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { CpuMetrics } from '../../types/metrics';
import { formatPercentage } from '../../utils/formatPercentage';

interface CpuCardProps {
  utilization: number | null | undefined;
  cpuDetails?: CpuMetrics | null;
  onClick?: () => void;
}

export const CpuCard: React.FC<CpuCardProps> = ({ utilization = 0, cpuDetails, onClick }) => {
  const util = utilization ?? 0;

  // Determine alert color based on load
  const progressColor =
    util > 85
      ? 'bg-rose-500'
      : util > 70
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const subtitle = cpuDetails ? (
    <span>
      {cpuDetails.cpuModel} • {cpuDetails.cores} {cpuDetails.cores === 1 ? 'Core' : 'Cores'}
      {cpuDetails.frequencyGhz ? ` @ ${cpuDetails.frequencyGhz} GHz` : ''}
    </span>
  ) : (
    <span>Host Processor Load</span>
  );

  return (
    <MetricCard
      title="Processor"
      value={formatPercentage(util)}
      subtitle={subtitle}
      icon={Cpu}
      iconColor="text-rose-400"
      percentage={util}
      progressColor={progressColor}
      onClick={onClick}
    >
      {/* Per-Core Load Bars */}
      {cpuDetails?.perCoreUtilization && cpuDetails.perCoreUtilization.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>Cores</span>
            <span>{cpuDetails.perCoreUtilization.length} active</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cpuDetails.perCoreUtilization.map((c) => {
              const coreColor =
                c.load > 85 ? 'bg-rose-500' : c.load > 70 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={c.core} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>CPU {c.core}</span>
                    <span>{c.load.toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${coreColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, c.load))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MetricCard>
  );
};
