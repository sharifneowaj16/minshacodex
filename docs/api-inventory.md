# API Route Inventory — Minsah Beauty

> Last updated: 2026-02-13
> Base path: `app/api/`

---

## 1. User Authentication

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | Public | NextAuth | NextAuth session handler |
| `/api/auth/register` | POST | Public (rate-limited 3/hr) | User, RefreshToken | Register new customer; grants 100 loyalty pts welcome bonus, 200 pts referral bonus |
| `/api/auth/login` | POST | Public (rate-limited 5/15min) | User, RefreshToken | Login; sets `auth_access_token` + `auth_refresh_token` HTTP-only cookies |
| `/api/auth/logout` | POST | Cookie (optional) | RefreshToken | Revokes refresh token, clears cookies |
| `/api/auth/me` | GET | Bearer / `auth_access_token` cookie | User | Returns full profile (preferences, loyalty points, referral code) |
| `/api/auth/refresh` | POST | `auth_refresh_token` cookie or body | RefreshToken, User | Token rotation — revokes old, issues new pair |
| `/api/auth/verify` | POST | Token in body / Authorization header | — | **Stub** — returns mock data, needs real JWT verification |
| `/api/auth/forgot-password` | POST | Public | — | Generates 6-digit OTP (returned in dev env); in-memory storage |
| `/api/auth/verify-otp` | POST | Public | — | Validates OTP (10 min TTL); returns base64 reset token |
| `/api/auth/reset-password` | POST | Reset token (body) | PasswordResetToken, User, RefreshToken | Validates token, hashes new password, revokes all refresh tokens |

---

## 2. Admin Authentication

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/admin/auth/login` | POST | Public (rate-limited 5/15min) | AdminUser, AdminRefreshToken | Login; sets `admin_access_token` + `admin_refresh_token` HTTP-only cookies |
| `/api/admin/auth/logout` | POST | `admin_access_token` cookie | AdminRefreshToken | Revokes all admin refresh tokens, clears cookies |
| `/api/admin/auth/me` | GET | `admin_access_token` cookie | AdminUser | Returns admin profile with computed permissions by role |
| `/api/admin/auth/refresh` | POST | `admin_refresh_token` cookie | AdminRefreshToken, AdminUser | Token rotation with transaction |

**Admin roles & permissions:**
- `SUPER_ADMIN` — all permissions
- `ADMIN` — products, orders (no refund), customers, analytics, settings, content
- `MANAGER` — products (view/edit), orders (view/process), customers (view), analytics, content
- `STAFF` — view-only: products, orders, customers

---

## 3. Products

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/products` | GET | Public | Product, Category, Brand, ProductImage, ProductVariant, Review | List products with filters: `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `search`, `sort`, `order`, `activeOnly`. Pagination: `page`, `limit` (default 20) |
| `/api/products` | POST | Public *(should be admin)* | Product, ProductImage, ProductVariant, Category, Brand | Create product; auto-upserts Category and Brand by name |
| `/api/products/[id]` | GET | Public | Product, ProductImage, Category, Brand, ProductVariant, Review | Single product with reviews (20), related products (4 same category), rating distribution |
| `/api/products/[id]` | PUT | Public *(should be admin)* | Product, Category, Brand | Update product; auto-upserts Category/Brand |
| `/api/products/[id]` | DELETE | Public *(should be admin)* | Product | Deletes product and all cascaded relations |

---

## 4. Categories

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/categories` | GET | Public | Category | Hierarchical 3-level list with product counts; `activeOnly` filter (default true) |
| `/api/categories` | POST | Public *(should be admin)* | Category | Create top-level category with optional subcategories and items |
| `/api/categories/[id]` | PUT | Public *(should be admin)* | Category, Product | Full hierarchy rebuild (deletes children, creates new) |
| `/api/categories/[id]` | DELETE | Public *(should be admin)* | Category, Product | Deletes category tree, unlinks all products (sets `categoryId = null`) |

---

