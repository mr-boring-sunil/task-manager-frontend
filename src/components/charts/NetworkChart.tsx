import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PerformanceSample } from '../../types/metrics';
import { formatRate } from '../../utils/formatBytes';

interface NetworkChartProps {
  data: PerformanceSample[];
  height?: number;
}

export const NetworkChart: React.FC<NetworkChartProps> = ({ data, height = 220 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800"
        style={{ height }}
      >
        Awaiting network stream...
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis
            dataKey="timeStr"
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(v) => formatRate(v, 0)}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
            formatter={(val: any, name: any) => [
              formatRate(Number(val) || 0),
              name === 'networkRxBytesPerSec' ? 'Download (RX)' : 'Upload (TX)',
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend
            verticalAlign="top"
            height={32}
            formatter={(value) => (
              <span className="text-xs font-mono text-slate-300">
                {value === 'networkRxBytesPerSec' ? 'Download (RX)' : 'Upload (TX)'}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="networkRxBytesPerSec"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#rxGradient)"
            name="networkRxBytesPerSec"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="networkTxBytesPerSec"
            stroke="#818cf8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#txGradient)"
            name="networkTxBytesPerSec"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
