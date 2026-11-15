/**
 * Linux Process Models & Interfaces
 * Matches backend Scheduling Engine and CEE definitions
 */

export type ProcessState =
  | 'running'
  | 'sleeping'
  | 'stopped'
  | 'zombie'
  | 'idle'
  | 'unknown';

export type SignalType = 'SIGTERM' | 'SIGKILL' | 'SIGINT' | 'SIGSTOP' | 'SIGCONT';

export interface Process {
  pid: number;
  ppid: number;
  name: string;
  command: string;
  username: string;
  cpu: number;
  memory: number;
  memoryUsage: number; // In bytes
  state: ProcessState | string;
  startTime: string | null;
  priority: number | null; // Nice value (-20 to 19)
}

export interface ProcessDetails extends Process {
  threads?: number;
  fdSize?: number;
  vmSize?: string;
  vmRss?: string;
}

export interface ProcessPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProcessListResponseData {
  processes: Process[];
  pagination: ProcessPagination;
}

export interface ProcessListQuery {
  page?: number;
  limit?: number;
  username?: string;
  state?: string;
  search?: string;
  sortBy?: 'pid' | 'ppid' | 'name' | 'command' | 'username' | 'cpu' | 'memory' | 'memoryUsage' | 'state' | 'startTime';
  order?: 'asc' | 'desc';
}

export interface CreateProcessPayload {
  command: string;
  arguments?: string[];
  workingDirectory?: string;
  env?: Record<string, string>;
}

export interface SpawnedProcessResult {
  pid: number;
  name: string;
  command: string;
  status: string;
  startTime: string;
}

export interface TerminateProcessResult {
  pid: number;
  terminated: boolean;
  signal: string;
  escalated: boolean;
}

export interface PriorityChangeResult {
  pid: number;
  priority: number;
}

export interface ProcessStateChangeResult {
  pid: number;
  state: string;
  signal: string;
}
