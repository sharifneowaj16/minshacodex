/**
 * lib/elasticsearch/utils.ts
 *
 * Search input sanitization and validation utilities.
 */

/**
 * Sanitize a raw search query to prevent injection and clean up input.
 */
export function sanitizeQuery(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .trim()
    .slice(0, 200) // Max query length
    .replace(/[<>{}[\]\\\/]/g, '') // Remove dangerous chars
    .replace(/\s+/g, ' '); // Collapse whitespace
}

/**
 * Validate and coerce a numeric URL param.
 */
export function validateNumericParam(
  value: string | null,
  defaultVal: number,
  min: number,
  max: number
): number {
  if (!value) return defaultVal;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultVal;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Validate a price range.
 */
export function validatePriceRange(
  minPrice: string | null,
  maxPrice: string | null
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (minPrice !== null) {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0) errors.push('minPrice must be a non-negative number');
  }

  if (maxPrice !== null) {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0) errors.push('maxPrice must be a non-negative number');
  }

  if (minPrice && maxPrice) {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      errors.push('minPrice cannot be greater than maxPrice');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate all search params from a URLSearchParams object.
 */
export function validateSearchParams(
  searchParams: URLSearchParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const page = searchParams.get('page');
  if (page !== null) {
    const p = parseInt(page, 10);
    if (isNaN(p) || p < 1 || p > 1000) {
      errors.push('page must be between 1 and 1000');
    }
  }

  const limit = searchParams.get('limit');
  if (limit !== null) {
    const l = parseInt(limit, 10);
    if (isNaN(l) || l < 1 || l > 100) {
      errors.push('limit must be between 1 and 100');
    }
  }

  const priceValidation = validatePriceRange(
    searchParams.get('minPrice'),
    searchParams.get('maxPrice')
  );
  errors.push(...priceValidation.errors);

  const rating = searchParams.get('rating');
  if (rating !== null) {
    const r = parseFloat(rating);
    if (isNaN(r) || r < 0 || r > 5) {
      errors.push('rating must be between 0 and 5');
    }
  }

  const validSorts = ['relevance', 'price_asc', 'price_desc', 'newest', 'rating', 'name_asc', 'name_desc', 'popularity'];
  const sort = searchParams.get('sort');
  if (sort !== null && !validSorts.includes(sort)) {
    errors.push(`sort must be one of: ${validSorts.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Build a safe ES query object from validated params.
 */
export function buildSafeQuery(rawQuery: string): string {
  return sanitizeQuery(rawQuery);
}
