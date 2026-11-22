/**
 * CreateProcessDialog — Unit Tests
 *
 * Covers:
 *  1. Bug Fix — Default workingDir must be empty so no invalid path is sent to backend.
 *  2. Bug Fix — Form state resets cleanly every time the dialog re-opens.
 *  3. Bug Fix — onSuccess is called with the SpawnedProcessResult after a successful spawn.
 *  4. Happy path — form renders, user fills fields, submits, success view shown.
 *  5. Error path — service error renders error message, form stays open.
 *  6. Cancel / close — dialog closes without calling onSuccess.
 *  7. Allowlist chips — clicking a chip sets the command field.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CreateProcessDialog } from '../../components/processes/CreateProcessDialog';
import { processService } from '../../services/processService';

// Mock the processService so no real HTTP calls are made
vi.mock('../../services/processService', () => ({
  processService: {
    createProcess: vi.fn(),
  },
}));

const mockSpawnResult = {
  pid: 5678,
  name: 'node',
  command: 'node -v',
  status: 'running',
  startTime: '2026-11-22T14:00:00.000Z',
};

function renderDialog(props: Partial<React.ComponentProps<typeof CreateProcessDialog>> = {}) {
  const defaults = {
    isOpen: true,
    onSuccess: vi.fn(),
    onClose: vi.fn(),
    onInspectProcess: vi.fn(),
  };
  return render(<CreateProcessDialog {...defaults} {...props} />);
}

describe('CreateProcessDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── BUG FIX 1: Default working directory must be empty ───────────────────
  describe('Bug Fix 1: Default workingDirectory must be empty (not /home/pi)', () => {
    it('renders an empty Working Directory input by default', () => {
      renderDialog();
      const cwdInput = screen.getByPlaceholderText('/home/pi or /tmp');
      // ROOT CAUSE: Old default was '/home/pi'. On any non-Raspberry Pi host,
      // validateCwd() calls fs.existsSync('/home/pi') → false → throws
      // ValidationError("Working directory does not exist: /home/pi").
      // Every submit was silently rejected with a 422 error.
      // FIX: Default is now '' so workingDirectory is omitted from the payload.
      expect((cwdInput as HTMLInputElement).value).toBe('');
    });

    it('sends undefined workingDirectory when the field is left empty', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(processService.createProcess).toHaveBeenCalledWith(
          expect.objectContaining({ workingDirectory: undefined })
        );
      });
    });

    it('sends the workingDirectory value when explicitly set by the user', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();
      const cwdInput = screen.getByPlaceholderText('/home/pi or /tmp');
      fireEvent.change(cwdInput, { target: { value: '/tmp' } });

      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(processService.createProcess).toHaveBeenCalledWith(
          expect.objectContaining({ workingDirectory: '/tmp' })
        );
      });
    });
  });

  // ─── BUG FIX 2: Form state resets on every re-open ────────────────────────
  describe('Bug Fix 2: Form state resets on re-open', () => {
    it('resets command input when dialog re-opens after close', () => {
      const { rerender } = renderDialog({ isOpen: true });

      // Modify the command
      const cmdInput = screen.getByPlaceholderText('e.g. python3');
      fireEvent.change(cmdInput, { target: { value: 'bash' } });
      expect((cmdInput as HTMLInputElement).value).toBe('bash');

      // Close the dialog
      rerender(
        <CreateProcessDialog
          isOpen={false}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );

      // Re-open it
      rerender(
        <CreateProcessDialog
          isOpen={true}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );

      // Command should be back to default 'python3'
      const resetInput = screen.getByPlaceholderText('e.g. python3');
      expect((resetInput as HTMLInputElement).value).toBe('python3');
    });

    it('resets error message when dialog re-opens', async () => {
      vi.mocked(processService.createProcess).mockRejectedValue(
        new Error('Command not allowed')
      );

      const { rerender } = renderDialog({ isOpen: true });

      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));
      await screen.findByText('Command not allowed');

      // Close → re-open
      rerender(
        <CreateProcessDialog
          isOpen={false}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );
      rerender(
        <CreateProcessDialog
          isOpen={true}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );

      expect(screen.queryByText('Command not allowed')).not.toBeInTheDocument();
    });

    it('resets success view when dialog re-opens after a successful spawn', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      const { rerender } = renderDialog({ isOpen: true });

      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));
      await screen.findByText('Process Launched Successfully');

      // Close → re-open
      rerender(
        <CreateProcessDialog
          isOpen={false}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );
      rerender(
        <CreateProcessDialog
          isOpen={true}
          onSuccess={vi.fn()}
          onClose={vi.fn()}
          onInspectProcess={vi.fn()}
        />
      );

      // Should show the form again, not the stale success screen
      expect(screen.queryByText('Process Launched Successfully')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /launch process/i })).toBeInTheDocument();
    });
  });

  // ─── BUG FIX 3: onSuccess receives SpawnedProcessResult ───────────────────
  describe('Bug Fix 3: onSuccess is called with the full SpawnedProcessResult', () => {
    it('calls onSuccess with pid, name, command, status after successful spawn', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);
      const onSuccess = vi.fn();

      renderDialog({ onSuccess });
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onSuccess).toHaveBeenCalledWith(mockSpawnResult);
      });
    });
  });

  // ─── Happy path ───────────────────────────────────────────────────────────
  describe('Happy path: successful process creation', () => {
    it('renders the form with Spawn Permitted Process title', () => {
      renderDialog();
      expect(screen.getByText('Spawn Permitted Process')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /launch process/i })).toBeInTheDocument();
    });

    it('defaults the command input to python3', () => {
      renderDialog();
      const cmdInput = screen.getByPlaceholderText('e.g. python3');
      expect((cmdInput as HTMLInputElement).value).toBe('python3');
    });

    it('shows success view with PID and name after a successful API call', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await screen.findByText('Process Launched Successfully');
      expect(screen.getByText('5678')).toBeInTheDocument();
      expect(screen.getByText('node')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
    });

    it('shows Inspect Process button when onInspectProcess prop is provided', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await screen.findByText('Process Launched Successfully');
      expect(screen.getByRole('button', { name: /inspect process/i })).toBeInTheDocument();
    });

    it('calls onInspectProcess with the new PID when Inspect Process is clicked', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);
      const onInspectProcess = vi.fn();
      const onClose = vi.fn();

      renderDialog({ onInspectProcess, onClose });

      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));
      await screen.findByText('Process Launched Successfully');

      fireEvent.click(screen.getByRole('button', { name: /inspect process/i }));

      expect(onInspectProcess).toHaveBeenCalledWith(5678);
      expect(onClose).toHaveBeenCalled();
    });

    it('sends arguments as an array when arguments are added via the Add button', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();

      const argInput = screen.getByPlaceholderText('e.g. -m or http.server');
      fireEvent.change(argInput, { target: { value: '-v' } });

      // There are two "Add" buttons (args section + env section).
      // The args Add button is the FIRST one; pick it by index.
      const addButtons = screen.getAllByRole('button', { name: /^add$/i });
      fireEvent.click(addButtons[0]);

      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(processService.createProcess).toHaveBeenCalledWith(
          expect.objectContaining({ arguments: ['-v'] })
        );
      });
    });

    it('sends undefined arguments when no args are added', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(processService.createProcess).toHaveBeenCalledWith(
          expect.objectContaining({ arguments: undefined })
        );
      });
    });

    it('adds a new argument when Enter is pressed in the arg input', async () => {
      vi.mocked(processService.createProcess).mockResolvedValue(mockSpawnResult);

      renderDialog();

      const argInput = screen.getByPlaceholderText('e.g. -m or http.server');
      fireEvent.change(argInput, { target: { value: '--port' } });
      fireEvent.keyDown(argInput, { key: 'Enter' });

      // Argument tag should appear
      expect(screen.getByText('--port')).toBeInTheDocument();
    });
  });

  // ─── Error path ───────────────────────────────────────────────────────────
  describe('Error path: API failure shows error message in UI', () => {
    it('displays the error message returned by the API', async () => {
      vi.mocked(processService.createProcess).mockRejectedValue(
        new Error("Command 'nmap' is not in the allowed executables list")
      );

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await screen.findByText("Command 'nmap' is not in the allowed executables list");
    });

    it('keeps the form open (does not show success view) on API error', async () => {
      vi.mocked(processService.createProcess).mockRejectedValue(new Error('Forbidden'));

      renderDialog();
      fireEvent.click(screen.getByRole('button', { name: /launch process/i }));

      await waitFor(() => {
        expect(screen.queryByText('Process Launched Successfully')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /launch process/i })).toBeInTheDocument();
      });
    });

    it('shows "Executable command is required" when command is cleared and submitted', async () => {
      renderDialog();

      const cmdInput = screen.getByPlaceholderText('e.g. python3');
      fireEvent.change(cmdInput, { target: { value: '' } });

      // Submit the form directly to ensure the submit event fires in JSDOM
      const form = cmdInput.closest('form')!;
      fireEvent.submit(form);

      await screen.findByText('Executable command is required.');
      expect(processService.createProcess).not.toHaveBeenCalled();
    });
  });

  // ─── Cancel / close ───────────────────────────────────────────────────────
  describe('Cancel / close behaviour', () => {
    it('calls onClose and does NOT call onSuccess when Cancel is clicked', () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      renderDialog({ onSuccess, onClose });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onClose when the ✕ button is clicked', () => {
      const onClose = vi.fn();
      renderDialog({ onClose });

      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ─── Allowlist chip shortcuts ─────────────────────────────────────────────
  describe('Allowlist shortcut chips', () => {
    it('clicking a chip sets the command input to that value', () => {
      renderDialog();

      fireEvent.click(screen.getByRole('button', { name: 'bash' }));

      const cmdInput = screen.getByPlaceholderText('e.g. python3');
      expect((cmdInput as HTMLInputElement).value).toBe('bash');
    });

    it('clicking the python3 chip sets the command to python3', () => {
      renderDialog();
      fireEvent.change(screen.getByPlaceholderText('e.g. python3'), { target: { value: 'bash' } });

      fireEvent.click(screen.getByRole('button', { name: 'python3' }));

      const cmdInput = screen.getByPlaceholderText('e.g. python3');
      expect((cmdInput as HTMLInputElement).value).toBe('python3');
    });
  });

  // ─── Dialog not rendered when isOpen=false ────────────────────────────────
  describe('Dialog visibility', () => {
    it('renders nothing when isOpen is false', () => {
      renderDialog({ isOpen: false });
      expect(screen.queryByText('Spawn Permitted Process')).not.toBeInTheDocument();
    });

    it('renders the form when isOpen is true', () => {
      renderDialog({ isOpen: true });
      expect(screen.getByText('Spawn Permitted Process')).toBeInTheDocument();
    });
  });
});
