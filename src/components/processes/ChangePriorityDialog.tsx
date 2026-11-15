import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertCircle, X } from 'lucide-react';
import { Process } from '../../types/process';

interface ChangePriorityDialogProps {
  isOpen: boolean;
  process: Process | null;
  isLoading?: boolean;
  onConfirm: (priority: number) => Promise<void>;
  onClose: () => void;
}

export const ChangePriorityDialog: React.FC<ChangePriorityDialogProps> = ({
  isOpen,
  process,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [priority, setPriority] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process) {
      setPriority(process.priority !== null ? process.priority : 0);
      setError(null);
    }
  }, [process]);

  if (!isOpen || !process) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priority < -20 || priority > 19) {
      setError('Nice value must be between -20 and 19.');
      return;
    }
    setError(null);
    try {
      await onConfirm(priority);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update process nice priority.');
    }
  };

  const getPriorityLabel = (val: number) => {
    if (val === -20) return 'Highest Scheduling Priority';
    if (val < 0) return 'High Priority (Favorable Scheduling)';
    if (val === 0) return 'Default Standard Priority';
    if (val === 19) return 'Lowest Scheduling Priority (Idle)';
    return 'Low Priority (Background)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Adjust Nice Priority</h2>
            <p className="text-xs text-slate-400 font-mono">
              PID {process.pid}: {process.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400">Current Priority:</span>
              <span className="font-mono text-slate-200">
                {process.priority !== null ? process.priority : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-slate-400">Target Priority:</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">
                {priority} ({getPriorityLabel(priority)})
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="-20"
              max="19"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              disabled={isLoading}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>-20 (Highest)</span>
              <span>0 (Default)</span>
              <span>19 (Lowest)</span>
            </div>
          </div>

          {/* Linux Capability Warning */}
          {priority < 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300/90 text-xs leading-relaxed">
              <p className="font-medium mb-0.5">Linux Privilege Requirement</p>
              <p className="text-[11px] text-amber-200/80">
                Setting a negative nice priority requires Linux <code className="font-mono bg-amber-950/40 px-1 py-0.5 rounded">CAP_SYS_NICE</code>. If the backend process lacks root permissions, this call will fail.
              </p>
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <strong>How Nice Values Work:</strong> Linux process scheduler uses nice values to calculate dynamic timeslices. A higher nice value makes the process &quot;nicer&quot; to other processes by yielding CPU time.
          </div>

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
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
              Apply Nice Priority
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
