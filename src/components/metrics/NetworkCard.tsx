import React from 'react';
import { Network, ArrowDown, ArrowUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { NetworkMetric } from '../../types/metrics';
import { formatBytes, formatRate } from '../../utils/formatBytes';

interface NetworkCardProps {
  interfaces?: NetworkMetric[] | null;
  onClick?: () => void;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ interfaces = [], onClick }) => {
  const ifaces = interfaces || [];
  const activeCount = ifaces.filter((i) => i.status.toLowerCase() === 'up').length;

  const totalRxRate = ifaces.reduce((sum, i) => sum + (i.receiveRateBytesPerSec || 0), 0);
  const totalTxRate = ifaces.reduce((sum, i) => sum + (i.transmitRateBytesPerSec || 0), 0);

  const totalRxBytes = ifaces.reduce((sum, i) => sum + (i.receivedBytes || 0), 0);
  const totalTxBytes = ifaces.reduce((sum, i) => sum + (i.transmittedBytes || 0), 0);

  return (
    <MetricCard
      title="Network"
      value={formatRate(totalRxRate + totalTxRate)}
      subtitle={`${activeCount} of ${ifaces.length} interfaces active`}
      icon={Network}
      iconColor="text-violet-400"
      onClick={onClick}
    >
      <div className="space-y-2 text-xs font-mono">
        {/* Instantaneous Rates */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowDown className="w-3.5 h-3.5" /> RX (Down):
          </span>
          <span className="text-slate-200 font-semibold">{formatRate(totalRxRate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sky-400">
            <ArrowUp className="w-3.5 h-3.5" /> TX (Up):
          </span>
          <span className="text-slate-200 font-semibold">{formatRate(totalTxRate)}</span>
        </div>

        {/* Cumulative Bytes */}
        <div className="pt-2 border-t border-slate-800/60 flex justify-between text-[11px] text-slate-400">
          <span>Total Transferred:</span>
          <span className="text-slate-300">
            {formatBytes(totalRxBytes)} ↓ / {formatBytes(totalTxBytes)} ↑
          </span>
        </div>
      </div>
    </MetricCard>
  );
};
