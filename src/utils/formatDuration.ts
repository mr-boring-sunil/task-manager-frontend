/**
 * Format duration in seconds into human-readable uptime
 * e.g. 86400 -> "1d 0h 0m", 3661 -> "1h 1m 1s"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '0s';
  }

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  if (parts.length === 0 || (d === 0 && h === 0 && m < 5)) {
    parts.push(`${s}s`);
  }

  return parts.join(' ');
}
