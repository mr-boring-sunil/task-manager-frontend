/**
 * Format bytes into human-readable IEC / SI units
 * @param bytes Number of bytes
 * @param decimals Decimal places (default 1)
 * @param binary If true uses 1024 (KiB, MiB), otherwise 1000 (default true)
 */
export function formatBytes(bytes: number | null | undefined, decimals = 1, binary = true): string {
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return '0 B';
  }

  if (bytes === 0) return '0 B';

  const k = binary ? 1024 : 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);

  const value = bytes / Math.pow(k, safeIndex);
  return `${parseFloat(value.toFixed(dm))} ${sizes[safeIndex]}`;
}

/**
 * Format bytes per second rate
 */
export function formatRate(bytesPerSec: number | null | undefined, decimals = 1): string {
  if (bytesPerSec === null || bytesPerSec === undefined || isNaN(bytesPerSec)) {
    return '0 B/s';
  }
  return `${formatBytes(bytesPerSec, decimals, false)}/s`;
}
