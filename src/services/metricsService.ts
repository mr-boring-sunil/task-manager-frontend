import { apiClient } from './apiClient';
import {
  OverviewMetrics,
  CpuMetrics,
  MemoryMetrics,
  DiskMetric,
  NetworkMetric,
  TemperatureMetric,
} from '../types/metrics';

export const metricsService = {
  /**
   * System overview metrics (CPU load, RAM, Root disk, Temp, Uptime)
   */
  async getOverview(): Promise<OverviewMetrics> {
    const res = await apiClient.get<OverviewMetrics>('/api/v1/metrics/overview');
    return res.data;
  },

  /**
   * Detailed CPU load, per-core utilization, model and clock speed
   */
  async getCpu(): Promise<CpuMetrics> {
    const res = await apiClient.get<CpuMetrics>('/api/v1/metrics/cpu');
    return res.data;
  },

  /**
   * Detailed physical RAM and Swap statistics
   */
  async getMemory(): Promise<MemoryMetrics> {
    const res = await apiClient.get<MemoryMetrics>('/api/v1/metrics/memory');
    return res.data;
  },

  /**
   * Mounted filesystems and storage capacity
   */
  async getDisk(): Promise<DiskMetric[]> {
    const res = await apiClient.get<DiskMetric[]>('/api/v1/metrics/disk');
    return res.data;
  },

  /**
   * Network interface metrics and live bandwidth rates
   */
  async getNetwork(): Promise<NetworkMetric[]> {
    const res = await apiClient.get<NetworkMetric[]>('/api/v1/metrics/network');
    return res.data;
  },

  /**
   * Raspberry Pi thermal sensor readings
   */
  async getTemperature(): Promise<TemperatureMetric> {
    const res = await apiClient.get<TemperatureMetric>('/api/v1/metrics/temperature');
    return res.data;
  },
};
