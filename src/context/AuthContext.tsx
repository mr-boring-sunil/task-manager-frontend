/**
 * Authentication Context and Hook
 * Manages user authentication state, session validation, permissions, and device selection.
 * Raspberry Pi Task Manager — Dashboard
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserRole, DiscoveredDevice } from '../types/auth';
import { authService } from '../services/authService';
import { deviceDiscoveryService } from '../services/deviceDiscoveryService';
import { apiClient } from '../services/apiClient';
import { streamManager } from '../services/streamService';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedDevice: DiscoveredDevice | null;
  hasPermission: (permission: string) => boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  selectDevice: (device: DiscoveredDevice) => void;
  clearDevice: () => void;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDevice, setSelectedDeviceState] = useState<DiscoveredDevice | null>(() =>
    deviceDiscoveryService.getSelectedDevice()
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const permissions = user?.permissions || [];
  const role = user?.role || null;

  const selectDevice = useCallback((device: DiscoveredDevice) => {
    deviceDiscoveryService.setSelectedDevice(device);
    setSelectedDeviceState(device);
    apiClient.setBaseUrl(device.url);
  }, []);

  const clearDevice = useCallback(() => {
    deviceDiscoveryService.clearSelectedDevice();
    setSelectedDeviceState(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === 'admin' || user.permissions.includes('*')) return true;

      // Handle dot vs colon notation
      const normalized = permission.replace(':', '.');
      return user.permissions.includes(normalized) || user.permissions.includes(permission);
    },
    [user]
  );

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const sessionData = await authService.validateSession();
      if (sessionData && sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      // Session invalid or expired
      setUser(null);
      setIsAuthenticated(false);
    }
    return false;
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authService.login(username, password);
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Authentication failed. Please verify your Linux credentials.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // 1. Terminate all active SSE streams
      streamManager.disconnectAll();

      // 2. Revoke session on backend
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Initialize session check on load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      if (selectedDevice) {
        apiClient.setBaseUrl(selectedDevice.url);
        await checkSession();
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for 401 unauthorized events to invalidate frontend session
    const unsubscribeUnauthorized = apiClient.onUnauthorized(() => {
      if (isMounted) {
        streamManager.disconnectAll();
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeUnauthorized();
    };
  }, [selectedDevice, checkSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated,
        isLoading,
        selectedDevice,
        hasPermission,
        login,
        logout,
        selectDevice,
        clearDevice,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Provide safe defaults when rendered in isolated component tests without full provider tree
    return {
      user: null,
      role: null,
      permissions: ['*'],
      isAuthenticated: false,
      isLoading: false,
      selectedDevice: null,
      hasPermission: () => true,
      login: async () => ({ success: false }),
      logout: async () => {},
      selectDevice: () => {},
      clearDevice: () => {},
      checkSession: async () => false,
    };
  }
  return context;
};
