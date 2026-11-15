/**
 * Error Code Mapper
 * Converts backend machine-readable error codes into actionable user messages
 */
export function mapBackendError(code: string | undefined, fallbackMessage?: string): string {
  switch (code) {
    case 'PROTECTED_PROCESS':
      return 'This process is protected by the operating system and cannot be modified or terminated.';
    case 'PROCESS_NOT_FOUND':
      return 'The target process does not exist or has already terminated.';
    case 'COMMAND_NOT_ALLOWED':
      return 'This command is not on the backend executable allowlist.';
    case 'PERMISSION_DENIED':
      return 'Permission denied. This operation requires elevated Linux system privileges.';
    case 'UNAUTHORIZED':
      return 'Authentication required. Please configure a valid API key or Bearer token in Settings.';
    case 'FORBIDDEN':
      return 'Access forbidden for your current role or API key.';
    case 'INVALID_PRIORITY':
      return 'Nice priority must be an integer between -20 (highest priority) and 19 (lowest priority). Negative values may require CAP_SYS_NICE.';
    case 'VALIDATION_ERROR':
      return fallbackMessage || 'Invalid request parameters provided.';
    case 'PROCESS_SPAWN_FAILED':
      return fallbackMessage || 'Failed to spawn process on the host.';
    case 'SIGNAL_FAILED':
      return fallbackMessage || 'Failed to dispatch signal to the target process.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Rate limit exceeded. Please wait a moment before trying again.';
    case 'SENSOR_UNAVAILABLE':
      return 'Hardware sensor is unavailable on this device.';
    case 'INTERNAL_ERROR':
      return 'An internal error occurred in the backend engine.';
    case 'NETWORK_ERROR':
      return 'Failed to communicate with the Raspberry Pi backend. Check host URL and network connectivity.';
    case 'TIMEOUT_ERROR':
      return 'Request to backend timed out.';
    default:
      return fallbackMessage || 'An unexpected error occurred.';
  }
}
