import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { ProcessToolbar } from '../components/processes/ProcessToolbar';
import { ProcessTable } from '../components/processes/ProcessTable';
import { ProcessInspector } from '../components/processes/ProcessInspector';
import { CreateProcessDialog } from '../components/processes/CreateProcessDialog';
import { ChangePriorityDialog } from '../components/processes/ChangePriorityDialog';
import { TerminateProcessDialog } from '../components/processes/TerminateProcessDialog';
import { processService } from '../services/processService';
import { useProcessDetails } from '../hooks/useProcessDetails';
import { useProcessesStream } from '../hooks/useProcessesStream';
import { Process, ProcessPagination, ProcessListQuery, SignalType } from '../../src/types/process';

export const ProcessesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameters state
  const [query, setQuery] = useState<ProcessListQuery>(() => {
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
      search: searchParams.get('search') || undefined,
      state: searchParams.get('state') || undefined,
      username: searchParams.get('username') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'cpu',
      order: (searchParams.get('order') as any) || 'desc',
    };
  });

  const [processes, setProcesses] = useState<Process[]>([]);
  const [pagination, setPagination] = useState<ProcessPagination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(false);

  // Inspector & Modal States
  const [inspectPid, setInspectPid] = useState<number | null>(() => {
    const pid = searchParams.get('inspect');
    return pid ? parseInt(pid, 10) : null;
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [priorityProcess, setPriorityProcess] = useState<Process | null>(null);
  const [terminateProcess, setTerminateProcess] = useState<Process | null>(null);

  const {
    process: inspectedProcess,
    isLoading: isInspectLoading,
    error: inspectError,
    refresh: refreshInspector,
    pause: pauseProcess,
    resume: resumeProcess,
    actionLoading,
  } = useProcessDetails(inspectPid);

  // Live SSE stream (used when live stream is toggled on)
  const { processes: sseProcesses, pagination: ssePagination } = useProcessesStream({
    enabled: isLiveStreamActive && !query.search && !query.state && !query.username && query.page === 1,
  });

  // Fetch processes via REST
  const fetchProcesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await processService.listProcesses(query);
      setProcesses(data.processes);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Sync with searchParams
  useEffect(() => {
    const params: Record<string, string> = {};
    if (query.page && query.page > 1) params.page = String(query.page);
    if (query.limit && query.limit !== 50) params.limit = String(query.limit);
    if (query.search) params.search = query.search;
    if (query.state) params.state = query.state;
    if (query.username) params.username = query.username;
    if (query.sortBy && query.sortBy !== 'cpu') params.sortBy = query.sortBy;
    if (query.order && query.order !== 'desc') params.order = query.order;
    if (inspectPid) params.inspect = String(inspectPid);

    setSearchParams(params, { replace: true });
  }, [query, inspectPid, setSearchParams]);

  // Initial and query-driven fetch
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // If live stream provides data and we are on page 1 without custom filters, update
  useEffect(() => {
    if (isLiveStreamActive && sseProcesses.length > 0 && query.page === 1 && !query.search) {
      setProcesses(sseProcesses);
      if (ssePagination) {
        setPagination(ssePagination);
      }
    }
  }, [isLiveStreamActive, sseProcesses, ssePagination, query.page, query.search]);

  const handleQueryChange = (updated: Partial<ProcessListQuery>) => {
    setQuery((prev) => ({ ...prev, ...updated }));
  };

  const handlePageChange = (newPage: number) => {
    handleQueryChange({ page: newPage });
  };

  const handleSortChange = (field: any) => {
    if (query.sortBy === field) {
      handleQueryChange({ order: query.order === 'asc' ? 'desc' : 'asc' });
    } else {
      handleQueryChange({ sortBy: field, order: 'desc', page: 1 });
    }
  };

  // Derive unique users list from loaded processes
  const availableUsers = useMemo(() => {
    const set = new Set<string>(['pi', 'root']);
    processes.forEach((p) => {
      if (p.username) set.add(p.username);
    });
    return Array.from(set);
  }, [processes]);

  // Process Actions Handlers
  const handlePause = async (pid: number) => {
    try {
      await processService.pauseProcess(pid);
      fetchProcesses();
      if (inspectPid === pid) refreshInspector();
    } catch (err: any) {
      alert(err.message || 'Pause failed');
    }
  };

  const handleResume = async (pid: number) => {
    try {
      await processService.resumeProcess(pid);
      fetchProcesses();
      if (inspectPid === pid) refreshInspector();
    } catch (err: any) {
      alert(err.message || 'Resume failed');
    }
  };

  return (
    <PageContainer
      title="Linux Process Manager"
      subtitle="Inspect, filter, schedule, and safely control host processes"
    >
      {/* Toolbar: Search, Filters, Live Stream, Create */}
      <ProcessToolbar
        query={query}
        onQueryChange={handleQueryChange}
        onRefresh={fetchProcesses}
        onCreateProcess={() => setIsCreateOpen(true)}
        isLoading={isLoading}
        availableUsers={availableUsers}
        isLiveStreamActive={isLiveStreamActive}
        onToggleLiveStream={() => setIsLiveStreamActive((prev) => !prev)}
      />

      {/* Main Process Table */}
      <ProcessTable
        processes={processes}
        pagination={pagination}
        selectedPid={inspectPid}
        onSelectProcess={(proc) => setInspectPid(proc.pid)}
        onPageChange={handlePageChange}
        sortBy={query.sortBy}
        order={query.order}
        onSortChange={handleSortChange}
        onPause={handlePause}
        onResume={handleResume}
        onChangePriority={(proc) => setPriorityProcess(proc)}
        onTerminate={(proc) => setTerminateProcess(proc)}
        isLoading={isLoading}
      />

      {/* Process Inspector Drawer */}
      {inspectPid !== null && (
        <ProcessInspector
          process={inspectedProcess}
          isLoading={isInspectLoading}
          error={inspectError}
          onClose={() => setInspectPid(null)}
          onRefresh={refreshInspector}
          onPause={async () => {
            await pauseProcess();
            fetchProcesses();
          }}
          onResume={async () => {
            await resumeProcess();
            fetchProcesses();
          }}
          onChangePriority={(proc) => setPriorityProcess(proc)}
          onTerminate={(proc) => setTerminateProcess(proc)}
          actionLoading={actionLoading}
        />
      )}

      {/* Create Process Modal */}
      <CreateProcessDialog
        isOpen={isCreateOpen}
        onSuccess={() => {
          fetchProcesses();
        }}
        onInspectProcess={(newPid) => {
          setInspectPid(newPid);
        }}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Change Priority Modal */}
      <ChangePriorityDialog
        isOpen={priorityProcess !== null}
        process={priorityProcess}
        onConfirm={async (newPriority) => {
          if (priorityProcess) {
            await processService.changePriority(priorityProcess.pid, newPriority);
            fetchProcesses();
            if (inspectPid === priorityProcess.pid) refreshInspector();
          }
        }}
        onClose={() => setPriorityProcess(null)}
      />

      {/* Terminate Process Modal */}
      <TerminateProcessDialog
        isOpen={terminateProcess !== null}
        process={terminateProcess}
        onConfirm={async (signal: SignalType) => {
          if (terminateProcess) {
            await processService.terminateProcess(terminateProcess.pid, signal);
            fetchProcesses();
            if (inspectPid === terminateProcess.pid) setInspectPid(null);
          }
        }}
        onClose={() => setTerminateProcess(null)}
      />
    </PageContainer>
  );
};