## 5. Cart

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/cart` | GET | NextAuth session | CartItem, Product, ProductVariant | Full cart with summary (itemCount, subtotal, shipping, tax, total) |
| `/api/cart` | POST | NextAuth session | CartItem, Product, ProductVariant | Add item; validates stock, upserts on unique `(userId, productId, variantId)` |
| `/api/cart` | PUT | NextAuth session | CartItem | Update item quantity |
| `/api/cart` | DELETE | NextAuth session | CartItem | Remove item (`itemId` query param) or clear all |
| `/api/cart/[itemId]` | PATCH | Bearer / `auth_token` cookie | CartItem | Update quantity; `quantity = 0` deletes item; ownership verified |
| `/api/cart/[itemId]` | DELETE | Bearer / `auth_token` cookie | CartItem | Remove specific item; ownership verified |

---

## 6. Orders

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/orders` | POST | NextAuth session | Order, OrderItem, CartItem, Address | Create order from cart; validates address ownership; clears cart in transaction; returns `orderNumber` + `redirectURL` |
| `/api/orders` | GET | NextAuth session | Order, OrderItem, Product, Address | List current user's orders (desc by date) |
| `/api/admin/orders` | GET | `admin_access_token` cookie | Order, User, OrderItem, Product, Address | Admin order list with filters (search, status, paymentStatus, dateRange, sortBy), pagination, and stats (pending/processing/shipped counts + revenue) |
| `/api/admin/orders/[id]` | GET | `admin_access_token` cookie | Order, User, OrderItem, Product, ProductVariant, Address, Payment | Full order detail; lookup by `orderNumber` or DB `id` |
| `/api/admin/orders/[id]` | PATCH | `admin_access_token` cookie | Order | Update status, paymentStatus, trackingNumber, adminNote; auto-sets timestamp fields (shippedAt, deliveredAt, cancelledAt, paidAt); auto-generates tracking if status=shipped |

---

## 7. Returns & Refunds

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/admin/orders/returns` | GET | `admin_access_token` cookie | Return, ReturnItem, User, Order | Admin list with search/status filter; includes stats (total, pending, approved, totalRefundAmount) |
| `/api/admin/orders/returns/[id]` | PATCH | `admin_access_token` cookie | Return | Approve/reject/update return status + adminNote; lookup by `returnNumber` or DB `id` |

---

## 8. Addresses

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/addresses` | GET | Bearer / `auth_token` cookie | Address | User's addresses sorted default-first |
| `/api/addresses` | POST | Bearer / `auth_token` cookie | Address | Create address; if `isDefault=true`, unsets other defaults of same type |
| `/api/addresses/[id]` | PATCH | Bearer / `auth_token` cookie | Address | Update address; ownership verified; re-handles `isDefault` logic |
| `/api/addresses/[id]` | DELETE | Bearer / `auth_token` cookie | Address | Delete address; ownership verified |

---

## 9. Payments

All payment routes are **public** with no auth (order creation is handled separately via `/api/orders`).

| Route | Method | External Service | Description |
|-------|--------|-----------------|-------------|
| `/api/payments/cod/create` | POST | — | **Stub** — generates orderNumber, returns redirectURL; DB operations commented out |
| `/api/payments/bkash/create` | POST | bKash API | Creates bKash payment session; returns `paymentID` + `bkashURL` |
| `/api/payments/bkash/execute` | POST | bKash API | Executes bKash payment by `paymentID`; returns `transactionID` |
| `/api/payments/nagad/create` | POST | Nagad API | Initializes Nagad payment; returns `paymentID` + `nagadURL` |
| `/api/payments/rocket/create` | POST | Rocket API | Creates Rocket mobile payment; returns `paymentID` + `rocketURL` |
| `/api/payments/card/create` | POST | SSLCommerz | Initializes card payment session; returns `sessionKey` + `gatewayURL` |

---

