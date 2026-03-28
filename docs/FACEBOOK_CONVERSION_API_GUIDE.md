# Facebook Conversion API + Pixel Implementation Guide

## 🎯 PRODUCTION-GRADE HYBRID TRACKING SYSTEM

This guide covers the complete implementation of Facebook Conversion API (CAPI) + Pixel with strict deduplication for your e-commerce website.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Setup Instructions](#setup-instructions)
3. [Testing & Debugging](#testing--debugging)
4. [Implementation Examples](#implementation-examples)
5. [Security & Compliance](#security--compliance)
6. [Common Mistakes](#common-mistakes)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                             │
├──────────────────────────────────────────────────────────────┤
│  Facebook Pixel (fbq)                                         │
│  • Generates eventID (UUID v4)                                │
│  • Sends: PageView, ViewContent, AddToCart                    │
│  • Stores: _fbp, _fbc cookies                                 │
│                           │                                    │
│                           ▼                                    │
│  User Purchase ──────────────────┐                            │
└───────────────────────────────────┼────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                 YOUR NEXT.JS SERVER                           │
├──────────────────────────────────────────────────────────────┤
│  /api/facebook-capi                                           │
│  • Receives: eventID + user data + order data                 │
│  • Hashes PII with SHA-256                                    │
│  • Sends to Meta CAPI (same eventID)                          │
│                           │                                    │
│                           ▼                                    │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              META CONVERSION API                              │
├──────────────────────────────────────────────────────────────┤
│  Deduplication Engine                                         │
│  • Matches: Pixel eventID === CAPI event_id                   │
│  • Deduplicates: Keeps 1 event if IDs match                   │
│  • Reports: Accurate conversion data to Ad Manager            │
└──────────────────────────────────────────────────────────────┘
```

**Key Points:**
- ✅ Pixel tracks ALL events (PageView, ViewContent, AddToCart, Purchase)
- ✅ CAPI tracks ONLY critical events (mainly Purchase)
- ✅ Same `eventID` used by both = automatic deduplication
- ✅ Server-side = no ad blockers, more accurate
- ✅ Client-side = captures browsing behavior

---

## 🚀 Setup Instructions

### Step 1: Get Facebook Pixel ID & Access Token

#### 1.1 Create/Find Your Pixel ID

1. Go to **Meta Events Manager**: https://business.facebook.com/events_manager2
2. Select your **Business** → **Data Sources** → **Pixel**
3. If no pixel exists, click **Create Pixel**
4. Copy your **Pixel ID** (15-16 digit number, e.g., `1234567890123456`)

#### 1.2 Generate Conversion API Access Token

1. In Events Manager, go to **Settings** tab
2. Click **Conversions API** section
3. Click **Generate Access Token**
4. Copy the token (starts with `EAAx...`, ~200+ characters)
5. **CRITICAL**: Keep this secret! Never commit to Git or expose to client.

### Step 2: Configure Environment Variables

1. Create `.env.local` file in your project root:

```bash
# Facebook Pixel ID (PUBLIC - visible in client-side code)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456

# Facebook Conversion API Access Token (SECRET - server-side only)
FACEBOOK_CONVERSION_API_TOKEN=EAAx...your_token_here

# Optional: Test Event Code (for testing in Events Manager)
FACEBOOK_TEST_EVENT_CODE=TEST12345
```

2. **For Production (Vercel/etc.):**
   - Add these as **Environment Variables** in your hosting dashboard
   - For `FACEBOOK_CONVERSION_API_TOKEN`: Mark as **Secret** (encrypted)

### Step 3: Verify Installation

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console and check for:
   ```
   [FB Pixel] Initialized: 1234567890123456
   [FB Pixel] Event tracked: PageView
   ```

3. Visit the health check endpoint:
   ```
   http://localhost:3000/api/facebook-capi
   ```

   Should return:
   ```json
   {
     "status": "ok",
     "configured": true,
     "pixelId": "***3456",
     "testMode": true
   }
   ```

---

## 🧪 Testing & Debugging

### Method 1: Meta Events Manager Test Events

**This is the OFFICIAL way to test before going live.**

1. **Get Test Event Code:**
   - Go to Meta Events Manager → Your Pixel → **Test Events** tab
   - Click **Test Server Events**
   - Copy the **Test Event Code** (e.g., `TEST12345`)
   - Add to `.env.local`:
     ```
     FACEBOOK_TEST_EVENT_CODE=TEST12345
     ```

2. **Send Test Events:**
   - Restart your dev server
   - Place a test order on your checkout page
   - Events will appear in **Test Events** tab in real-time

3. **Verify Deduplication:**
   - You should see **TWO** events with the **SAME event_id**:
     - One from **Pixel (Browser)**
     - One from **Conversions API (Server)**
   - Meta will show **"Matched"** status
   - Only **1 conversion** will be counted (deduplicated)

4. **Check Event Quality:**
   - Event Match Quality Score should be **8.0+** (out of 10)
   - If < 7.0, you're missing customer data (email, phone, etc.)

### Method 2: Browser Console Debugging

1. Open browser DevTools → **Console** tab
2. Look for logs:
   ```
   [FB Pixel] Event tracked: Purchase { eventID: "abc-123", value: 90.96, ... }
   [CAPI] Server-side event sent successfully: { fbTraceId: "xyz..." }
   ```

3. Check **Network** tab:
   - Filter by `facebook.com` → Should see Pixel requests
   - Filter by `facebook-capi` → Should see your API requests

### Method 3: Facebook Pixel Helper (Chrome Extension)

1. Install **Facebook Pixel Helper** extension
2. Visit your website
3. Click the extension icon → Shows all fired events
4. Look for ✅ green checkmarks (no errors)

### Method 4: Meta's Test Request Tool

1. After sending an event, grab the `fbtrace_id` from the response
2. Go to: https://business.facebook.com/events_manager/trace
3. Enter the `fbtrace_id`
4. See detailed diagnostic info about the event

---

## 💻 Implementation Examples

### Example 1: Track ViewContent (Product Page)

```typescript
// app/products/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/facebook/pixel';

export default function ProductPage({ product }) {
  useEffect(() => {
    // Track when user views product
    trackViewContent({
      contentIds: [product.id],
      contentName: product.name,
      contentType: 'product',
      value: product.price,
      currency: 'USD',
    });
  }, [product.id]);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  );
}
```

### Example 2: Track AddToCart

```typescript
// app/components/AddToCartButton.tsx
'use client';

import { trackAddToCart } from '@/lib/facebook/pixel';

export default function AddToCartButton({ product }) {
  const handleAddToCart = () => {
    // Add to cart logic...

    // Track the event
    trackAddToCart({
      contentIds: [product.id],
      contentName: product.name,
      value: product.price,
      currency: 'USD',
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

### Example 3: Track Purchase (Hybrid: Pixel + CAPI)

```typescript
// app/checkout/success/page.tsx
'use client';

import { generateEventId, trackPurchase, sendToServerCAPI } from '@/lib/facebook/pixel';

export default function OrderSuccessPage({ order, customer }) {
  useEffect(() => {
    const trackOrder = async () => {
      // Generate event ID for deduplication
      const eventId = generateEventId();

      // 1. Track with Pixel (client-side)
      trackPurchase({
        value: order.total,
        currency: 'USD',
        contentIds: order.items.map(item => item.id),
        numItems: order.items.length,
        eventId: eventId, // CRITICAL: Same ID for server
      });

      // 2. Track with CAPI (server-side)
      await sendToServerCAPI({
        eventName: 'Purchase',
        eventId: eventId, // CRITICAL: Same ID as Pixel
        email: customer.email,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country,
        value: order.total,
        currency: 'USD',
        contentIds: order.items.map(item => item.id),
        orderId: order.id,
        contents: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    };

    trackOrder();
  }, [order.id]);

  return <div>Thank you for your order!</div>;
}
```

---

## 🔐 Security & Compliance

### 1. PII Hashing (GDPR/CCPA Compliant)

**All Personal Identifiable Information (PII) is SHA-256 hashed before sending to Meta.**

| Data Type | Raw Value | Hashed Value |
|-----------|-----------|--------------|
| Email | `john@example.com` | `a1b2c3d4e5f6...` (64 chars) |
| Phone | `+1-555-123-4567` | `f6e5d4c3b2a1...` (64 chars) |
| Name | `John` | `9b8a7c6d5e4f...` (64 chars) |

**Client-side** = Raw data
**Server-side** = Hashed data sent to Meta
**Meta** = Receives only hashed data (privacy-safe)

### 2. Environment Variable Security

| Variable | Type | Exposure | Storage |
|----------|------|----------|---------|
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | Public | ✅ Client | `.env.local`, Vercel |
| `FACEBOOK_CONVERSION_API_TOKEN` | **Secret** | ❌ Server Only | `.env.local` (gitignored), Vercel (encrypted) |

**NEVER commit `.env.local` to Git!**

### 3. Cookie Consent (GDPR)

If you're serving EU traffic, implement cookie consent:

```typescript
// app/components/CookieConsent.tsx
'use client';

import { useState } from 'react';

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    // Enable Facebook Pixel
    if (window.fbq) {
      window.fbq('consent', 'grant');
    }
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="cookie-banner">
      <p>We use cookies to improve your experience.</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}
```

### 4. Data Retention

Facebook stores conversion data for:
- **Standard events**: 7 years
- **Custom events**: 2 years

You can request deletion via Meta Business Support.

---

## ⚠️ Common Mistakes (AND HOW TO AVOID THEM)

### Mistake #1: Different eventID for Pixel and CAPI

**❌ WRONG:**
```typescript
// Client-side
trackPurchase({ value: 100 }); // Auto-generates eventID: "abc-123"

// Server-side (different event!)
await sendToServerCAPI({
  eventName: 'Purchase',
  eventId: 'xyz-789', // ❌ Different ID!
  value: 100
});
```

**✅ CORRECT:**
```typescript
// Generate ONCE, use TWICE
const eventId = generateEventId(); // "abc-123"

// Client-side
trackPurchase({ value: 100, eventId }); // Uses "abc-123"

// Server-side
await sendToServerCAPI({
  eventName: 'Purchase',
  eventId, // ✅ Same "abc-123"!
  value: 100
});
```

### Mistake #2: Sending Purchase from Client Instead of Server

**❌ WRONG:**
```typescript
// Checkout page (client-side)
const handleCheckout = async () => {
  // User clicks "Pay Now"
  trackPurchase({ value: 100 }); // ❌ Too early!
  // Payment might fail later...
};
```

**✅ CORRECT:**
```typescript
// Server-side (after payment succeeds)
export async function POST(request: Request) {
  const payment = await stripe.charges.create(...);

  if (payment.status === 'succeeded') {
    // ✅ Only send Purchase after confirmed payment
    await sendToMetaCAPI({ eventName: 'Purchase', ... });
  }

  return Response.json({ success: true });
}
```

### Mistake #3: Not Hashing PII

**❌ WRONG:**
```typescript
await fetch('https://graph.facebook.com/.../events', {
  body: JSON.stringify({
    user_data: {
      em: 'john@example.com', // ❌ Raw email!
      ph: '+1-555-1234', // ❌ Raw phone!
    }
  })
});
```

**✅ CORRECT:**
```typescript
// Our API route automatically hashes
await sendToServerCAPI({
  email: 'john@example.com', // Will be hashed server-side
  phone: '+1-555-1234', // Will be hashed server-side
});
```

### Mistake #4: Missing _fbp and _fbc Cookies

**❌ WRONG:**
```typescript
await sendToServerCAPI({
  eventName: 'Purchase',
  // ❌ No fbp/fbc cookies!
});
```

**✅ CORRECT:**
```typescript
import { getFacebookCookies } from '@/lib/facebook/pixel';

const cookies = getFacebookCookies();

await sendToServerCAPI({
  eventName: 'Purchase',
  // ✅ Includes cookies for better matching
  // (automatically added by sendToServerCAPI)
});
```

### Mistake #5: Using Test Event Code in Production

**❌ WRONG:**
```bash
# .env.production
FACEBOOK_TEST_EVENT_CODE=TEST12345 # ❌ Test code in production!
```

**✅ CORRECT:**
```bash
# .env.local (development)
FACEBOOK_TEST_EVENT_CODE=TEST12345

# .env.production
# FACEBOOK_TEST_EVENT_CODE= (leave blank or remove)
```

---

## ⚡ Performance Optimization

### 1. Lazy Load Facebook Pixel

Already implemented in `<FacebookPixel />` component:
- Uses `next/script` with `strategy="afterInteractive"`
- Loads after page is interactive (doesn't block rendering)

### 2. Server-side CAPI is Async

```typescript
// Don't wait for CAPI response
const handlePurchase = async () => {
  const eventId = generateEventId();

  // Pixel sends immediately (non-blocking)
  trackPurchase({ eventId, value: 100 });

  // CAPI sends in background (don't await)
  sendToServerCAPI({ eventId, ... })
    .catch(err => console.error('CAPI failed:', err));

  // Show success to user immediately
  showSuccessMessage();
};
```

### 3. Idempotency (Prevents Duplicate Purchases)

Our implementation includes idempotency:
- Same `eventId` sent twice = processed once
- Uses in-memory cache (1 hour TTL)
- For distributed systems, use Redis:

```typescript
// lib/redis-idempotency.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const key = `fb:event:${eventId}`;
  const exists = await redis.get(key);
  return !!exists;
}

export async function markEventProcessed(eventId: string): Promise<void> {
  const key = `fb:event:${eventId}`;
  await redis.setex(key, 3600, '1'); // 1 hour TTL
}
```

---

## 🔧 Troubleshooting

### Issue: Events not showing in Events Manager

**Check:**
1. Pixel ID is correct (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`)
2. Browser console shows `[FB Pixel] Event tracked: ...`
3. Facebook Pixel Helper extension shows green checkmarks
4. Check browser ad blockers (disable for testing)

### Issue: Server-side events failing

**Check:**
1. Access token is valid (`FACEBOOK_CONVERSION_API_TOKEN`)
2. API route returns `{ success: true }`
3. Check server logs for `[CAPI] Event sent successfully`
4. Verify `fbtrace_id` in Meta's trace tool

### Issue: Events not deduplicating

**Check:**
1. **Same `eventID`** used for both Pixel and CAPI
2. Events sent within **48 hours** of each other
3. Check Events Manager → Event Match Quality → "Matched" status

### Issue: Low Event Match Quality Score

**Improve by:**
1. Sending more customer data (email, phone, name, address)
2. Ensuring data is clean (no typos, correct formats)
3. Sending `_fbp` and `_fbc` cookies
4. Sending `client_user_agent` and `client_ip_address`

**Target Score: 8.0+ (out of 10)**

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Event Match Quality** (Events Manager → Diagnostics)
   - Target: 8.0+
   - Higher = better ad attribution

2. **Pixel vs CAPI Event Counts**
   - Should be approximately equal for critical events
   - If CAPI >> Pixel: Users have ad blockers
   - If Pixel >> CAPI: Server-side integration issue

3. **Deduplication Rate**
   - Check "Matched" events in Test Events tab
   - Should be ~90%+ for Purchase events

4. **Server-side Response Times**
   - Monitor `/api/facebook-capi` latency
   - Should be < 500ms

---

## 🎓 Best Practices Summary

✅ **DO:**
- Generate `eventID` once, use for both Pixel and CAPI
- Send Purchase ONLY after payment confirmation (server-side)
- Hash all PII before sending to Meta
- Test with Test Event Code before going live
- Monitor Event Match Quality score
- Use environment variables for secrets
- Implement idempotency for critical events
- Send `_fbp` and `_fbc` cookies with CAPI events

❌ **DON'T:**
- Use different `eventID` for Pixel and CAPI
- Send raw PII (email, phone) to Meta
- Commit `.env.local` to Git
- Use Test Event Code in production
- Send Purchase before payment confirmation
- Block user experience waiting for CAPI response

---

## 📚 Additional Resources

- **Meta Conversion API Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Pixel Standard Events**: https://developers.facebook.com/docs/meta-pixel/reference
- **Event Match Quality**: https://www.facebook.com/business/help/765081237991954
- **Deduplication Guide**: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events

---

## 🆘 Support

If you encounter issues:
1. Check this guide's **Troubleshooting** section
2. Use Meta's Event Trace tool with `fbtrace_id`
3. Contact Meta Business Support: https://business.facebook.com/help

---

**Last Updated**: 2026-01-04
**Version**: 1.0.0
**Tested with**: Next.js 16.1.1, React 19.2.0
