import { useMetrics } from '../context/MetricsContext';

export function useMetricsStream() {
  const { metrics, history, streamState, lastUpdated, alerts, dismissAlert, refreshMetrics, isLoading } =
    useMetrics();

  return {
    metrics,
    history,
    streamState,
    lastUpdated,
    alerts,
    dismissAlert,
    refreshMetrics,
    isLoading,
    isConnected: streamState === 'connected',
  };
}
