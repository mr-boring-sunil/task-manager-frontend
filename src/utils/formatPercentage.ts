/**
 * Format numeric percentage with clamping and decimals
 */
export function formatPercentage(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0.0%';
  }
  const clamped = Math.max(0, val);
  return `${clamped.toFixed(decimals)}%`;
}
