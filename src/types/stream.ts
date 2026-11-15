/**
 * Server-Sent Events (SSE) Stream Types
 */

import { OverviewMetrics } from './metrics';
import { ProcessListResponseData } from './process';

export type StreamConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SSEConnectedPayload {
  clientId: string;
  channel: string;
  intervalMs: number;
  timestamp?: string;
}

export interface StreamStatus {
  metricsClientsCount: number;
  processesClientsCount: number;
  metricsIntervalMs: number;
  processesIntervalMs: number;
}

export interface StreamMetricsEventData extends OverviewMetrics {}

export interface StreamProcessesEventData extends ProcessListResponseData {}

export interface BackendHealth {
  status: 'healthy' | 'degraded' | 'offline';
  uptime?: number;
}
