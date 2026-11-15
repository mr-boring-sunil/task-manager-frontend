import { apiClient } from './apiClient';
import { StreamStatus } from '../types/stream';

export interface HealthResponse {
  status: string;
  uptime: number;
}

export const healthService = {
  /**
   * Ping backend /health endpoint
   */
  async checkHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<HealthResponse>('/health');
    return res.data;
  },

  /**
   * Get SSE active stream status
   */
  async getStreamStatus(): Promise<StreamStatus> {
    const res = await apiClient.get<StreamStatus>('/api/v1/stream/status');
    return res.data;
  },
};
