/**
 * Facebook Conversion API & Pixel Types
 * Production-grade TypeScript types for Meta tracking
 */

// ============================================
// FACEBOOK PIXEL TYPES (Client-side)
// ============================================

export type FacebookPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

export interface FacebookPixelParams {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  eventID?: string; // Critical for deduplication
}

// ============================================
// CONVERSION API TYPES (Server-side)
// ============================================

export interface FacebookConversionAPIEvent {
  event_name: FacebookPixelEvent;
  event_time: number; // Unix timestamp
  event_id: string; // MUST match Pixel eventID for deduplication
  event_source_url: string;
  action_source: 'website';
  user_data: FacebookUserData;
  custom_data?: FacebookCustomData;
}

export interface FacebookUserData {
  // All PII must be SHA-256 hashed
  em?: string[]; // Email (hashed)
  ph?: string[]; // Phone (hashed)
  fn?: string; // First name (hashed)
  ln?: string; // Last name (hashed)
  ct?: string; // City (hashed)
  st?: string; // State (hashed)
  zp?: string; // ZIP code (hashed)
  country?: string; // Country code (hashed)

  // Advanced matching (from cookies)
  fbc?: string; // _fbc cookie (Facebook click ID)
  fbp?: string; // _fbp cookie (Facebook browser ID)

  // User agent and IP
  client_ip_address?: string;
  client_user_agent?: string;
}

export interface FacebookCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  num_items?: number;
  order_id?: string;
}

export interface FacebookConversionAPIRequest {
  data: FacebookConversionAPIEvent[];
  test_event_code?: string; // For testing in Events Manager
}

export interface FacebookConversionAPIResponse {
  events_received: number;
  messages: string[];
  fbtrace_id: string;
}

// ============================================
// INTERNAL TRACKING TYPES
// ============================================

export interface TrackingPayload {
  eventName: FacebookPixelEvent;
  eventId: string;
  eventSourceUrl: string;

  // User data (unhashed - will be hashed server-side)
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Cookies
  fbc?: string;
  fbp?: string;

  // Custom data
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: 'product' | 'product_group';
  contentName?: string;
  contentCategory?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  numItems?: number;
  orderId?: string;

  // Browser data
  userAgent?: string;
  ipAddress?: string;
}

export interface ServerTrackingResponse {
  success: boolean;
  message: string;
  eventId?: string;
  fbTraceId?: string;
  error?: string;
}
