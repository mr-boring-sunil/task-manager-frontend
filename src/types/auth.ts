/**
 * Authentication and Device Types
 * Raspberry Pi Task Manager — Dashboard
 */

export type UserRole = 'admin' | 'standard';

export interface AuthUser {
  id?: string;
  username: string;
  role: UserRole;
  permissions: string[];
  authMethod?: string;
}

export interface AuthSession {
  authenticated: boolean;
  expiresIn?: number;
  expiresAt?: string;
}

export interface LoginResult {
  user: AuthUser;
  session: AuthSession;
  csrfToken?: string;
}

export interface SessionResult {
  authenticated: boolean;
  user: AuthUser;
  session: AuthSession;
  csrfToken?: string;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  host: string;
  port: number;
  url: string;
  status: 'online' | 'offline' | 'checking';
  uptime?: number;
  lastSeen?: Date;
  error?: string;
}
