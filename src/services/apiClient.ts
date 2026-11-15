import { ApiResponse, ApiErrorResponse, ErrorCode } from '../types/api';
import { mapBackendError } from '../utils/errorMapper';

export class ApiClientError extends Error {
  statusCode: number;
  code: ErrorCode | string;
  details: any;

  constructor(message: string, statusCode = 500, code: string = 'INTERNAL_ERROR', details: any = null) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Storage keys
const BASE_URL_STORAGE_KEY = 'rpi_taskmgr_base_url';
const API_TOKEN_STORAGE_KEY = 'rpi_taskmgr_api_token';
const AUTH_TYPE_STORAGE_KEY = 'rpi_taskmgr_auth_type'; // 'apiKey' | 'bearer'

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private authType: 'apiKey' | 'bearer' = 'apiKey';
  private defaultTimeout = 10000;

  constructor() {
    // Default to origin in browser or http://localhost:5000 if different port
    const savedUrl = typeof window !== 'undefined' ? sessionStorage.getItem(BASE_URL_STORAGE_KEY) : null;
    this.baseUrl = savedUrl || 'http://localhost:5000';

    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem(API_TOKEN_STORAGE_KEY) || null;
      this.authType = (sessionStorage.getItem(AUTH_TYPE_STORAGE_KEY) as any) || 'apiKey';
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    // Strip trailing slashes
    this.baseUrl = url.trim().replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BASE_URL_STORAGE_KEY, this.baseUrl);
    }
  }

  public getAuthCredentials(): { token: string | null; authType: 'apiKey' | 'bearer' } {
    return { token: this.token, authType: this.authType };
  }

  public setAuthCredentials(token: string | null, authType: 'apiKey' | 'bearer' = 'apiKey'): void {
    this.token = token && token.trim() ? token.trim() : null;
    this.authType = authType;

    if (typeof window !== 'undefined') {
      if (this.token) {
        sessionStorage.setItem(API_TOKEN_STORAGE_KEY, this.token);
        sessionStorage.setItem(AUTH_TYPE_STORAGE_KEY, this.authType);
      } else {
        sessionStorage.removeItem(API_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_TYPE_STORAGE_KEY);
      }
    }
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Headers {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    if (this.token) {
      if (this.authType === 'apiKey') {
        headers.set('x-api-key', this.token);
      } else {
        headers.set('Authorization', `Bearer ${this.token}`);
      }
    }

    Object.entries(customHeaders).forEach(([k, v]) => {
      headers.set(k, v);
    });

    return headers;
  }

  public async request<T = any>(
    path: string,
    options: RequestInit = {},
    timeoutMs: number = this.defaultTimeout
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = this.buildUrl(path);
    const headers = this.getHeaders(options.headers as Record<string, string>);

    if (options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      let json: any;
      const text = await response.text();
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new ApiClientError(
          `Unexpected non-JSON response from backend (${response.status})`,
          response.status,
          'INTERNAL_ERROR'
        );
      }

      if (!response.ok) {
        const errorData = json as ApiErrorResponse;
        const code = errorData?.error?.code || 'INTERNAL_ERROR';
        const message = mapBackendError(code, errorData?.message || `Request failed with status ${response.status}`);
        throw new ApiClientError(message, response.status, code, errorData?.error?.details);
      }

      return json as ApiResponse<T>;
    } catch (err: any) {
      clearTimeout(timer);

      if (err instanceof ApiClientError) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw new ApiClientError(
          'Request timed out. The Raspberry Pi backend took too long to respond.',
          408,
          'TIMEOUT_ERROR'
        );
      }

      throw new ApiClientError(
        'Unable to reach backend. Verify network connection and Raspberry Pi host address.',
        0,
        'NETWORK_ERROR',
        err.message
      );
    }
  }

  public get<T = any>(path: string, queryParams?: Record<string, any>): Promise<ApiResponse<T>> {
    let fullPath = path;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        fullPath += (fullPath.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(fullPath, { method: 'GET' });
  }

  public post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(path: string, queryParams?: Record<string, any>): Promise<ApiResponse<T>> {
    let fullPath = path;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        fullPath += (fullPath.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(fullPath, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
