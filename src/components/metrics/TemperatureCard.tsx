import React from 'react';
import { Thermometer } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface TemperatureCardProps {
  celsius: number | null | undefined;
  status: 'available' | 'unavailable' | string;
  onClick?: () => void;
}

export const TemperatureCard: React.FC<TemperatureCardProps> = ({ celsius, status, onClick }) => {
  const isAvailable = status === 'available' && typeof celsius === 'number' && !isNaN(celsius);

  let tempColor = 'text-emerald-400';
  let badgeText = 'Normal';
  let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let progressColor = 'bg-emerald-500';
  let normalizedPercent = 0;

  if (isAvailable && celsius !== null) {
    // 0°C to 100°C scale for Raspberry Pi SoC
    normalizedPercent = Math.min(100, Math.max(0, (celsius / 85) * 100));

    if (celsius >= 80) {
      tempColor = 'text-rose-400';
      badgeText = 'Throttling Risk';
      badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      progressColor = 'bg-rose-500';
    } else if (celsius >= 65) {
      tempColor = 'text-amber-400';
      badgeText = 'Warm';
      badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      progressColor = 'bg-amber-500';
    } else {
      tempColor = 'text-emerald-400';
      badgeText = 'Cool';
      badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      progressColor = 'bg-emerald-500';
    }
  }

  const badge = isAvailable ? (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClass}`}>
      {badgeText}
    </span>
  ) : (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400">
      Sensor N/A
    </span>
  );

  return (
    <MetricCard
      title="Thermal"
      value={isAvailable && celsius !== null ? `${celsius.toFixed(1)} °C` : 'N/A'}
      subtitle={
        isAvailable
          ? 'Broadcom BCM2837 SoC Sensor'
          : 'Temperature sensor unavailable'
      }
      icon={Thermometer}
      iconColor={isAvailable ? tempColor : 'text-slate-500'}
      percentage={isAvailable ? normalizedPercent : undefined}
      progressColor={progressColor}
      badge={badge}
      onClick={onClick}
    >
      <div className="text-xs font-mono text-slate-400">
        {isAvailable ? (
          <div className="flex justify-between">
            <span>Thermal Target:</span>
            <span className="text-slate-300">&lt; 70.0 °C</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic">
            Virtual machine or host environment does not expose /sys/class/thermal
          </p>
        )}
      </div>
    </MetricCard>
  );
};
