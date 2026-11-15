/**
 * Unified API Response Types
 * Matches JSend-compliant envelope from backend
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorDetail {
  code: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetail;
  timestamp: string;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PROCESS_NOT_FOUND'
  | 'PROTECTED_PROCESS'
  | 'COMMAND_NOT_ALLOWED'
  | 'PERMISSION_DENIED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_PRIORITY'
  | 'PROCESS_SPAWN_FAILED'
  | 'SIGNAL_FAILED'
  | 'SENSOR_UNAVAILABLE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'USER_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'USER_INACTIVE'
  | 'DATABASE_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR';
