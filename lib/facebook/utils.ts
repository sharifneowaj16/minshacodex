/**
 * Facebook Tracking Utilities
 * Production-grade helper functions for CAPI & Pixel
 */

import crypto from 'crypto';

/**
 * Generate UUID v4 for event deduplication
 * CRITICAL: Same eventID must be used for Pixel (client) and CAPI (server)
 */
export function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * SHA-256 hash for PII (Personal Identifiable Information)
 * Meta requires all PII to be hashed before sending via CAPI
 *
 * @param value - Raw PII value (email, phone, name, etc.)
 * @returns Lowercase SHA-256 hash or undefined if input is invalid
 */
export function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value || typeof value !== 'string') return undefined;

  // Normalize: trim whitespace, convert to lowercase
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  // Create SHA-256 hash
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')
    .toLowerCase();
}

/**
 * Normalize and hash email
 * Removes spaces, converts to lowercase, then hashes
 */
export function hashEmail(email: string | undefined | null): string | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase().replace(/\s/g, '');
  return hashSHA256(normalized);
}

/**
 * Normalize and hash phone number
 * Removes all non-digit characters, then hashes
 * Example: "+1 (555) 123-4567" -> hash("15551234567")
 */
export function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  if (!digitsOnly) return undefined;
  return hashSHA256(digitsOnly);
}

/**
 * Get Facebook click ID from _fbc cookie
 * Format: fb.{subdomain_index}.{creation_time}.{fbclid}
 */
export function extractFbc(cookies: string | undefined): string | undefined {
  if (!cookies) return undefined;
  const match = cookies.match(/_fbc=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Get Facebook browser ID from _fbp cookie
 * Format: fb.{subdomain_index}.{creation_time}.{random}
 */
export function extractFbp(cookies: string | undefined): string | undefined {
  if (!cookies) return undefined;
  const match = cookies.match(/_fbp=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Get client IP address from request headers
 * Handles proxies, load balancers, and Vercel deployment
 */
export function getClientIp(headers: Headers): string | undefined {
  // Check common proxy headers in order of precedence
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs (client, proxy1, proxy2)
    // The first one is the original client IP
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  const vercelIp = headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp;

  // Fallback (should rarely be used in production)
  return undefined;
}

/**
 * Validate Facebook Pixel ID format
 * Should be a numeric string (e.g., "1234567890123456")
 */
export function validatePixelId(pixelId: string | undefined): boolean {
  if (!pixelId) return false;
  return /^\d{15,16}$/.test(pixelId);
}

/**
 * Validate Facebook Access Token format
 * Basic validation - real validation happens server-side with Meta API
 */
export function validateAccessToken(token: string | undefined): boolean {
  if (!token) return false;
  // Access tokens are typically 100+ characters alphanumeric with special chars
  return token.length > 50 && /^[A-Za-z0-9_-]+$/.test(token);
}

/**
 * Create idempotency key for preventing duplicate Purchase events
 * Combines order ID with timestamp to ensure uniqueness
 */
export function createIdempotencyKey(orderId: string): string {
  const timestamp = Date.now();
  return `${orderId}_${timestamp}`;
}

/**
 * Sanitize URL for event_source_url
 * Removes sensitive query parameters
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove sensitive params like email, token, etc.
    const sensitiveParams = ['email', 'token', 'password', 'key', 'secret'];
    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Format currency to 2 decimal places for Meta
 * Ensures consistent formatting regardless of input
 */
export function formatCurrency(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return undefined;
  return Math.round(num * 100) / 100; // Round to 2 decimals
}

/**
 * Convert product data to Meta's contents format
 */
export function formatContents(
  items: Array<{ id: string; quantity: number; price: number }>
): Array<{ id: string; quantity: number; item_price: number }> {
  return items.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: formatCurrency(item.price) || 0,
  }));
}
