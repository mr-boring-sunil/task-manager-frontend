import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Pause,
  Play,
  SlidersHorizontal,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Cpu,
  Database,
  Layers,
  Terminal,
  Info,
} from 'lucide-react';
import { ProcessDetails, SignalType } from '../../types/process';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { formatBytes } from '../../utils/formatBytes';
import { formatPercentage } from '../../utils/formatPercentage';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

interface ProcessInspectorProps {
  process: ProcessDetails | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onPause: (pid: number) => void;
  onResume: (pid: number) => void;
  onChangePriority: (process: ProcessDetails) => void;
  onTerminate: (process: ProcessDetails, signal: SignalType) => void;
  actionLoading?: string | null;
}

export const ProcessInspector: React.FC<ProcessInspectorProps> = ({
  process,
  isLoading,
  error,
  onClose,
  onRefresh,
  onPause,
  onResume,
  onChangePriority,
  onTerminate,
  actionLoading,
}) => {
  const [copied, setCopied] = useState(false);

  if (!process && !isLoading && !error) return null;

  const handleCopyCommand = () => {
    if (process?.command) {
      navigator.clipboard.writeText(process.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { hasPermission } = useAuth();
  const canPause = hasPermission('process.pause');
  const canResume = hasPermission('process.resume');
  const canPriority = hasPermission('process.priority');
  const canTerminate = hasPermission('process.terminate');
  const hasAnyMutation = canPause || canResume || canPriority || canTerminate;

  const isStopped = process?.state.toLowerCase() === 'stopped';
  const isZombie = process?.state.toLowerCase() === 'zombie';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Inspector Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold text-sm">
            {process?.pid || '—'}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span className="truncate max-w-[220px]">{process?.name || 'Process Details'}</span>
              {process?.state && <StatusBadge state={process.state} size="sm" />}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              PID: {process?.pid ?? '—'} • Owner: {process?.username ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh process details"
            aria-label="Refresh process details"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close inspector"
            aria-label="Close inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {isLoading && !process ? (
          <LoadingState message="Inspecting Linux /proc metrics..." />
        ) : error ? (
          <ErrorState
            title="Unable to Inspect Process"
            message={error}
            onRetry={onRefresh}
          />
        ) : process ? (
          <>
            {/* Action Bar / Controls (rendered only if user has mutation permissions) */}
            {hasAnyMutation && (
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  {isStopped && canResume && (
                    <button
                      onClick={() => onResume(process.pid)}
                      disabled={isZombie || !!actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  )}

                  {!isStopped && canPause && (
                    <button
                      onClick={() => onPause(process.pid)}
                      disabled={isZombie || !!actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  {canPriority && (
                    <button
                      onClick={() => onChangePriority(process)}
                      disabled={isZombie || !!actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Nice Priority</span>
                    </button>
                  )}
                </div>

                {canTerminate && (
                  <button
                    onClick={() => onTerminate(process, 'SIGTERM')}
                    disabled={!!actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1.5 ml-auto"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Terminate</span>
                  </button>
                )}
              </div>
            )}

            {/* SECTION A: Process Identity */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Process Identity</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Process Name</span>
                  <span className="text-slate-100 font-semibold">{process.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Owner Username</span>
                  <span className="text-slate-200">{process.username}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Process ID (PID)</span>
                  <span className="text-rose-400 font-bold">{process.pid}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Parent PID (PPID)</span>
                  <span className="text-slate-300">{process.ppid || '1 (init/systemd)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">State</span>
                  <span className="text-slate-200 capitalize">{process.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Start Time</span>
                  <span className="text-slate-200">{formatDate(process.startTime)}</span>
                </div>
              </div>
            </section>

            {/* SECTION B: CPU Information */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                <span>CPU Telemetry</span>
              </h3>
              <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">CPU Load</span>
                  <span className="text-base font-bold text-rose-400">
                    {formatPercentage(process.cpu)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nice Priority</span>
                  <span className="text-base font-bold text-indigo-400">
                    {process.priority !== null ? process.priority : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Execution State</span>
                  <span className="text-slate-200 font-medium capitalize mt-1 block">
                    {process.state}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION C: Memory Information */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Memory Allocation</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">/proc/[pid]/status</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">RAM % Share</span>
                    <span className="text-base font-bold text-sky-400">
                      {formatPercentage(process.memory)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">
                      Resident Set Size (RSS)
                    </span>
                    <span className="text-base font-bold text-slate-100">
                      {formatBytes(process.memoryUsage)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <span>Virtual Memory (VmSize)</span>
                      <span
                        title="VmSize represents the total virtual address space allocated, including shared libraries and mapped memory."
                        className="cursor-help"
                      >
                        <Info className="w-3 h-3 text-slate-500" />
                      </span>
                    </div>
                    <span className="text-slate-300 font-semibold">
                      {process.vmSize || 'Unavailable'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <span>Resident RAM (VmRSS)</span>
                      <span
                        title="VmRSS is the actual portion of physical RAM occupied by this process."
                        className="cursor-help"
                      >
                        <Info className="w-3 h-3 text-slate-500" />
                      </span>
                    </div>
                    <span className="text-slate-300 font-semibold">
                      {process.vmRss || formatBytes(process.memoryUsage)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                  <strong>RSS vs Virtual:</strong> Resident memory (RSS) is the physical RAM actively held by the process. Virtual memory (VmSize) includes reserved addresses and swapped memory and does NOT represent consumed physical RAM.
                </div>
              </div>
            </section>

            {/* SECTION D: Process Structure */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>Process Structure &amp; Descriptors</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Active Threads</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {process.threads !== undefined ? process.threads : 'Not reported'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase">
                    <span>FD Table Size (fdSize)</span>
                    <span
                      title="fdSize is the currently allocated capacity of the file descriptor table, not the exact count of currently opened files."
                      className="cursor-help"
                    >
                      <Info className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {process.fdSize !== undefined ? `${process.fdSize} slots` : 'Not reported'}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION E: Command Information */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Command Line</span>
                </h3>
                <button
                  onClick={handleCopyCommand}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-all select-all leading-relaxed max-h-36 overflow-y-auto">
                {process.command || process.name}
              </div>
            </section>

            {/* SECTION G: Backend Unsupported Capabilities Notice */}
            <section className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Hardware &amp; OS Telemetry Scope</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The current backend engine provides process status, resource counters, priority control, and POSIX signal execution. Advanced inspection features (individual open file paths, memory map pagination, per-thread CPU counters, and cgroups) are <em>not exposed by the current backend API</em> and are omitted to avoid displaying fabricated data.
              </p>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};
