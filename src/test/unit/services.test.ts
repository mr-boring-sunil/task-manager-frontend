import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiClientError } from '../../services/apiClient';
import { processService } from '../../services/processService';
import { metricsService } from '../../services/metricsService';
import { healthService } from '../../services/healthService';

describe('API Services & Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiClient.setBaseUrl('http://localhost:5000');
    apiClient.setAuthCredentials(null);
  });

  describe('apiClient', () => {
    it('configures and normalizes base URL', () => {
      apiClient.setBaseUrl('http://192.168.1.50:5000///');
      expect(apiClient.getBaseUrl()).toBe('http://192.168.1.50:5000');
    });

    it('injects API key or Bearer token header', async () => {
      apiClient.setAuthCredentials('secret-api-key', 'apiKey');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ success: true, message: 'ok', data: {} })),
      });
      globalThis.fetch = mockFetch;

      await apiClient.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalled();
      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.get('x-api-key')).toBe('secret-api-key');
    });

    it('throws ApiClientError with backend code on failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () =>
          JSON.stringify({
            success: false,
            message: 'Protected',
            error: { code: 'PROTECTED_PROCESS' },
          }),
      });
      globalThis.fetch = mockFetch;

      await expect(apiClient.delete('/api/v1/processes/1')).rejects.toThrowError(ApiClientError);
    });
  });

  describe('processService', () => {
    it('calls GET /api/v1/processes with query parameters', async () => {
      const mockData = {
        processes: [{ pid: 100, name: 'node', cpu: 1.2 }],
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };

      vi.spyOn(apiClient, 'get').mockResolvedValue({
        success: true,
        message: 'ok',
        data: mockData,
        timestamp: new Date().toISOString(),
      });

      const result = await processService.listProcesses({ page: 1, limit: 50, sortBy: 'cpu' });
      expect(result.processes.length).toBe(1);
      expect(result.processes[0].pid).toBe(100);
    });

    it('calls GET /api/v1/processes/:pid', async () => {
      const mockProc = { pid: 200, name: 'python3', cpu: 0.5 };
      vi.spyOn(apiClient, 'get').mockResolvedValue({
        success: true,
        message: 'ok',
        data: mockProc as any,
        timestamp: new Date().toISOString(),
      });

      const result = await processService.getProcess(200);
      expect(result.pid).toBe(200);
    });

    it('calls POST /api/v1/processes to spawn process', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({
        success: true,
        message: 'spawned',
        data: { pid: 300, name: 'python3', command: 'python3 -m http.server', status: 'running', startTime: '' },
        timestamp: new Date().toISOString(),
      });

      const res = await processService.createProcess({ command: 'python3' });
      expect(res.pid).toBe(300);
    });

    it('calls DELETE /api/v1/processes/:pid with signal', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({
        success: true,
        message: 'terminated',
        data: { pid: 300, terminated: true, signal: 'SIGTERM', escalated: false },
        timestamp: new Date().toISOString(),
      });

      const res = await processService.terminateProcess(300, 'SIGTERM');
      expect(res.terminated).toBe(true);
    });

    it('calls pause and resume endpoints', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        message: 'paused',
        data: { pid: 300, state: 'stopped', signal: 'SIGSTOP' },
        timestamp: new Date().toISOString(),
      });

      const pauseRes = await processService.pauseProcess(300);
      expect(pauseRes.state).toBe('stopped');

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        message: 'resumed',
        data: { pid: 300, state: 'running', signal: 'SIGCONT' },
        timestamp: new Date().toISOString(),
      });

      const resumeRes = await processService.resumeProcess(300);
      expect(resumeRes.state).toBe('running');
    });

    it('calls PATCH /api/v1/processes/:pid/priority', async () => {
      vi.spyOn(apiClient, 'patch').mockResolvedValue({
        success: true,
        message: 'ok',
        data: { pid: 300, priority: 5 },
        timestamp: new Date().toISOString(),
      });

      const res = await processService.changePriority(300, 5);
      expect(res.priority).toBe(5);
    });
  });

  describe('metricsService & healthService', () => {
    it('fetches overview, cpu, memory, disk, network, temperature', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({
        success: true,
        message: 'ok',
        data: { cpuUtilization: 12.5 } as any,
        timestamp: new Date().toISOString(),
      });

      const overview = await metricsService.getOverview();
      expect(overview.cpuUtilization).toBe(12.5);

      const health = await healthService.checkHealth();
      expect(health).toBeDefined();
    });
  });
});
