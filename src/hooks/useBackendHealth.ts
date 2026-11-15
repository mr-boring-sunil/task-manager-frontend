import { useBackend } from '../context/BackendContext';

export function useBackendHealth() {
  const { isOnline, isCheckingHealth, health, streamStatus, lastConnected, lastError, checkConnection } =
    useBackend();

  return {
    isOnline,
    isCheckingHealth,
    health,
    streamStatus,
    lastConnected,
    lastError,
    checkConnection,
  };
}
