import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../services/authService';
import { apiClient } from '../../services/apiClient';

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiClient.setBaseUrl('http://localhost:5000');
    apiClient.setCsrfToken(null);
  });

  it('login sends credentials and sets CSRF token', async () => {
    const mockResponse = {
      success: true,
      message: 'Authentication successful',
      data: {
        user: { username: 'pi', role: 'admin', permissions: ['*'] },
        session: { authenticated: true, expiresIn: 3600 },
        csrfToken: 'csrf_test_token_123',
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });
    globalThis.fetch = mockFetch;

    const result = await authService.login('pi', 'raspberry');

    expect(result.user.username).toBe('pi');
    expect(result.user.role).toBe('admin');
    expect(result.csrfToken).toBe('csrf_test_token_123');
    expect(apiClient.getCsrfToken()).toBe('csrf_test_token_123');

    // Verify credentials: 'include' was passed
    const callOptions = mockFetch.mock.calls[0][1];
    expect(callOptions.credentials).toBe('include');
    expect(JSON.parse(callOptions.body)).toEqual({ username: 'pi', password: 'raspberry' });
  });

  it('validateSession returns authenticated user context and updates CSRF token', async () => {
    const mockResponse = {
      success: true,
      message: 'Session is valid',
      data: {
        authenticated: true,
        user: { username: 'sunil', role: 'standard', permissions: ['system.read', 'process.read'] },
        session: { authenticated: true, expiresIn: 1800 },
        csrfToken: 'new_csrf_token',
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });
    globalThis.fetch = mockFetch;

    const result = await authService.validateSession();

    expect(result.authenticated).toBe(true);
    expect(result.user.username).toBe('sunil');
    expect(result.user.role).toBe('standard');
    expect(apiClient.getCsrfToken()).toBe('new_csrf_token');
  });

  it('logout calls POST /api/v1/auth/logout and clears CSRF token', async () => {
    apiClient.setCsrfToken('some_token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Logout successful', data: { authenticated: false } })),
    });
    globalThis.fetch = mockFetch;

    await authService.logout();

    expect(mockFetch).toHaveBeenCalled();
    expect(apiClient.getCsrfToken()).toBeNull();
  });
});
