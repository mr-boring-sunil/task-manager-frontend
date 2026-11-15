import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { healthService, HealthResponse } from '../services/healthService';
import { streamManager } from '../services/streamService';
import { StreamStatus } from '../types/stream';

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface BackendContextType {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  token: string | null;
  authType: 'apiKey' | 'bearer';
  setAuthCredentials: (token: string | null, authType?: 'apiKey' | 'bearer') => void;
  isOnline: boolean;
  isCheckingHealth: boolean;
  health: HealthResponse | null;
  streamStatus: StreamStatus | null;
  lastConnected: Date | null;
  lastError: string | null;
  checkConnection: () => Promise<boolean>;
  alerts: SystemAlert[];
  dismissAlert: (id: string) => void;
  historyWindowSeconds: number;
  setHistoryWindowSeconds: (seconds: number) => void;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

const HISTORY_WINDOW_KEY = 'rpi_taskmgr_history_window';

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(() => apiClient.getBaseUrl());
  const [token, setTokenState] = useState<string | null>(() => apiClient.getAuthCredentials().token);
  const [authType, setAuthTypeState] = useState<'apiKey' | 'bearer'>(() => apiClient.getAuthCredentials().authType);

  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const [historyWindowSeconds, setHistoryWindowState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HISTORY_WINDOW_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 10 && parsed <= 300) return parsed;
      }
    }
    return 60; // 60 seconds rolling window
  });

  const setHistoryWindowSeconds = (seconds: number) => {
    setHistoryWindowState(seconds);
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_WINDOW_KEY, String(seconds));
    }
  };

  const setBaseUrl = (url: string) => {
    apiClient.setBaseUrl(url);
    setBaseUrlState(apiClient.getBaseUrl());
    streamManager.reconnectAll();
    checkConnection();
  };

  const setAuthCredentials = (newToken: string | null, newAuthType: 'apiKey' | 'bearer' = 'apiKey') => {
    apiClient.setAuthCredentials(newToken, newAuthType);
    setTokenState(newToken);
    setAuthTypeState(newAuthType);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsCheckingHealth(true);
    try {
      const healthData = await healthService.checkHealth();
      setIsOnline(true);
      setHealth(healthData);
      setLastConnected(new Date());
      setLastError(null);

      // Also retrieve stream stats
      try {
        const streams = await healthService.getStreamStatus();
        setStreamStatus(streams);
      } catch {
        // Stream status is non-fatal
      }

      setIsCheckingHealth(false);
      return true;
    } catch (err: any) {
      setIsOnline(false);
      setLastError(err.message || 'Connection failed');
      setIsCheckingHealth(false);
      return false;
    }
  }, []);

  // Periodic health check every 15 seconds
  useEffect(() => {
    checkConnection();
    const interval = setInterval(() => {
      checkConnection();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <BackendContext.Provider
      value={{
        baseUrl,
        setBaseUrl,
        token,
        authType,
        setAuthCredentials,
        isOnline,
        isCheckingHealth,
        health,
        streamStatus,
        lastConnected,
        lastError,
        checkConnection,
        alerts,
        dismissAlert,
        historyWindowSeconds,
        setHistoryWindowSeconds,
      }}
    >
      {children}
    </BackendContext.Provider>
  );
};

export function useBackend(): BackendContextType {
  const ctx = useContext(BackendContext);
  if (!ctx) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return ctx;
}
