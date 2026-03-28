# Missing & Incomplete API Routes — Minsah Beauty

> Last updated: 2026-02-13
> Priority: 🔴 Critical · 🟡 Important · 🟢 Nice-to-have

---

## 1. 🔴 Payment Callbacks / Webhooks

All payment gateways redirect or callback after payment but **no callback handlers exist**.

| Missing Route | Method | What It Must Do |
|--------------|--------|-----------------|
| `/api/payments/bkash/callback` | POST | Verify payment status from bKash; update `Order.paymentStatus = COMPLETED`; create `Payment` record |
| `/api/payments/nagad/callback` | POST | Same as bKash — Nagad POST callback after redirect |
| `/api/payments/rocket/callback` | POST | Same for Rocket |
| `/api/payments/card/success` | POST/GET | SSLCommerz success redirect; verify transaction; update order |
| `/api/payments/card/fail` | POST/GET | SSLCommerz failure redirect; update order to FAILED |
| `/api/payments/card/cancel` | POST/GET | SSLCommerz cancel redirect; update order to CANCELLED |
| `/api/payments/card/ipn` | POST | SSLCommerz IPN (Instant Payment Notification) — server-to-server confirm |

**Impact:** Orders placed via any gateway other than COD are never confirmed. `Order.paymentStatus` stays `PENDING` forever.

---

## 2. 🔴 COD Order Not Persisted to Database

`/api/payments/cod/create` generates an order number but **all DB operations are commented out**. It never creates an `Order` record.

**Fix needed:** Call `/api/orders` (POST) or duplicate that logic inside the COD route before returning the redirect URL.

---

## 3. 🔴 Customer Return Submission

Customers can't submit return requests from their side — only admins can view/manage them.

| Missing Route | Method | Auth | What It Must Do |
|--------------|--------|------|-----------------|
| `/api/orders/returns` | POST | User JWT / NextAuth session | Create `Return` + `ReturnItem` records; validate order belongs to user; validate order status is DELIVERED; generate `returnNumber` |
| `/api/orders/returns` | GET | User JWT / NextAuth session | List user's own return requests |
| `/api/orders/returns/[id]` | GET | User JWT / NextAuth session | Single return detail for the user |

---

## 4. 🔴 Missing Auth on Products, Categories, Inventory, and Uploads

The following routes perform **write/delete operations with zero authentication** — any anonymous user can call them:

| Route | Methods | Fix |
|-------|---------|-----|
| `/api/products` | POST | Require admin token |
| `/api/products/[id]` | PUT, DELETE | Require admin token |
| `/api/categories` | POST | Require admin token |
| `/api/categories/[id]` | PUT, DELETE | Require admin token |
| `/api/inventory/[id]` | PATCH | Require admin token |
| `/api/inventory` | GET | Require admin token |
| `/api/admin/site-config` | GET, PUT | Require admin token |
| `/api/upload/*` (all 7 routes) | POST | Require admin token (or signed upload URL) |
| `/api/media` | POST, DELETE | Require admin token |

---

## 5. 🔴 `/api/auth/verify` is a Stub

Route returns hardcoded mock user data instead of verifying the JWT.

**Fix needed:** Replace mock response with actual `verifyAccessToken(token)` call and User lookup from DB (same pattern as `/api/auth/me`).

---

## 6. 🔴 OTP / Password Reset Uses In-Memory Storage

`/api/auth/forgot-password` and `/api/auth/verify-otp` store OTPs in a plain `Map` in memory. **OTPs are lost on every server restart / serverless cold start.**

**Fix needed:**
- Use `PasswordResetToken` model (already exists in schema) for OTP storage
- Or use Redis (already integrated) with TTL

---

## 7. 🟡 Order Detail for Customer

Users have no way to view a single order's details.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/orders/[id]` | GET | NextAuth session | Get order by `orderNumber`; verify ownership; return full detail with items, shipping, payment status |

---

## 8. 🟡 Order Cancellation by Customer

Customers cannot cancel their own pending/confirmed orders.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/orders/[id]/cancel` | POST | NextAuth session | Cancel order if status is `PENDING` or `CONFIRMED`; update `Order.status = CANCELLED`, set `cancelledAt` |

---

## 9. 🟡 Admin: Create / Manage Returns (Manual)

Admins can view and approve/reject returns but **cannot create a return on behalf of a customer**.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/admin/orders/returns` | POST | Admin token | Manually create a return request for an order (e.g., phone support case) |

---

## 10. 🟡 Admin Customer Management API

