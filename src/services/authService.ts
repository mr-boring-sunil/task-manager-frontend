/**
 * Authentication API Service
 * Communicates with CEE authentication routes.
 * Raspberry Pi Task Manager — Dashboard
 */

import { apiClient } from './apiClient';
import { LoginResult, SessionResult, AuthUser } from '../types/auth';

export class AuthService {
  /**
   * Authenticate Linux user credentials and establish session
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const res = await apiClient.post<LoginResult>('/api/v1/auth/login', {
      username,
      password,
    });

    if (res.data?.csrfToken) {
      apiClient.setCsrfToken(res.data.csrfToken);
    }

    return res.data;
  }

  /**
   * Validate current session status
   */
  async validateSession(): Promise<SessionResult> {
    const res = await apiClient.get<SessionResult>('/api/v1/auth/session');

    if (res.data?.csrfToken) {
      apiClient.setCsrfToken(res.data.csrfToken);
    }

    return res.data;
  }

  /**
   * Get current authenticated user details
   */
  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<AuthUser>('/api/v1/auth/me');
    return res.data;
  }

  /**
   * Logout and revoke session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      apiClient.setCsrfToken(null);
    }
  }
}

export const authService = new AuthService();
