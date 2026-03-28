/**
 * Formatting utility functions
 */

/**
 * Format a number with locale-specific formatting
 * @param num - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  num: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = 'en-BD',
    minimumFractionDigits,
    maximumFractionDigits
  } = options;

  return num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  });
}

/**
 * Format a number with compact notation (K, M, B)
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Format percentage
 * @param value - The decimal value (0.123 = 12.3%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Default export for convenience
 */
export default {
  formatNumber,
  formatCompactNumber,
  formatPercentage
};
