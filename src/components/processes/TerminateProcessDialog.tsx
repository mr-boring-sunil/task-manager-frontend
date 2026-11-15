import React, { useState } from 'react';
import { AlertOctagon, X, AlertTriangle } from 'lucide-react';
import { Process, SignalType } from '../../types/process';

interface TerminateProcessDialogProps {
  isOpen: boolean;
  process: Process | null;
  isLoading?: boolean;
  onConfirm: (signal: SignalType) => Promise<void>;
  onClose: () => void;
}

export const TerminateProcessDialog: React.FC<TerminateProcessDialogProps> = ({
  isOpen,
  process,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [signal, setSignal] = useState<SignalType>('SIGTERM');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !process) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm(signal);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Termination failed.');
    }
  };

  const isProtectedCandidate =
    process.pid === 0 ||
    process.pid === 1 ||
    ['init', 'systemd', 'sshd', 'node'].includes(process.name.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Terminate Process</h2>
            <p className="text-xs text-slate-400">
              Confirm POSIX termination signal for target process
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold">Action Prevented</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isProtectedCandidate && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">System-Critical Process Detected</p>
              <p className="mt-0.5 text-amber-200/80">
                This process appears to be a core operating system daemon or backend engine. The backend security policy will reject termination if it is protected.
              </p>
            </div>
          </div>
        )}

        {/* Process Meta Box */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 text-xs font-mono mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Process Name:</span>
            <span className="font-semibold text-slate-200">{process.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Process ID (PID):</span>
            <span className="text-rose-400 font-bold">{process.pid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Owner User:</span>
            <span className="text-slate-200">{process.username}</span>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 block mb-1">Full Command:</span>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 break-all select-all max-h-24 overflow-y-auto">
              {process.command || process.name}
            </div>
          </div>
        </div>

        {/* Signal Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select POSIX Signal:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'SIGTERM' as SignalType,
                title: 'SIGTERM (15)',
                desc: 'Graceful termination request',
              },
              {
                id: 'SIGKILL' as SignalType,
                title: 'SIGKILL (9)',
                desc: 'Immediate unconditional kill',
              },
              {
                id: 'SIGINT' as SignalType,
                title: 'SIGINT (2)',
                desc: 'Terminal interrupt (Ctrl+C)',
              },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSignal(s.id)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  signal === s.id
                    ? 'border-rose-500 bg-rose-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-mono font-semibold">{s.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
          <strong>Warning:</strong> Terminating this process may cause unsaved data loss, broken network sessions, or dependent service interruption.
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            Terminate Process
          </button>
        </div>
      </div>
    </div>
  );
};
