import { apiClient } from './apiClient';
import {
  ProcessListQuery,
  ProcessListResponseData,
  ProcessDetails,
  CreateProcessPayload,
  SpawnedProcessResult,
  TerminateProcessResult,
  ProcessStateChangeResult,
  PriorityChangeResult,
  SignalType,
} from '../types/process';

export const processService = {
  /**
   * Fetch paginated and filterable list of running processes
   */
  async listProcesses(query: ProcessListQuery = {}): Promise<ProcessListResponseData> {
    const res = await apiClient.get<ProcessListResponseData>('/api/v1/processes', query);
    return res.data;
  },

  /**
   * Fetch full details for a single process
   */
  async getProcess(pid: number): Promise<ProcessDetails> {
    const res = await apiClient.get<ProcessDetails>(`/api/v1/processes/${pid}`);
    return res.data;
  },

  /**
   * Spawn a new process from allowlist
   */
  async createProcess(payload: CreateProcessPayload): Promise<SpawnedProcessResult> {
    const res = await apiClient.post<SpawnedProcessResult>('/api/v1/processes', payload);
    return res.data;
  },

  /**
   * Terminate a process with signal (SIGTERM, SIGKILL, SIGINT)
   */
  async terminateProcess(pid: number, signal: SignalType = 'SIGTERM'): Promise<TerminateProcessResult> {
    const res = await apiClient.delete<TerminateProcessResult>(`/api/v1/processes/${pid}`, { signal });
    return res.data;
  },

  /**
   * Pause a process (SIGSTOP)
   */
  async pauseProcess(pid: number): Promise<ProcessStateChangeResult> {
    const res = await apiClient.post<ProcessStateChangeResult>(`/api/v1/processes/${pid}/pause`);
    return res.data;
  },

  /**
   * Resume a paused process (SIGCONT)
   */
  async resumeProcess(pid: number): Promise<ProcessStateChangeResult> {
    const res = await apiClient.post<ProcessStateChangeResult>(`/api/v1/processes/${pid}/resume`);
    return res.data;
  },

  /**
   * Change process priority (nice value from -20 to 19)
   */
  async changePriority(pid: number, priority: number): Promise<PriorityChangeResult> {
    const res = await apiClient.patch<PriorityChangeResult>(`/api/v1/processes/${pid}/priority`, { priority });
    return res.data;
  },
};
