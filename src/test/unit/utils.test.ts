import { describe, it, expect } from 'vitest';
import { formatBytes, formatRate } from '../../utils/formatBytes';
import { formatDuration } from '../../utils/formatDuration';
import { formatPercentage } from '../../utils/formatPercentage';
import { getProcessStateConfig } from '../../utils/processState';
import { mapBackendError } from '../../utils/errorMapper';

describe('Frontend Utility Functions', () => {
  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(null)).toBe('0 B');
    });

    it('formats KiB and MiB correctly', () => {
      expect(formatBytes(1024)).toBe('1 KiB');
      expect(formatBytes(1048576)).toBe('1 MiB');
      expect(formatBytes(1073741824)).toBe('1 GiB');
    });

    it('formats rates with /s', () => {
      expect(formatRate(1048576)).toBe('1 MB/s');
    });
  });

  describe('formatDuration', () => {
    it('formats zero or invalid duration', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(null)).toBe('0s');
    });

    it('formats seconds, minutes, hours, days', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(3661)).toBe('1h 1m');
      expect(formatDuration(86400)).toBe('1d 0h 0m');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentages with decimal points', () => {
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(42.56)).toBe('42.6%');
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });

  describe('getProcessStateConfig', () => {
    it('maps known process states with label and badge classes', () => {
      const running = getProcessStateConfig('running');
      expect(running.label).toBe('Running');
      expect(running.badgeClass).toContain('emerald');

      const stopped = getProcessStateConfig('stopped');
      expect(stopped.label).toBe('Stopped');
      expect(stopped.badgeClass).toContain('amber');

      const zombie = getProcessStateConfig('zombie');
      expect(zombie.label).toBe('Zombie');

      const unknown = getProcessStateConfig('invalid_state');
      expect(unknown.label).toBe('Unknown');
    });
  });

  describe('mapBackendError', () => {
    it('maps backend error codes to user-friendly messages', () => {
      expect(mapBackendError('PROTECTED_PROCESS')).toContain('protected by the operating system');
      expect(mapBackendError('PROCESS_NOT_FOUND')).toContain('target process does not exist');
      expect(mapBackendError('COMMAND_NOT_ALLOWED')).toContain('allowlist');
      expect(mapBackendError('INVALID_PRIORITY')).toContain('between -20');
      expect(mapBackendError('UNKNOWN_CODE', 'Custom')).toBe('Custom');
    });
  });
});
