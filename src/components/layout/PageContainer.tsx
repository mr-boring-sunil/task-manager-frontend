import React from 'react';
import { useMetrics } from '../../context/MetricsContext';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  const { alerts, dismissAlert } = useMetrics();

  return (
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Alert Banners */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isDanger = alert.level === 'danger';
            const isWarning = alert.level === 'warning';

            const borderClass = isDanger
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : isWarning
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              : 'border-sky-500/30 bg-sky-500/10 text-sky-300';

            const Icon = isDanger ? AlertCircle : isWarning ? AlertTriangle : Info;

            return (
              <div
                key={alert.id}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border ${borderClass} transition-all`}
                role="alert"
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold">{alert.title}: </span>
                    <span className="text-slate-300">{alert.message}</span>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Page Header (if title/actions provided) */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            {title && <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
};
