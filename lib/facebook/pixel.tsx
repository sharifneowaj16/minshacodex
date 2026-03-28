/**
 * Facebook Pixel Client-side Implementation
 *
 * PRODUCTION-GRADE PIXEL INTEGRATION
 * - Loads Facebook Pixel script
 * - Generates eventID for deduplication
 * - Provides type-safe tracking functions
 * - Handles cookie consent (GDPR compliant)
 *
 * Usage:
 * 1. Add <FacebookPixel /> to your root layout
 * 2. Use trackEvent() to send events with deduplication
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import type { FacebookPixelEvent, FacebookPixelParams } from '@/types/facebook';

// Get Pixel ID from environment
const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Window.fbq is declared globally in lib/tracking/manager.ts

/**
 * Generate UUID v4 for event deduplication
 * Browser-compatible version (no crypto module)
 */
export function generateEventId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get Facebook cookies (_fbp and _fbc)
 */
export function getFacebookCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};

  const cookies = document.cookie;

  const fbpMatch = cookies.match(/_fbp=([^;]+)/);
  const fbcMatch = cookies.match(/_fbc=([^;]+)/);

  return {
    fbp: fbpMatch ? fbpMatch[1] : undefined,
    fbc: fbcMatch ? fbcMatch[1] : undefined,
  };
}

/**
 * Initialize Facebook Pixel
 */
export function initFacebookPixel() {
  if (!PIXEL_ID) {
    // Pixel ID not configured - silent skip
    return;
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('init', PIXEL_ID);
    console.log('[FB Pixel] Initialized:', PIXEL_ID);
  }
}

/**
 * Track event with Facebook Pixel
 *
 * @param eventName - Facebook standard event name
 * @param params - Event parameters
 * @param eventId - Optional eventID for deduplication (auto-generated if not provided)
 * @returns eventID used (for passing to server-side CAPI)
 */
export function trackEvent(
  eventName: FacebookPixelEvent,
  params?: FacebookPixelParams,
  eventId?: string
): string {
  if (!PIXEL_ID) {
    // Pixel ID not configured - silent skip
    return '';
  }

  if (typeof window === 'undefined' || !window.fbq) {
    // Facebook Pixel not loaded - silent skip
    return '';
  }

  // Generate eventID if not provided
  const finalEventId = eventId || generateEventId();

  // Add eventID to params for deduplication
  const paramsWithEventId: FacebookPixelParams = {
    ...params,
    eventID: finalEventId,
  };

  // Send event to Facebook Pixel
  window.fbq('track', eventName, paramsWithEventId);

  console.log(`[FB Pixel] Event tracked: ${eventName}`, {
    eventID: finalEventId,
    params: paramsWithEventId,
  });

  return finalEventId;
}

/**
 * Track PageView event (usually automatic, but can be manual)
 */
export function trackPageView(): void {
  trackEvent('PageView');
}

/**
 * Track ViewContent event
 */
export function trackViewContent(params: {
  contentIds: string[];
  contentType?: 'product' | 'product_group';
  contentName?: string;
  value?: number;
  currency?: string;
}): string {
  return trackEvent('ViewContent', {
    content_ids: params.contentIds,
    content_type: params.contentType || 'product',
    content_name: params.contentName,
    value: params.value,
    currency: params.currency || 'BDT',
  });
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(params: {
  contentIds: string[];
  contentType?: 'product' | 'product_group';
  contentName?: string;
  value?: number;
  currency?: string;
}): string {
  return trackEvent('AddToCart', {
    content_ids: params.contentIds,
    content_type: params.contentType || 'product',
    content_name: params.contentName,
    value: params.value,
    currency: params.currency || 'BDT',
  });
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(params: {
  value: number;
  currency?: string;
  numItems?: number;
  contentIds?: string[];
}): string {
  return trackEvent('InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'BDT',
    num_items: params.numItems,
    content_ids: params.contentIds,
  });
}

/**
 * Track Purchase event (CLIENT-SIDE ONLY FOR PIXEL)
 * IMPORTANT: Server-side Purchase event MUST also be sent via CAPI with same eventID
 *
 * @returns eventID - MUST be sent to server for CAPI deduplication
 */
export function trackPurchase(params: {
  value: number;
  currency?: string;
  contentIds?: string[];
  numItems?: number;
  eventId?: string; // Pass this to CAPI
}): string {
  return trackEvent(
    'Purchase',
    {
      value: params.value,
      currency: params.currency || 'BDT',
      content_ids: params.contentIds,
      num_items: params.numItems,
    },
    params.eventId
  );
}

/**
 * Send event to server-side CAPI
 *
 * @param eventName - Event name
 * @param eventId - Event ID (from Pixel)
 * @param userData - User data (will be hashed server-side)
 * @param customData - Custom event data
 */
export async function sendToServerCAPI(params: {
  eventName: FacebookPixelEvent;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: 'product' | 'product_group';
  contentName?: string;
  contentCategory?: string;
  contents?: Array<{ id: string; quantity: number; price: number }>;
  numItems?: number;
  orderId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cookies = getFacebookCookies();

    const response = await fetch('/api/facebook-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: params.eventName,
        eventId: params.eventId,
        eventSourceUrl: window.location.href,
        email: params.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        city: params.city,
        state: params.state,
        zipCode: params.zipCode,
        country: params.country,
        fbc: cookies.fbc,
        fbp: cookies.fbp,
        value: params.value,
        currency: params.currency,
        contentIds: params.contentIds,
        contentType: params.contentType,
        contentName: params.contentName,
        contentCategory: params.contentCategory,
        contents: params.contents,
        numItems: params.numItems,
        orderId: params.orderId,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('[CAPI] Server-side tracking failed:', result);
      return { success: false, error: result.message };
    }

    console.log('[CAPI] Server-side event sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('[CAPI] Failed to send server-side event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Facebook Pixel Component
 * Add this to your root layout
 */
export function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // Track PageView on route change
    if (window.fbq) {
      trackPageView();
    }
  }, [pathname]);

  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Facebook Pixel Base Code */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* Facebook Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