`/admin/customers/page.tsx` is a full customer management UI but **no API routes back it**:

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/admin/customers` | GET | Admin token | List users with search, filter by status/role, sort, pagination |
| `/api/admin/customers/[id]` | GET | Admin token | Full customer profile with order history, loyalty points, addresses |
| `/api/admin/customers/[id]` | PATCH | Admin token | Update customer status (ACTIVE/SUSPENDED/BANNED), role, loyalty points |

---

## 11. 🟡 Admin Products & Inventory Management API

The admin product pages likely call existing `/api/products` routes, but those have no admin auth. A proper admin-scoped endpoint is needed:

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/admin/products` | GET | Admin token | Products list with all admin-specific fields (cost price, inventory status) |
| `/api/admin/products/[id]` | GET | Admin token | Full product edit view |
| `/api/admin/products/[id]` | PATCH | Admin token | Partial update |
| `/api/admin/products/[id]` | DELETE | Admin token | Delete with audit |

---

## 12. 🟡 Wishlist API

A `WishlistItem` model and `app/wishlist/page.tsx` exist but there are **no API routes** for wishlist operations.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/wishlist` | GET | NextAuth session | List user's wishlist items with product details |
| `/api/wishlist` | POST | NextAuth session | Add product to wishlist; unique `(userId, productId)` |
| `/api/wishlist/[productId]` | DELETE | NextAuth session | Remove item from wishlist |

---

## 13. 🟡 Reviews API

A `Review` model exists with `isVerified` and `isApproved` fields but there are **no review routes**.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/reviews` | POST | NextAuth session | Submit review; validate user purchased the product (`Order` + `OrderItem` check) |
| `/api/reviews/[id]` | DELETE | NextAuth session | Delete own review |
| `/api/admin/reviews` | GET | Admin token | List reviews pending approval |
| `/api/admin/reviews/[id]` | PATCH | Admin token | Approve or reject review |

---

## 14. 🟡 Coupon Validation API

A `Coupon` model exists with full logic (percentage/fixed/free-shipping, per-user limits, date ranges) but there is **no API to validate or apply coupons at checkout**.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/coupons/validate` | POST | NextAuth session | Validate coupon code against user, cart total, usage limits, date range; return discount amount |
| `/api/admin/coupons` | GET, POST | Admin token | List and create coupons |
| `/api/admin/coupons/[id]` | GET, PATCH, DELETE | Admin token | Manage individual coupons |

---

## 15. 🟡 Admin Analytics API

`/admin/analytics/page.tsx` exists with charts and KPI widgets but **no analytics data API**.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/admin/analytics` | GET | Admin token | Revenue over time, order counts by status, top products, top customers; `period` filter (7d/30d/90d/1y) |

---

## 16. 🟡 Tracking/Events Not Persisted

`/api/tracking/events` has all ingest logic but **never writes to the database** (all DB calls are commented out). Events are logged to console and discarded.

**Fix needed:** Connect to `CustomerBehavior` or a new `AnalyticsEvent` model.

---

## 17. 🟡 Social Webhook Processors are Stubs

`/api/social/webhook` dispatches to `processMessage`, `processComment`, `processWhatsAppMessage`, `processYouTubeComment` but all four are stubs with commented-out DB operations.

**Fix needed:** Implement message storage (requires a `SocialMessage` model or similar).

---

## 18. 🟢 Order Tracking (Public)

Customer-facing order tracking by order number + email (no login required).

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/orders/track` | POST | Public | Look up order by `orderNumber` + `email`; return status, tracking number, timeline |

---

## 19. 🟢 Admin Brands API

`Brand` model is managed indirectly through product creation (auto-upsert by name) but there's no dedicated brand management endpoint.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/admin/brands` | GET, POST | Admin token | List and create brands |
| `/api/admin/brands/[id]` | PATCH, DELETE | Admin token | Update / delete brand |

---

## 20. 🟢 User Profile Update

`/api/auth/me` is read-only. Users cannot update their profile information.

| Missing Route | Method | Auth | Description |
|--------------|--------|------|-------------|
| `/api/auth/me` | PATCH | Bearer / cookie | Update firstName, lastName, phone, dateOfBirth, gender, avatar, newsletter preferences |
| `/api/auth/me/password` | POST | Bearer / cookie | Change password (requires current password) |

---

## Summary

| Priority | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 6 | Payment callbacks, COD persistence, missing auth on write routes, stub auth verify, in-memory OTP, customer return submission |
| 🟡 Important | 10 | Order detail/cancel, admin customers, admin products, wishlist, reviews, coupons, analytics, tracking events persistence, social webhooks |
| 🟢 Nice-to-have | 4 | Public order tracking, brand management, user profile update, profile password change |
| **Total gaps** | **20** | |
