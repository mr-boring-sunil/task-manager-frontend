import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Process, ProcessPagination, SignalType } from '../../types/process';
import { ProcessRow } from './ProcessRow';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

interface ProcessTableProps {
  processes: Process[];
  pagination: ProcessPagination | null;
  selectedPid: number | null;
  onSelectProcess: (process: Process) => void;
  onPageChange: (newPage: number) => void;
  sortBy?: string;
  order?: 'asc' | 'desc';
  onSortChange?: (field: any) => void;
  onPause: (pid: number) => void;
  onResume: (pid: number) => void;
  onChangePriority: (process: Process) => void;
  onTerminate: (process: Process, signal: SignalType) => void;
  isLoading?: boolean;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  pagination,
  selectedPid,
  onSelectProcess,
  onPageChange,
  sortBy = 'cpu',
  order = 'desc',
  onSortChange,
  onPause,
  onResume,
  onChangePriority,
  onTerminate,
  isLoading = false,
}) => {
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-rose-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-rose-400" />
    );
  };

  const handleHeaderClick = (field: string) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  return (
    <div className="card-base overflow-hidden flex flex-col">
      {/* Table Container with horizontal scrolling */}
      <div className="overflow-x-auto min-h-[320px]">
        {isLoading && processes.length === 0 ? (
          <LoadingState message="Fetching process table..." />
        ) : processes.length === 0 ? (
          <EmptyState
            title="No Processes Found"
            description="No processes matched your current search and filter criteria."
          />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                <th
                  onClick={() => handleHeaderClick('pid')}
                  className="table-header-cell cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PID</span>
                    {renderSortIcon('pid')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('name')}
                  className="table-header-cell cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Process Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('username')}
                  className="table-header-cell cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User</span>
                    {renderSortIcon('username')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('cpu')}
                  className="table-header-cell text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CPU %</span>
                    {renderSortIcon('cpu')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('memory')}
                  className="table-header-cell text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>RAM %</span>
                    {renderSortIcon('memory')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('memoryUsage')}
                  className="table-header-cell text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Resident</span>
                    {renderSortIcon('memoryUsage')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('state')}
                  className="table-header-cell cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>State</span>
                    {renderSortIcon('state')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('priority')}
                  className="table-header-cell text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Nice</span>
                    {renderSortIcon('priority')}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderClick('startTime')}
                  className="table-header-cell cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Started</span>
                    {renderSortIcon('startTime')}
                  </div>
                </th>
                <th className="table-header-cell">
                  <span>Command</span>
                </th>
                <th className="table-header-cell text-right pr-4">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {processes.map((proc) => (
                <ProcessRow
                  key={proc.pid}
                  process={proc}
                  isSelected={proc.pid === selectedPid}
                  onSelect={onSelectProcess}
                  onPause={onPause}
                  onResume={onResume}
                  onChangePriority={onChangePriority}
                  onTerminate={onTerminate}
                  isLoading={isLoading}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Server-Side Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-400">
          <div>
            <span>
              Showing{' '}
              <strong className="text-slate-200">
                {(pagination.page - 1) * pagination.limit + (processes.length > 0 ? 1 : 0)}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-200">
                {(pagination.page - 1) * pagination.limit + processes.length}
              </strong>{' '}
              of <strong className="text-slate-200">{pagination.total}</strong> processes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-850 transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page <span className="text-slate-200 font-bold">{pagination.page}</span> of{' '}
              <span className="text-slate-200">{pagination.totalPages}</span>
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-850 transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
