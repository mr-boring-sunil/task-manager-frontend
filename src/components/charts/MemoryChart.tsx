import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PerformanceSample } from '../../types/metrics';

interface MemoryChartProps {
  data: PerformanceSample[];
  height?: number;
}

export const MemoryChart: React.FC<MemoryChartProps> = ({ data, height = 220 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800"
        style={{ height }}
      >
        Awaiting telemetry data stream...
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
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
            domain={[0, 100]}
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(v) => `${v}%`}
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
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'RAM Used']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="memory"
            stroke="#38bdf8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#memGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
