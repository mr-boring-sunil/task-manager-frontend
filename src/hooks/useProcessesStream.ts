import { useState, useEffect, useCallback } from 'react';
import { Process, ProcessPagination } from '../types/process';
import { StreamConnectionState } from '../types/stream';
import { streamManager } from '../services/streamService';

interface UseProcessesStreamOptions {
  enabled?: boolean;
  intervalMs?: number;
}

export function useProcessesStream(options: UseProcessesStreamOptions = {}) {
  const { enabled = true, intervalMs = 1000 } = options;
  const [processes, setProcesses] = useState<Process[]>([]);
  const [pagination, setPagination] = useState<ProcessPagination | null>(null);
  const [streamState, setStreamState] = useState<StreamConnectionState>('disconnected');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStreamState('disconnected');
      return;
    }

    const subId = `proc-stream-${Math.random().toString(36).substring(2, 9)}`;

    const unsubscribe = streamManager.subscribe<{
      processes: Process[];
      pagination: ProcessPagination;
    }>(
      'processes',
      {
        id: subId,
        onData: (data) => {
          if (data && Array.isArray(data.processes)) {
            setProcesses(data.processes);
            if (data.pagination) {
              setPagination(data.pagination);
            }
            setLastUpdated(new Date());
            setError(null);
          }
        },
        onStateChange: (state) => {
          setStreamState(state);
        },
        onError: (err) => {
          setError(err?.message || 'SSE Process stream error');
        },
      },
      intervalMs
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, intervalMs]);

  const reset = useCallback(() => {
    setProcesses([]);
    setPagination(null);
    setError(null);
  }, []);

  return {
    processes,
    pagination,
    streamState,
    lastUpdated,
    error,
    reset,
    isConnected: streamState === 'connected',
  };
}
