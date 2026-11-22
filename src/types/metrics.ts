/**
 * Hardware & System Telemetry Metrics Types
 * Matches backend Scheduling Engine collectors
 */

export interface CpuCoreLoad {
  core: number;
  load: number;
}

export interface CpuMetrics {
  overallCpuUtilization: number;
  perCoreUtilization: CpuCoreLoad[];
  cpuModel: string;
  cores: number;
  frequencyGhz: number | null;
}

export interface SwapMetrics {
  total: number;
  used: number;
  free: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  available: number;
  swap: SwapMetrics;
}

export interface DiskMetric {
  filesystem: string;
  mountPoint: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
}

export interface NetworkMetric {
  interface: string;
  receivedBytes: number;
  transmittedBytes: number;
  receiveRateBytesPerSec: number;
  transmitRateBytesPerSec: number;
  status: string;
}

export interface TemperatureMetric {
  celsius: number | null;
  status: 'available' | 'unavailable';
}

export interface OverviewMetrics {
  cpuUtilization: number;
  totalRam: number;
  usedRam: number;
  availableRam: number;
  ramUtilizationPercentage: number;
  diskTotal: number;
  diskUsed: number;
  diskAvailable: number;
  diskUtilizationPercentage: number;
  cpuTemperature: number | null;
  cpuTemperatureStatus: 'available' | 'unavailable';
  systemUptime: number;
  networkRxBytesPerSec?: number;
  networkTxBytesPerSec?: number;
}

export interface PerformanceSample {
  timestamp: number; // Unix epoch ms
  timeStr: string;   // HH:mm:ss
  cpu: number;
  memory: number;    // %
  networkRxBytesPerSec?: number;
  networkTxBytesPerSec?: number;
  temperature?: number | null;
}
