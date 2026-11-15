import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcessRow } from '../../components/processes/ProcessRow';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProcessInspector } from '../../components/processes/ProcessInspector';
import { ChangePriorityDialog } from '../../components/processes/ChangePriorityDialog';
import { TerminateProcessDialog } from '../../components/processes/TerminateProcessDialog';
import { Process, ProcessDetails } from '../../types/process';

const mockProcess: Process = {
  pid: 1234,
  ppid: 1,
  name: 'python3',
  command: 'python3 -m http.server 8080',
  username: 'pi',
  cpu: 15.4,
  memory: 4.2,
  memoryUsage: 45000000,
  state: 'running',
  startTime: '2026-11-01T12:00:00.000Z',
  priority: 0,
};

const mockProcessDetails: ProcessDetails = {
  ...mockProcess,
  threads: 4,
  fdSize: 64,
  vmSize: '124000 kB',
  vmRss: '43940 kB',
};

describe('Process Management Components', () => {
  describe('StatusBadge', () => {
    it('renders accessible label and state for running', () => {
      render(<StatusBadge state="running" />);
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByLabelText('Process state: Running')).toBeInTheDocument();
    });

    it('renders accessible label for stopped', () => {
      render(<StatusBadge state="stopped" />);
      expect(screen.getByText('Stopped')).toBeInTheDocument();
    });
  });

  describe('ProcessRow', () => {
    it('renders PID, name, user, CPU%, memory%, and triggers onSelect', () => {
      const onSelect = vi.fn();
      render(
        <table>
          <tbody>
            <ProcessRow
              process={mockProcess}
              onSelect={onSelect}
              onPause={vi.fn()}
              onResume={vi.fn()}
              onChangePriority={vi.fn()}
              onTerminate={vi.fn()}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('python3')).toBeInTheDocument();
      expect(screen.getByText('pi')).toBeInTheDocument();
      expect(screen.getByText('15.4%')).toBeInTheDocument();

      fireEvent.click(screen.getByText('python3'));
      expect(onSelect).toHaveBeenCalledWith(mockProcess);
    });
  });

  describe('ProcessInspector', () => {
    it('renders all inspection sections: identity, CPU, memory, structure, command', () => {
      render(
        <ProcessInspector
          process={mockProcessDetails}
          isLoading={false}
          error={null}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onChangePriority={vi.fn()}
          onTerminate={vi.fn()}
        />
      );

      // Identity
      expect(screen.getByText('Process Identity')).toBeInTheDocument();
      expect(screen.getByText('PID: 1234 • Owner: pi')).toBeInTheDocument();

      // CPU
      expect(screen.getByText('CPU Telemetry')).toBeInTheDocument();

      // Memory
      expect(screen.getByText('Memory Allocation')).toBeInTheDocument();
      expect(screen.getByText('124000 kB')).toBeInTheDocument();

      // Structure
      expect(screen.getByText('Active Threads')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('64 slots')).toBeInTheDocument();

      // Scope note
      expect(screen.getByText('Hardware & OS Telemetry Scope')).toBeInTheDocument();
    });
  });

  describe('ChangePriorityDialog', () => {
    it('displays range -20 to 19 and warns about CAP_SYS_NICE for negative values', () => {
      render(
        <ChangePriorityDialog
          isOpen={true}
          process={mockProcess}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Adjust Nice Priority')).toBeInTheDocument();
      expect(screen.getByText('-20 (Highest)')).toBeInTheDocument();
      expect(screen.getByText('19 (Lowest)')).toBeInTheDocument();
    });
  });

  describe('TerminateProcessDialog', () => {
    it('provides SIGTERM, SIGKILL, SIGINT options and confirms termination', () => {
      render(
        <TerminateProcessDialog
          isOpen={true}
          process={mockProcess}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: 'Terminate Process' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Terminate Process' })).toBeInTheDocument();
      expect(screen.getByText('SIGTERM (15)')).toBeInTheDocument();
      expect(screen.getByText('SIGKILL (9)')).toBeInTheDocument();
      expect(screen.getByText('SIGINT (2)')).toBeInTheDocument();
    });
  });
});
