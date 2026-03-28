/**
 * Facebook Conversion API (CAPI) Server-side Route
 *
 * PRODUCTION-GRADE IMPLEMENTATION
 * - Handles server-side conversion tracking
 * - Implements strict deduplication with Pixel via event_id
 * - SHA-256 hashes all PII before sending to Meta
 * - Idempotent: Prevents duplicate Purchase events
 * - Secure: No secrets exposed to client
 *
 * @route POST /api/facebook-capi
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  TrackingPayload,
  FacebookConversionAPIRequest,
  FacebookConversionAPIResponse,
  ServerTrackingResponse,
} from '@/types/facebook';
import {
  hashEmail,
  hashPhone,
  hashSHA256,
  getClientIp,
  formatCurrency,
  validatePixelId,
  validateAccessToken,
} from '@/lib/facebook/utils';

// Environment variables (MUST be set in production)
const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_CONVERSION_API_TOKEN;
const FACEBOOK_TEST_EVENT_CODE = process.env.FACEBOOK_TEST_EVENT_CODE; // Optional: for testing

// Meta Conversion API endpoint
const FACEBOOK_GRAPH_API_VERSION = 'v21.0';
const FACEBOOK_CAPI_ENDPOINT = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`;

// In-memory cache for idempotency (prevents duplicate purchases)
// In production, use Redis or database for distributed systems
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Clean up expired idempotency entries
 */
function cleanupIdempotencyCache() {
  const now = Date.now();
  for (const [key, timestamp] of processedEvents.entries()) {
    if (now - timestamp > IDEMPOTENCY_TTL) {
      processedEvents.delete(key);
    }
  }
}

/**
 * Check if event was already processed (idempotency)
 */
function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (!timestamp) return false;

  const now = Date.now();
  if (now - timestamp > IDEMPOTENCY_TTL) {
    processedEvents.delete(eventId);
    return false;
  }

  return true;
}

/**
 * Mark event as processed
 */
function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

/**
 * POST /api/facebook-capi
 * Send conversion event to Facebook Conversion API
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!validatePixelId(FACEBOOK_PIXEL_ID)) {
      console.error('[CAPI] Invalid or missing NEXT_PUBLIC_FACEBOOK_PIXEL_ID');
      return NextResponse.json(
        {
          success: false,
          message: 'Facebook Pixel ID not configured',
          error: 'INVALID_CONFIG',
        } as ServerTrackingResponse,
        { status: 500 }
      );
    }

    if (!validateAccessToken(FACEBOOK_ACCESS_TOKEN)) {
      console.error('[CAPI] Invalid or missing FACEBOOK_CONVERSION_API_TOKEN');
      return NextResponse.json(
        {
          success: false,
          message: 'Facebook Access Token not configured',
          error: 'INVALID_CONFIG',
        } as ServerTrackingResponse,
        { status: 500 }
      );
    }

    // Parse request body
    const payload: TrackingPayload = await request.json();

    // Validate required fields
    if (!payload.eventName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required field: eventName',
          error: 'INVALID_PAYLOAD',
        } as ServerTrackingResponse,
        { status: 400 }
      );
    }

    if (!payload.eventId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required field: eventId (critical for deduplication)',
          error: 'INVALID_PAYLOAD',
        } as ServerTrackingResponse,
        { status: 400 }
      );
    }

    // Idempotency check: Prevent duplicate Purchase events
    if (payload.eventName === 'Purchase') {
      if (isEventProcessed(payload.eventId)) {
        console.log(`[CAPI] Duplicate Purchase event blocked: ${payload.eventId}`);
        return NextResponse.json(
          {
            success: true,
            message: 'Event already processed (idempotent)',
            eventId: payload.eventId,
          } as ServerTrackingResponse,
          { status: 200 }
        );
      }
    }

    // Cleanup old idempotency entries (run periodically)
    if (Math.random() < 0.1) {
      cleanupIdempotencyCache();
    }

    // Extract client information
    const headers = request.headers;
    const clientIp = getClientIp(headers);
    const userAgent = headers.get('user-agent') || undefined;

    // Hash all PII using SHA-256
    const hashedUserData = {
      em: payload.email ? [hashEmail(payload.email)].filter(Boolean) as string[] : undefined,
      ph: payload.phone ? [hashPhone(payload.phone)].filter(Boolean) as string[] : undefined,
      fn: hashSHA256(payload.firstName),
      ln: hashSHA256(payload.lastName),
      ct: hashSHA256(payload.city),
      st: hashSHA256(payload.state),
      zp: hashSHA256(payload.zipCode),
      country: hashSHA256(payload.country),
      fbc: payload.fbc,
      fbp: payload.fbp,
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    // Remove undefined fields
    Object.keys(hashedUserData).forEach(key => {
      if (hashedUserData[key as keyof typeof hashedUserData] === undefined) {
        delete hashedUserData[key as keyof typeof hashedUserData];
      }
    });

    // Build custom data
    const customData = {
      value: formatCurrency(payload.value),
      currency: payload.currency || 'BDT',
      content_ids: payload.contentIds,
      content_type: payload.contentType,
      content_name: payload.contentName,
      content_category: payload.contentCategory,
      contents: payload.contents,
      num_items: payload.numItems,
      order_id: payload.orderId,
    };

    // Remove undefined fields from custom data
    Object.keys(customData).forEach(key => {
      if (customData[key as keyof typeof customData] === undefined) {
        delete customData[key as keyof typeof customData];
      }
    });

    // Build Conversion API request
    const capiRequest: FacebookConversionAPIRequest = {
      data: [
        {
          event_name: payload.eventName,
          event_time: Math.floor(Date.now() / 1000), // Unix timestamp
          event_id: payload.eventId, // CRITICAL: Must match Pixel eventID
          event_source_url: payload.eventSourceUrl || request.url,
          action_source: 'website',
          user_data: hashedUserData,
          custom_data: Object.keys(customData).length > 0 ? customData : undefined,
        },
      ],
    };

    // Add test event code if in testing mode
    if (FACEBOOK_TEST_EVENT_CODE) {
      capiRequest.test_event_code = FACEBOOK_TEST_EVENT_CODE;
    }

    // Send to Facebook Conversion API
    const response = await fetch(
      `${FACEBOOK_CAPI_ENDPOINT}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capiRequest),
      }
    );

    const responseData: FacebookConversionAPIResponse = await response.json();

    // Handle Facebook API errors
    if (!response.ok) {
      console.error('[CAPI] Facebook API error:', responseData);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send event to Facebook',
          error: JSON.stringify(responseData),
        } as ServerTrackingResponse,
        { status: response.status }
      );
    }

    // Mark Purchase events as processed (idempotency)
    if (payload.eventName === 'Purchase') {
      markEventProcessed(payload.eventId);
    }

    // Success response
    console.log(`[CAPI] Event sent successfully: ${payload.eventName} (${payload.eventId})`);
    console.log(`[CAPI] FB Trace ID: ${responseData.fbtrace_id}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Event sent successfully',
        eventId: payload.eventId,
        fbTraceId: responseData.fbtrace_id,
      } as ServerTrackingResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('[CAPI] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ServerTrackingResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/facebook-capi
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = validatePixelId(FACEBOOK_PIXEL_ID) && validateAccessToken(FACEBOOK_ACCESS_TOKEN);

  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    pixelId: FACEBOOK_PIXEL_ID ? '***' + FACEBOOK_PIXEL_ID.slice(-4) : 'not set',
    testMode: !!FACEBOOK_TEST_EVENT_CODE,
  });
}
