import React from 'react';
import { useBackend } from '../../context/BackendContext';
import { useMetrics } from '../../context/MetricsContext';
import { Radio } from 'lucide-react';

export const ConnectionIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isOnline, isCheckingHealth } = useBackend();
  const { streamState } = useMetrics();

  let dotColor = 'bg-rose-500';
  let statusText = 'Disconnected';
  let badgeBorder = 'border-rose-500/30 bg-rose-500/10 text-rose-400';

  if (isCheckingHealth && !isOnline) {
    dotColor = 'bg-amber-500 animate-pulse';
    statusText = 'Checking...';
    badgeBorder = 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  } else if (isOnline) {
    if (streamState === 'connected') {
      dotColor = 'bg-emerald-500 animate-pulse';
      statusText = 'Live Stream';
      badgeBorder = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    } else if (streamState === 'connecting') {
      dotColor = 'bg-sky-500 animate-pulse';
      statusText = 'Connecting SSE';
      badgeBorder = 'border-sky-500/30 bg-sky-500/10 text-sky-400';
    } else {
      dotColor = 'bg-emerald-500';
      statusText = 'Online (REST)';
      badgeBorder = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`Backend Status: ${statusText}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-mono text-slate-300">{statusText}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border ${badgeBorder}`}
      title={`Host Status: ${statusText}`}
    >
      <Radio className="w-3.5 h-3.5" />
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{statusText}</span>
    </div>
  );
};
