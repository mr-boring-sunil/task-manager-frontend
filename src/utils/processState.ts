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
    description: 'Process is executing or ready to execute on the CPU run queue',
  },
  sleeping: {
    label: 'Sleeping',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400',
    description: 'Waiting for an event or I/O (interruptible or uninterruptible sleep)',
  },
  stopped: {
    label: 'Stopped',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    description: 'Paused by signal (SIGSTOP / SIGTSTP). Can be resumed with SIGCONT.',
  },
  zombie: {
    label: 'Zombie',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
    description: 'Process has exited but its exit status has not yet been reaped by the parent',
  },
  idle: {
    label: 'Idle',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
    description: 'Kernel thread idle or in deep uninterruptible sleep (I/X state)',
  },
  unknown: {
    label: 'Unknown',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    dotClass: 'bg-orange-400',
    description:
      'Process state could not be determined — the process may be ephemeral, transitioning, or the kernel reported an unrecognised state code',
  },
};

export function getProcessStateConfig(state: ProcessState | string | undefined): StateConfig {
  const normalized = (state || 'unknown').toLowerCase().trim();
  return STATE_CONFIGS[normalized] ?? STATE_CONFIGS.unknown;
}

/** Returns true if the given state represents an actionable / recognized process state */
export function isKnownState(state: string | undefined): boolean {
  if (!state) return false;
  return state.toLowerCase().trim() in STATE_CONFIGS && state.toLowerCase().trim() !== 'unknown';
}
