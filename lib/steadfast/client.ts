/**
 * lib/steadfast/client.ts
 *
 * Typed Steadfast Courier API client
 * Docs: https://portal.steadfast.com.bd/api/v1
 *
 * All methods throw SteadfastError on API errors.
 */

const BASE_URL = 'https://portal.steadfast.com.bd/api/v1';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SteadfastDeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'partial_delivered'
  | 'cancelled'
  | 'hold'
  | 'in_review'
  | 'unknown'
  | string;

export interface SteadfastCreateOrderPayload {
  invoice: string;           // Your order number (unique)
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string; // Full address string
  cod_amount: number;        // Cash on delivery amount (0 for prepaid)
  note?: string;             // Optional delivery note
}

export interface SteadfastOrderResult {
  status: number;            // HTTP-like status (200 = success)
  consignment: {
    id: number;
    tracking_code: string;
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: SteadfastDeliveryStatus;
    created_at: string;
    updated_at: string;
  };
}

export interface SteadfastBulkOrderResult {
  status: number;
  message: string;
  data: {
    success: SteadfastOrderResult['consignment'][];
    failed: Array<{ invoice: string; error: string }>;
  };
}

export interface SteadfastTrackResult {
  status: number;
  delivery_status: SteadfastDeliveryStatus;
  consignment?: {
    id: number;
    tracking_code: string;
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: SteadfastDeliveryStatus;
    created_at: string;
    updated_at: string;
  };
}

export interface SteadfastBalanceResult {
  status: number;
  current_balance: number;
}

export class SteadfastError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly raw?: unknown
  ) {
    super(message);
    this.name = 'SteadfastError';
  }
}

// ─── Client ────────────────────────────────────────────────────────────────

function getCredentials() {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new SteadfastError(
      'STEADFAST_API_KEY or STEADFAST_SECRET_KEY is not set in environment variables'
    );
  }
  return { apiKey, secretKey };
}

async function steadfastFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiKey, secretKey } = getCredentials();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      ...options.headers,
    },
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new SteadfastError(
      `Steadfast API returned non-JSON response`,
      response.status
    );
  }

  if (!response.ok) {
    const msg =
      (data as { message?: string })?.message ||
      `Steadfast API error: ${response.status}`;
    throw new SteadfastError(msg, response.status, data);
  }

  return data as T;
}

// ─── API Methods ───────────────────────────────────────────────────────────

/**
 * Create a single order on Steadfast
 */
export async function createSteadfastOrder(
  payload: SteadfastCreateOrderPayload
): Promise<SteadfastOrderResult> {
  return steadfastFetch<SteadfastOrderResult>('/create_order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Create multiple orders in bulk
 */
export async function createSteadfastBulkOrders(
  orders: SteadfastCreateOrderPayload[]
): Promise<SteadfastBulkOrderResult> {
  return steadfastFetch<SteadfastBulkOrderResult>('/create_order/bulk-order', {
    method: 'POST',
    body: JSON.stringify({ data: orders }),
  });
}

/**
 * Track by Steadfast Consignment ID
 */
export async function trackByCID(
  consignmentId: string | number
): Promise<SteadfastTrackResult> {
  return steadfastFetch<SteadfastTrackResult>(
    `/status_by_cid/${consignmentId}`
  );
}

/**
 * Track by your invoice/order number
 */
export async function trackByInvoice(
  invoice: string
): Promise<SteadfastTrackResult> {
  return steadfastFetch<SteadfastTrackResult>(
    `/status_by_invoice/${encodeURIComponent(invoice)}`
  );
}

/**
 * Track by Steadfast tracking code (for customers)
 */
export async function trackByTrackingCode(
  trackingCode: string
): Promise<SteadfastTrackResult> {
  return steadfastFetch<SteadfastTrackResult>(
    `/status_by_trackingcode/${encodeURIComponent(trackingCode)}`
  );
}

/**
 * Get current Steadfast wallet balance
 */
export async function getSteadfastBalance(): Promise<SteadfastBalanceResult> {
  return steadfastFetch<SteadfastBalanceResult>('/get_balance');
}

// ─── Status Mapping ────────────────────────────────────────────────────────

/**
 * Map Steadfast delivery status → our OrderStatus enum
 */
export function mapSteadfastStatusToOrderStatus(
  status: SteadfastDeliveryStatus
): 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | null {
  const map: Record<string, 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | null> = {
    pending: 'SHIPPED',
    hold: 'SHIPPED',
    in_review: 'SHIPPED',
    partial_delivered: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  };
  return map[status] ?? null;
}

/**
 * Human-readable label for Steadfast status
 */
export function getSteadfastStatusLabel(status: SteadfastDeliveryStatus): string {
  const labels: Record<string, string> = {
    pending: 'Pending Pickup',
    hold: 'On Hold',
    in_review: 'In Review',
    partial_delivered: 'Partially Delivered',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    unknown: 'Unknown',
  };
  return labels[status] ?? status;
}

/**
 * Color class for Steadfast status badge
 */
export function getSteadfastStatusColor(status: SteadfastDeliveryStatus): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    hold: 'bg-orange-100 text-orange-800',
    in_review: 'bg-blue-100 text-blue-800',
    partial_delivered: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-600',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}
