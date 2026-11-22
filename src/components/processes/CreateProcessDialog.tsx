import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { processService } from '../../services/processService';
import { SpawnedProcessResult } from '../../types/process';

interface CreateProcessDialogProps {
  isOpen: boolean;
  onSuccess: (result: SpawnedProcessResult) => void;
  onClose: () => void;
  onInspectProcess?: (pid: number) => void;
}

const ALLOWED_SUGGESTIONS = [
  'python3',
  'node',
  'bash',
  'sh',
  'ping',
  'sleep',
  'uptime',
  'ls',
  'echo',
  'top',
  'vcgencmd',
  'raspistill',
];

export const CreateProcessDialog: React.FC<CreateProcessDialogProps> = ({
  isOpen,
  onSuccess,
  onClose,
  onInspectProcess,
}) => {
  const [command, setCommand] = useState<string>('python3');
  const [args, setArgs] = useState<string[]>([]);
  const [newArg, setNewArg] = useState<string>('');
  // BUG FIX: Default workingDir to '' (empty) so it is omitted from the payload.
  // The previous default of '/home/pi' caused a ValidationError on non-Raspberry Pi
  // hosts because validateCwd() calls fs.existsSync() and throws when the path is absent.
  const [workingDir, setWorkingDir] = useState<string>('');
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>([]);
  const [envKey, setEnvKey] = useState<string>('');
  const [envVal, setEnvVal] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spawnedResult, setSpawnedResult] = useState<SpawnedProcessResult | null>(null);

  // BUG FIX: Reset ALL form state whenever the dialog transitions from closed → open.
  // Previously only spawnedResult and error were cleared in handleResetAndClose, but
  // the component stays mounted (guarded by `if (!isOpen) return null`), so command,
  // args, workingDir, envPairs etc. persisted across openings.
  useEffect(() => {
    if (isOpen) {
      setCommand('python3');
      setArgs([]);
      setNewArg('');
      setWorkingDir('');
      setEnvPairs([]);
      setEnvKey('');
      setEnvVal('');
      setError(null);
      setSpawnedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddArg = () => {
    if (newArg.trim()) {
      setArgs((prev) => [...prev, newArg.trim()]);
      setNewArg('');
    }
  };

  const handleRemoveArg = (index: number) => {
    setArgs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEnv = () => {
    if (envKey.trim() && envVal.trim()) {
      setEnvPairs((prev) => [...prev, { key: envKey.trim(), value: envVal.trim() }]);
      setEnvKey('');
      setEnvVal('');
    }
  };

  const handleRemoveEnv = (index: number) => {
    setEnvPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) {
      setError('Executable command is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Convert env pairs to object
    const envObj: Record<string, string> = {};
    envPairs.forEach((p) => {
      if (p.key) envObj[p.key] = p.value;
    });

    try {
      const result = await processService.createProcess({
        command: command.trim(),
        arguments: args.length > 0 ? args : undefined,
        workingDirectory: workingDir.trim() ? workingDir.trim() : undefined,
        env: Object.keys(envObj).length > 0 ? envObj : undefined,
      });

      setSpawnedResult(result);
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to spawn process.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSpawnedResult(null);
    setError(null);
    setCommand('python3');
    setArgs([]);
    setWorkingDir('');
    setEnvPairs([]);
    setEnvKey('');
    setEnvVal('');
    setNewArg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={handleResetAndClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Spawn Permitted Process</h2>
            <p className="text-xs text-slate-400">
              Launch an executable governed by backend allowlist &amp; security policies
            </p>
          </div>
        </div>

        {/* Success View */}
        {spawnedResult ? (
          <div className="space-y-4 py-4 my-auto">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">Process Launched Successfully</h3>
                <p className="text-xs text-emerald-300/90 mt-1">
                  The process has been spawned by the Scheduling Engine.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">PID:</span>
                <span className="text-rose-400 font-bold">{spawnedResult.pid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Executable Name:</span>
                <span className="text-slate-200">{spawnedResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial State:</span>
                <span className="text-emerald-400 capitalize">{spawnedResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Command:</span>
                <span className="text-slate-300 truncate max-w-xs">{spawnedResult.command}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
              {onInspectProcess && (
                <button
                  type="button"
                  onClick={() => {
                    const pid = spawnedResult.pid;
                    handleResetAndClose();
                    onInspectProcess(pid);
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-sm"
                >
                  Inspect Process
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Command field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Executable Command <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. python3"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {/* Allowlist Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500">Allowlist shortcuts:</span>
                {ALLOWED_SUGGESTIONS.slice(0, 7).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCommand(s)}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700/60 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Arguments List */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Arguments List (Passed safely as array items)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newArg}
                  onChange={(e) => setNewArg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddArg();
                    }
                  }}
                  placeholder="e.g. -m or http.server"
                  disabled={isLoading}
                  className="flex-1 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddArg}
                  disabled={!newArg.trim() || isLoading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1 border border-slate-700 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Argument tags */}
              {args.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-850 rounded-xl border border-slate-800">
                  {args.map((a, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/80"
                    >
                      <span className="text-slate-500 select-none">[{idx}]</span> {a}
                      <button
                        type="button"
                        onClick={() => handleRemoveArg(idx)}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                        aria-label="Remove argument"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Working Directory */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Working Directory (Optional)
              </label>
              <input
                type="text"
                value={workingDir}
                onChange={(e) => setWorkingDir(e.target.value)}
                placeholder="/home/pi or /tmp"
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Must be an allowed directory (e.g. /home/pi, /tmp, /opt/task-manager)
              </p>
            </div>

            {/* Environment Variables */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Environment Variables (Optional key-value pairs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={envKey}
                  onChange={(e) => setEnvKey(e.target.value)}
                  placeholder="KEY (e.g. PORT)"
                  disabled={isLoading}
                  className="w-1/3 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  value={envVal}
                  onChange={(e) => setEnvVal(e.target.value)}
                  placeholder="VALUE (e.g. 8080)"
                  disabled={isLoading}
                  className="flex-1 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddEnv}
                  disabled={!envKey.trim() || !envVal.trim() || isLoading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1 border border-slate-700 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {envPairs.length > 0 && (
                <div className="space-y-1 p-2 bg-slate-850 rounded-xl border border-slate-800">
                  {envPairs.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-2 py-1 bg-slate-850 rounded"
                    >
                      <span>
                        <span className="text-rose-400 font-semibold">{p.key}</span>=
                        <span className="text-slate-300">{p.value}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEnv(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                )}
                Launch Process
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
