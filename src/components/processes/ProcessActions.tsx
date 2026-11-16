import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Play, Pause, AlertOctagon, SlidersHorizontal } from 'lucide-react';
import { Process, SignalType } from '../../types/process';
import { useAuth } from '../../context/AuthContext';

interface ProcessActionsProps {
  process: Process;
  onViewDetails: (pid: number) => void;
  onPause: (pid: number) => void;
  onResume: (pid: number) => void;
  onChangePriority: (process: Process) => void;
  onTerminate: (process: Process, signal: SignalType) => void;
  isLoading?: boolean;
}

export const ProcessActions: React.FC<ProcessActionsProps> = ({
  process,
  onViewDetails,
  onPause,
  onResume,
  onChangePriority,
  onTerminate,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = useAuth();

  const canPause = hasPermission('process.pause');
  const canResume = hasPermission('process.resume');
  const canPriority = hasPermission('process.priority');
  const canTerminate = hasPermission('process.terminate');

  const isStopped = process.state.toLowerCase() === 'stopped';
  const isZombie = process.state.toLowerCase() === 'zombie';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
        title="Process actions"
        aria-label="Process actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-40 py-1.5 text-xs font-medium">
          {/* View Details */}
          <button
            onClick={() => {
              setIsOpen(false);
              onViewDetails(process.pid);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 text-left transition"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>View Details</span>
          </button>

          {/* Pause / Resume */}
          {isStopped && canResume && (
            <button
              onClick={() => {
                setIsOpen(false);
                onResume(process.pid);
              }}
              disabled={isZombie}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 text-left transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume Process</span>
            </button>
          )}

          {!isStopped && canPause && (
            <button
              onClick={() => {
                setIsOpen(false);
                onPause(process.pid);
              }}
              disabled={isZombie}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 text-left transition disabled:opacity-40"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause Process</span>
            </button>
          )}

          {/* Change Priority */}
          {canPriority && (
            <button
              onClick={() => {
                setIsOpen(false);
                onChangePriority(process);
              }}
              disabled={isZombie}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 text-left transition disabled:opacity-40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Priority</span>
            </button>
          )}

          {canTerminate && (
            <>
              <div className="my-1 border-t border-slate-800" />
              {/* Terminate */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onTerminate(process, 'SIGTERM');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left transition"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Terminate Process</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
