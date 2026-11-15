import { ProcessState } from '../types/process';

export interface StateConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const STATE_CONFIGS: Record<string, StateConfig> = {
  running: {
    label: 'Running',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 animate-pulse',
    description: 'Process is executing or ready to execute',
  },
  sleeping: {
    label: 'Sleeping',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400',
    description: 'Waiting for an event or I/O',
  },
  stopped: {
    label: 'Stopped',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    description: 'Paused by signal (SIGSTOP / SIGTSTP)',
  },
  zombie: {
    label: 'Zombie',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
    description: 'Terminated but not reaped by parent process',
  },
  idle: {
    label: 'Idle',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
    description: 'Kernel thread idle or uninterruptible sleep',
  },
  unknown: {
    label: 'Unknown',
    badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    dotClass: 'bg-zinc-400',
    description: 'State could not be determined',
  },
};

export function getProcessStateConfig(state: ProcessState | string | undefined): StateConfig {
  const normalized = (state || 'unknown').toLowerCase();
  return STATE_CONFIGS[normalized] || STATE_CONFIGS.unknown;
}
