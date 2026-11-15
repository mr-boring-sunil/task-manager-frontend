import { useState, useEffect, useCallback } from 'react';
import { ProcessDetails, SignalType } from '../types/process';
import { processService } from '../services/processService';

export function useProcessDetails(pid: number | null) {
  const [process, setProcess] = useState<ProcessDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (pid === null || isNaN(pid)) {
      setProcess(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await processService.getProcess(pid);
      setProcess(data);
    } catch (err: any) {
      setError(err.message || `Failed to fetch details for process PID ${pid}`);
    } finally {
      setIsLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const pause = async () => {
    if (!pid) return;
    setActionLoading('pause');
    try {
      await processService.pauseProcess(pid);
      await fetchDetails();
    } finally {
      setActionLoading(null);
    }
  };

  const resume = async () => {
    if (!pid) return;
    setActionLoading('resume');
    try {
      await processService.resumeProcess(pid);
      await fetchDetails();
    } finally {
      setActionLoading(null);
    }
  };

  const changePriority = async (newPriority: number) => {
    if (!pid) return;
    setActionLoading('priority');
    try {
      await processService.changePriority(pid, newPriority);
      await fetchDetails();
    } finally {
      setActionLoading(null);
    }
  };

  const terminate = async (signal: SignalType = 'SIGTERM') => {
    if (!pid) return;
    setActionLoading('terminate');
    try {
      const result = await processService.terminateProcess(pid, signal);
      return result;
    } finally {
      setActionLoading(null);
    }
  };

  return {
    process,
    isLoading,
    error,
    actionLoading,
    refresh: fetchDetails,
    pause,
    resume,
    changePriority,
    terminate,
  };
}