## 10. Inventory

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/inventory` | GET | Public *(should be admin)* | Product, Category, Brand | Inventory list with status (out_of_stock/low_stock/in_stock/overstocked), value stats |
| `/api/inventory/[id]` | PATCH | Public *(should be admin)* | Product | Adjust stock: `action=add/remove/set`, `reorderLevel` |

---

## 11. Analytics & Tracking

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/behavior` | GET, PUT | Token OR `deviceId` param | CustomerBehavior | Read/write customer behavior JSON blob |
| `/api/campaign-attribution` | GET, PUT | Token OR `deviceId` param | CampaignAttribution | UTM touch-point tracking; `firstTouch` never overwritten once set |
| `/api/search-history` | GET, PUT, DELETE | Token OR `deviceId` param | SearchHistory | Read/write/clear search history JSON array |
| `/api/tracking-device` | GET, PUT | Token OR `deviceId` param | TrackingDevice | UTM device tracking; `firstTouchUtm` never overwritten once set |
| `/api/tracking/events` | POST | Public | — | **Stub** — client-side event ingestion; DB storage commented out |

---

## 12. Upload & Media

| Route | Method | Auth | Storage | Description |
|-------|--------|------|---------|-------------|
| `/api/upload` | POST | Public *(should be restricted)* | MinIO | Generic file upload; `folder` param (default `uploads`) |
| `/api/upload/product` | POST | Public *(should be restricted)* | MinIO | Product image upload |
| `/api/upload/category` | POST | Public *(should be restricted)* | MinIO | Category image upload |
| `/api/upload/brand` | POST | Public *(should be restricted)* | MinIO | Brand logo upload |
| `/api/upload/banner` | POST | Public *(should be restricted)* | MinIO | Banner image upload |
| `/api/upload/blog` | POST | Public *(should be restricted)* | MinIO | Blog image upload |
| `/api/upload/avatar` | POST | Public *(should be restricted)* | MinIO | User avatar upload |
| `/api/media` | GET | Public *(should be restricted)* | MinIO | List files by folder + stats |
| `/api/media` | POST | Public *(should be restricted)* | MinIO | Upload file |
| `/api/media` | DELETE | Public *(should be restricted)* | MinIO | Delete file by `key` |

---

## 13. Configuration

| Route | Method | Auth | DB Models | Description |
|-------|--------|------|-----------|-------------|
| `/api/admin/site-config` | GET | Public *(should be admin)* | SiteConfig | Get config value by `key` query param |
| `/api/admin/site-config` | PUT | Public *(should be admin)* | SiteConfig | Upsert config by `key` |

---

## 14. Social & External Integrations

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/facebook-capi` | POST | Public | Facebook Conversion API; SHA-256 hashes all PII; in-memory deduplication cache (1hr TTL) |
| `/api/facebook-capi` | GET | Public | Health check — returns masked pixel ID, config status |
| `/api/social/webhook` | GET | Webhook token verify | Webhook verification for Facebook/Instagram/WhatsApp/YouTube |
| `/api/social/webhook` | POST | Webhook token | Dispatches to platform handlers; **Stub** — all processors comment out DB ops |
| `/api/social/reply` | POST | — | Social reply handler (not fully analyzed) |

---

## 15. Utilities

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/health` | GET, HEAD | Public | System health: DB + Redis + MinIO with latency; HEAD returns 200/503 based on DB |
| `/api/health/minio` | GET | Public | MinIO-specific health + config info |
| `/api/log-error` | POST | Public | Client-side error logging; no DB storage, logs to logger only |

---

## Auth Quick Reference

| Auth Type | Cookie / Header | Used By |
|-----------|----------------|---------|
| NextAuth session | `next-auth.session-token` cookie | `/api/cart/*` |
| User JWT | `auth_access_token` cookie or `Authorization: Bearer` | `/api/addresses/*`, `/api/cart/[itemId]`, tracking routes |
| Admin JWT | `admin_access_token` cookie | `/api/admin/*` |
| DeviceId fallback | `deviceId` query param | Behavior, campaign-attribution, search-history, tracking-device |
| Webhook token | `hub.verify_token` | Social webhook |
| Public | None | Auth routes, products, categories, payments, health |
