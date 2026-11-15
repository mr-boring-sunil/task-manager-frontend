import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  percentage?: number;
  progressColor?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-rose-400',
  percentage,
  progressColor = 'bg-rose-500',
  badge,
  children,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`card-base p-5 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-600/80 hover:shadow-md' : ''
      } ${className}`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
          </div>
          {badge && <div>{badge}</div>}
        </div>

        {/* Primary Value */}
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">{value}</div>
        </div>

        {/* Subtitle / Descriptive text */}
        {subtitle && <div className="text-xs text-slate-400 mb-3">{subtitle}</div>}

        {/* Progress Bar (if percentage is provided) */}
        {typeof percentage === 'number' && (
          <div className="mt-2 mb-1">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Extra card body content */}
      {children && <div className="mt-4 pt-3 border-t border-slate-800/60">{children}</div>}
    </div>
  );
};
