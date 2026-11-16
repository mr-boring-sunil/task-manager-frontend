import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deviceDiscoveryService } from '../../services/deviceDiscoveryService';

describe('Device Discovery Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('probes healthy endpoint and returns status and uptime', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          message: 'Engine healthy',
          data: { status: 'healthy', uptime: 12345.6 },
        }),
    });
    globalThis.fetch = mockFetch;

    const probe = await deviceDiscoveryService.probeEndpoint('http://localhost:5000');
    expect(probe.healthy).toBe(true);
    expect(probe.uptime).toBe(12345.6);
  });

  it('rejects endpoint when health check returns non-healthy or error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    globalThis.fetch = mockFetch;

    const probe = await deviceDiscoveryService.probeEndpoint('http://offline-device:5000');
    expect(probe.healthy).toBe(false);
  });

  it('handles network error or abort gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    globalThis.fetch = mockFetch;

    const probe = await deviceDiscoveryService.probeEndpoint('http://unreachable:5000');
    expect(probe.healthy).toBe(false);
  });

  it('manages selected device in localStorage without storing secrets', () => {
    expect(deviceDiscoveryService.getSelectedDevice()).toBeNull();

    const device = {
      id: 'dev_taskmgr_5000',
      name: 'Raspberry Pi 4B',
      host: 'task-manager.local',
      port: 5000,
      url: 'http://task-manager.local:5000',
      status: 'online' as const,
    };

    deviceDiscoveryService.setSelectedDevice(device);

    const saved = deviceDiscoveryService.getSelectedDevice();
    expect(saved).toBeDefined();
    expect(saved?.host).toBe('task-manager.local');
    expect(saved?.port).toBe(5000);
    // Ensure no password or secret fields exist
    expect((saved as any).password).toBeUndefined();
    expect((saved as any).token).toBeUndefined();

    deviceDiscoveryService.clearSelectedDevice();
    expect(deviceDiscoveryService.getSelectedDevice()).toBeNull();
  });
});
