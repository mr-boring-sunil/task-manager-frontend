import React from 'react';
import { Process, SignalType } from '../../types/process';
import { StatusBadge } from '../common/StatusBadge';
import { ProcessActions } from './ProcessActions';
import { formatBytes } from '../../utils/formatBytes';
import { formatPercentage } from '../../utils/formatPercentage';
import { formatDate } from '../../utils/formatDate';

interface ProcessRowProps {
  process: Process;
  isSelected?: boolean;
  onSelect: (process: Process) => void;
  onPause: (pid: number) => void;
  onResume: (pid: number) => void;
  onChangePriority: (process: Process) => void;
  onTerminate: (process: Process, signal: SignalType) => void;
  isLoading?: boolean;
}

export const ProcessRow: React.FC<ProcessRowProps> = ({
  process,
  isSelected = false,
  onSelect,
  onPause,
  onResume,
  onChangePriority,
  onTerminate,
  isLoading = false,
}) => {
  return (
    <tr
      onClick={() => onSelect(process)}
      className={`group border-b border-slate-800/80 transition-colors cursor-pointer select-none ${
        isSelected
          ? 'bg-rose-500/10 hover:bg-rose-500/15'
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* PID */}
      <td className="table-body-cell font-mono text-xs font-semibold text-rose-400">
        {process.pid}
      </td>

      {/* Process Name */}
      <td className="table-body-cell">
        <div className="font-medium text-slate-100 flex items-center gap-1.5">
          <span className="truncate max-w-[140px] md:max-w-[200px]" title={process.name}>
            {process.name}
          </span>
        </div>
      </td>

      {/* User */}
      <td className="table-body-cell font-mono text-xs text-slate-300">
        {process.username}
      </td>

      {/* CPU % */}
      <td className="table-body-cell font-mono text-xs font-semibold text-right">
        <span
          className={
            process.cpu > 50
              ? 'text-rose-400'
              : process.cpu > 20
              ? 'text-amber-400'
              : 'text-slate-200'
          }
        >
          {formatPercentage(process.cpu)}
        </span>
      </td>

      {/* Memory % */}
      <td className="table-body-cell font-mono text-xs text-right text-slate-300">
        {formatPercentage(process.memory)}
      </td>

      {/* Resident Memory */}
      <td className="table-body-cell font-mono text-xs text-right text-slate-300">
        {formatBytes(process.memoryUsage)}
      </td>

      {/* State */}
      <td className="table-body-cell">
        <StatusBadge state={process.state} size="sm" />
      </td>

      {/* Priority (Nice) */}
      <td className="table-body-cell font-mono text-xs text-center text-slate-400">
        {process.priority !== null ? (
          <span
            className={`px-1.5 py-0.5 rounded ${
              process.priority < 0
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300'
            }`}
          >
            {process.priority}
          </span>
        ) : (
          '—'
        )}
      </td>

      {/* Start Time */}
      <td className="table-body-cell font-mono text-xs text-slate-400">
        {formatDate(process.startTime)}
      </td>

      {/* Command (Truncated, full in title) */}
      <td className="table-body-cell text-xs font-mono text-slate-400 max-w-[180px] lg:max-w-xs truncate" title={process.command}>
        {process.command || process.name}
      </td>

      {/* Actions */}
      <td
        className="table-body-cell text-right pr-4"
        onClick={(e) => e.stopPropagation()} // Prevent row click
      >
        <ProcessActions
          process={process}
          onViewDetails={() => onSelect(process)}
          onPause={onPause}
          onResume={onResume}
          onChangePriority={onChangePriority}
          onTerminate={onTerminate}
          isLoading={isLoading}
        />
      </td>
    </tr>
  );
};
