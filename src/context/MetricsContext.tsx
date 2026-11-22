import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { OverviewMetrics, PerformanceSample } from '../types/metrics';
import { StreamConnectionState } from '../types/stream';
import { streamManager } from '../services/streamService';
import { metricsService } from '../services/metricsService';
import { formatTimeOnly } from '../utils/formatDate';
import { useBackend } from './BackendContext';

export interface MetricAlert {
  id: string;
  level: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface MetricsContextType {
  metrics: OverviewMetrics | null;
  history: PerformanceSample[];
  streamState: StreamConnectionState;
  lastUpdated: Date | null;
  alerts: MetricAlert[];
  dismissAlert: (id: string) => void;
  refreshMetrics: () => Promise<void>;
  isLoading: boolean;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, historyWindowSeconds } = useBackend();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [history, setHistory] = useState<PerformanceSample[]>([]);
  const [streamState, setStreamState] = useState<StreamConnectionState>('disconnected');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep ref for history to avoid stale state in stream subscriber callback
  const historyRef = useRef<PerformanceSample[]>([]);
  historyRef.current = history;

  const handleMetricsData = (data: OverviewMetrics) => {
    if (!data) return;

    setMetrics(data);
    setLastUpdated(new Date());
    setIsLoading(false);

    const now = Date.now();
    const newSample: PerformanceSample = {
      timestamp: now,
      timeStr: formatTimeOnly(new Date(now)),
      cpu: data.cpuUtilization ?? 0,
      memory: data.ramUtilizationPercentage ?? 0,
      temperature: data.cpuTemperature,
      networkRxBytesPerSec: Math.max(0, data.networkRxBytesPerSec ?? 0),
      networkTxBytesPerSec: Math.max(0, data.networkTxBytesPerSec ?? 0),
    };

    // Rolling window: keep samples within historyWindowSeconds
    const cutoff = now - historyWindowSeconds * 1000;
    const updated = [...historyRef.current, newSample].filter((s) => s.timestamp >= cutoff);
    setHistory(updated);
  };

  // Subscribe to SSE metrics stream
  useEffect(() => {
    const subId = 'global-metrics-context';

    const unsubscribe = streamManager.subscribe<OverviewMetrics>(
      'metrics',
      {
        id: subId,
        onData: (data) => {
          handleMetricsData(data);
        },
        onStateChange: (state) => {
          setStreamState(state);
        },
        onError: () => {
          setStreamState('error');
        },
      },
      1000 // 1-second interval
    );

    return () => {
      unsubscribe();
    };
  }, [historyWindowSeconds]);

  // Initial load via REST fallback in case SSE takes a moment
  useEffect(() => {
    let isMounted = true;
    metricsService
      .getOverview()
      .then((data) => {
        if (isMounted && data) {
          handleMetricsData(data);
        }
      })
      .catch(() => {
        // Ignored, SSE will connect
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMetrics = async () => {
    try {
      const data = await metricsService.getOverview();
      handleMetricsData(data);
    } catch (err) {
      console.error('Failed to manually refresh metrics:', err);
    }
  };

  // Compute live dashboard warnings
  const alerts = useMemo<MetricAlert[]>(() => {
    const list: MetricAlert[] = [];
    const now = Date.now();

    if (!isOnline) {
      list.push({
        id: 'backend-offline',
        level: 'danger',
        title: 'Backend Offline',
        message: 'Lost connection to Raspberry Pi backend server. Metrics and live updates paused.',
        timestamp: now,
      });
    }

    if (metrics) {
      if (metrics.cpuUtilization > 85) {
        list.push({
          id: 'high-cpu',
          level: 'warning',
          title: 'High CPU Load',
          message: `CPU load is at ${metrics.cpuUtilization.toFixed(1)}%, exceeding normal threshold (85%).`,
          timestamp: now,
        });
      }

      if (metrics.ramUtilizationPercentage > 85) {
        list.push({
          id: 'high-ram',
          level: 'warning',
          title: 'High Memory Usage',
          message: `Physical RAM utilization is at ${metrics.ramUtilizationPercentage.toFixed(1)}%.`,
          timestamp: now,
        });
      }

      if (metrics.diskUtilizationPercentage > 90) {
        list.push({
          id: 'high-disk',
          level: 'danger',
          title: 'Storage Nearly Full',
          message: `Root filesystem usage has reached ${metrics.diskUtilizationPercentage.toFixed(1)}%.`,
          timestamp: now,
        });
      }

      if (metrics.cpuTemperature !== null && metrics.cpuTemperature > 80) {
        list.push({
          id: 'high-temp',
          level: 'danger',
          title: 'Thermal Throttling Alert',
          message: `CPU temperature is ${metrics.cpuTemperature.toFixed(1)}°C. Raspberry Pi may throttle clock speed.`,
          timestamp: now,
        });
      }

      if (metrics.cpuTemperatureStatus === 'unavailable') {
        list.push({
          id: 'temp-unavailable',
          level: 'info',
          title: 'Sensor Status',
          message: 'Temperature sensor is unavailable on this hardware or environment.',
          timestamp: now,
        });
      }
    }

    return list.filter((a) => !dismissedAlertIds.has(a.id));
  }, [isOnline, metrics, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(id));
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        history,
        streamState,
        lastUpdated,
        alerts,
        dismissAlert,
        refreshMetrics,
        isLoading,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

export function useMetrics(): MetricsContextType {
  const ctx = useContext(MetricsContext);
  if (!ctx) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return ctx;
}
