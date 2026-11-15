import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PerformanceSample } from '../../types/metrics';

interface TemperatureChartProps {
  data: PerformanceSample[];
  isAvailable: boolean;
  height?: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  isAvailable,
  height = 220,
}) => {
  if (!isAvailable) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800"
        style={{ height }}
      >
        <span className="text-xs font-mono font-medium text-slate-400">
          Temperature sensor unavailable
        </span>
        <span className="text-[11px] text-slate-500 mt-1">
          No hardware thermal sensor detected on host
        </span>
      </div>
    );
  }

  // Filter out any samples where temperature is missing or null
  const validData = data.filter(
    (d) => typeof d.temperature === 'number' && !isNaN(d.temperature)
  );

  if (validData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800"
        style={{ height }}
      >
        Collecting thermal readings...
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={validData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis
            dataKey="timeStr"
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            domain={[30, 85]}
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(v) => `${v}°C`}
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
            formatter={(val: any) => [`${Number(val).toFixed(1)} °C`, 'CPU Core Temp']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
