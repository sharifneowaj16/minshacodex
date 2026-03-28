# Payment Gateway Integration

This directory contains payment gateway integrations for Minsah Beauty e-commerce platform.

## Supported Payment Methods

### 1. bKash (Mobile Financial Service)
- **File**: `bkash.ts`
- **Official Docs**: https://developer.bka.sh/
- **Features**:
  - Tokenized checkout
  - Payment creation and execution
  - Payment verification
  - Refund support
  - Sandbox/Production modes

**Environment Variables:**
```env
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
BKASH_SANDBOX=true
```

### 2. Nagad (Mobile Financial Service)
- **File**: `nagad.ts`
- **Official Docs**: https://nagad.com.bd/en/business/merchant-payment-gateway
- **Features**:
  - Payment initialization
  - Secure payment processing with encryption
  - Payment verification
  - Sandbox/Production modes

**Environment Variables:**
```env
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY=your_public_key
NAGAD_PRIVATE_KEY=your_private_key
NAGAD_SANDBOX=true
```

### 3. Rocket (DBBL Mobile Banking)
- **File**: `rocket.ts`
- **Provider**: Dutch-Bangla Bank
- **Features**:
  - Payment creation
  - Payment verification
  - Refund support
  - Sandbox/Production modes

**Environment Variables:**
```env
ROCKET_MERCHANT_ID=your_merchant_id
ROCKET_MERCHANT_SECRET=your_merchant_secret
ROCKET_SANDBOX=true
```

### 4. SSLCommerz (Credit/Debit Cards)
- **File**: `sslcommerz.ts`
- **Official Docs**: https://developer.sslcommerz.com/
- **Features**:
  - Multi-card support (Visa, Mastercard, Amex, Discover)
  - Hosted payment gateway
  - Payment validation
  - Transaction queries
  - Refund management
  - IPN (Instant Payment Notification)

**Environment Variables:**
```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true
```

## Usage Examples

### bKash Payment

```typescript
import bkash from '@/lib/payments/bkash';

// Create payment
const payment = await bkash.createPayment({
  amount: 1000,
  orderNumber: 'MB12345',
  intent: 'sale'
});

// Execute payment after user approval
const result = await bkash.executePayment(payment.paymentID);

// Query payment status
const status = await bkash.queryPayment(payment.paymentID);
```

### Nagad Payment

```typescript
import nagad from '@/lib/payments/nagad';

// Initialize payment
const payment = await nagad.initializePayment({
  amount: 1000,
  orderId: 'MB12345',
  productDetails: 'Beauty Products',
  merchantCallbackURL: 'https://yourdomain.com/api/callback'
});

// Verify payment
const verification = await nagad.verifyPayment(payment.paymentReferenceId);
```

### Rocket Payment

```typescript
import rocket from '@/lib/payments/rocket';

// Create payment
const payment = await rocket.createPayment({
  amount: 1000,
  orderId: 'MB12345',
  customerMobile: '01712345678',
  description: 'Order payment'
});

// Verify payment
const status = await rocket.verifyPayment(payment.paymentID);
```

### Card Payment (SSLCommerz)

```typescript
import sslcommerz from '@/lib/payments/sslcommerz';

// Initialize payment
const payment = await sslcommerz.initPayment({
  amount: 1000,
  orderId: 'MB12345',
  currency: 'BDT',
  productName: 'Beauty Products',
  productCategory: 'Cosmetics',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '01712345678',
  customerAddress: '123 Main St',
  customerCity: 'Dhaka',
  customerCountry: 'Bangladesh'
});

// Redirect user to payment gateway
window.location.href = payment.GatewayPageURL;
```

## API Routes

All payment gateways have corresponding API routes in `/app/api/payments/`:

- `/api/payments/bkash/create` - Create bKash payment
- `/api/payments/bkash/execute` - Execute bKash payment
- `/api/payments/nagad/create` - Create Nagad payment
- `/api/payments/rocket/create` - Create Rocket payment
- `/api/payments/card/create` - Create card payment
- `/api/payments/cod/create` - Create Cash on Delivery order

## Security Considerations

1. **Never expose credentials** - All sensitive keys must be in environment variables
2. **Use HTTPS** - Always use secure connections in production
3. **Validate webhooks** - Verify signatures for payment callbacks
4. **Sanitize inputs** - Validate all user inputs before processing
5. **Log transactions** - Keep detailed logs for debugging and auditing
6. **Handle errors gracefully** - Provide clear error messages without exposing sensitive info

## Testing

### Sandbox Credentials

Each payment gateway provides sandbox/test credentials:

- **bKash Sandbox**: Use test credentials from bKash developer portal
- **Nagad Sandbox**: Contact Nagad for test credentials
- **Rocket Sandbox**: Contact DBBL for test credentials
- **SSLCommerz Sandbox**: Register for test store ID

### Test Cards (SSLCommerz Sandbox)

```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005
CVV: Any 3 digits
Expiry: Any future date
```

## Troubleshooting

### Common Issues

1. **Token Expiration** (bKash)
   - Tokens expire after 1 hour
   - Automatic refresh is implemented in the library

2. **Signature Mismatch** (Nagad)
   - Ensure public/private keys are correctly configured
   - Check timestamp format

3. **Payment Timeout**
   - Implement retry logic with exponential backoff
   - Set appropriate timeout values

4. **Webhook Failures**
   - Verify callback URLs are publicly accessible
   - Check SSL certificate validity
   - Implement idempotency for duplicate webhooks

## Support

For payment gateway specific issues:
- bKash: support@bka.sh
- Nagad: merchantsupport@nagad.com.bd
- Rocket: DBBL customer service
- SSLCommerz: integration@sslcommerz.com
