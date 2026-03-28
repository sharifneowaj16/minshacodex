/**
 * Currency utility for Bangladeshi Taka (BDT)
 * Price is now stored directly in BDT in the database — no conversion needed.
 */

export const CURRENCY_CODE = 'BDT';
export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_LOCALE = 'en-BD';

/**
 * Format price in Bangladeshi Taka
 */
export function formatPrice(
  amount: number,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    locale = CURRENCY_LOCALE
  } = options;

  if (showSymbol && showCode) {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString(locale)} ${CURRENCY_CODE}`;
  } else if (showSymbol) {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString(locale)}`;
  } else if (showCode) {
    return `${amount.toLocaleString(locale)} ${CURRENCY_CODE}`;
  } else {
    return amount.toLocaleString(locale);
  }
}

/**
 * @deprecated Price is now stored in BDT directly. Use formatPrice() instead.
 * Kept for backward compatibility — returns amount unchanged.
 */
export function convertUSDtoBDT(amount: number): number {
  return amount; // No conversion — price is already in BDT
}

/**
 * @deprecated Use formatPrice() directly.
 */
export function formatPriceFromUSD(
  amount: number,
  options: { showSymbol?: boolean; showCode?: boolean } = {}
): string {
  return formatPrice(amount, options);
}

/**
 * Format a number with locale-specific formatting
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
    locale = CURRENCY_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits
  } = options;

  return num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  });
}

export default {
  formatPrice,
  convertUSDtoBDT,
  formatPriceFromUSD,
  formatNumber,
  CURRENCY_CODE,
  CURRENCY_SYMBOL,
  CURRENCY_LOCALE
};
