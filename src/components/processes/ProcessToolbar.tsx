import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Radio, Filter, AlertTriangle } from 'lucide-react';
import { ProcessListQuery } from '../../types/process';
import { useAuth } from '../../context/AuthContext';

interface ProcessToolbarProps {
  query: ProcessListQuery;
  onQueryChange: (query: Partial<ProcessListQuery>) => void;
  onRefresh: () => void;
  onCreateProcess: () => void;
  isLoading?: boolean;
  availableUsers?: string[];
  isLiveStreamActive?: boolean;
  onToggleLiveStream?: () => void;
  unknownCount?: number;
}

export const ProcessToolbar: React.FC<ProcessToolbarProps> = ({
  query,
  onQueryChange,
  onRefresh,
  onCreateProcess,
  isLoading = false,
  availableUsers = ['pi', 'root'],
  isLiveStreamActive = true,
  onToggleLiveStream,
  unknownCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState(query.search || '');

  const { hasPermission } = useAuth();
  const canCreate = hasPermission('process.create');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (query.search || '')) {
        onQueryChange({ search: searchTerm.trim() || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, query.search, onQueryChange]);

  return (
    <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search processes by name, command line, or PID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Action Buttons: Live Stream, Refresh, Create Process */}
        <div className="flex items-center gap-2">
          {onToggleLiveStream && (
            <button
              onClick={onToggleLiveStream}
              className={`px-3 py-2 rounded-xl text-xs font-mono border transition flex items-center gap-1.5 ${
                isLiveStreamActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
              }`}
              title={isLiveStreamActive ? 'Live SSE stream active' : 'Live stream paused'}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveStreamActive ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">
                {isLiveStreamActive ? 'Live Stream' : 'Stream Paused'}
              </span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition disabled:opacity-50"
            title="Refresh process list"
            aria-label="Refresh process list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={onCreateProcess}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Process</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters row: State, Username, Sort Field, Order, Limit */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] uppercase">Filter:</span>
        </div>

        {/* State Filter */}
        <select
          value={query.state || ''}
          onChange={(e) => onQueryChange({ state: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
        >
          <option value="">All States</option>
          <option value="running">Running</option>
          <option value="sleeping">Sleeping</option>
          <option value="stopped">Stopped</option>
          <option value="zombie">Zombie</option>
          <option value="idle">Idle</option>
          <option value="unknown">Unknown</option>
        </select>

        {/* Username Filter */}
        <select
          value={query.username || ''}
          onChange={(e) => onQueryChange({ username: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
        >
          <option value="">All Users</option>
          {availableUsers.map((u) => (
            <option key={u} value={u}>
              User: {u}
            </option>
          ))}
        </select>

        {/* Sort By Field */}
        <select
          value={query.sortBy || 'cpu'}
          onChange={(e) => onQueryChange({ sortBy: e.target.value as any, page: 1 })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500 ml-auto"
        >
          <option value="cpu">Sort: CPU %</option>
          <option value="memory">Sort: Memory %</option>
          <option value="memoryUsage">Sort: Resident RAM</option>
          <option value="pid">Sort: PID</option>
          <option value="name">Sort: Name</option>
          <option value="username">Sort: User</option>
          <option value="state">Sort: State</option>
          <option value="startTime">Sort: Start Time</option>
        </select>

        {/* Order Direction */}
        <select
          value={query.order || 'desc'}
          onChange={(e) => onQueryChange({ order: e.target.value as any, page: 1 })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
        >
          <option value="desc">Desc ↓</option>
          <option value="asc">Asc ↑</option>
        </select>

        {/* Page Limit */}
        <select
          value={query.limit || 50}
          onChange={(e) => onQueryChange({ limit: parseInt(e.target.value, 10), page: 1 })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
        >
          <option value="15">15 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>

      {/* Unknown State Warning Banner */}
      {unknownCount > 0 && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-orange-400 font-mono">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>{unknownCount}</strong> process{unknownCount !== 1 ? 'es' : ''} with{' '}
            <button
              onClick={() => onQueryChange({ state: 'unknown', page: 1 })}
              className="underline underline-offset-2 hover:text-orange-300 transition"
            >
              unknown state
            </button>
            {' '}on this page — kernel reported an unrecognised state code. These may be ephemeral or transitioning.
          </span>
        </div>
      )}
    </div>
  );
};
