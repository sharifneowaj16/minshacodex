# Payment Gateway Setup Guide

Complete guide to setting up payment gateways for Minsah Beauty e-commerce platform.

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Payment Gateway Registration](#payment-gateway-registration)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

## Overview

Minsah Beauty supports the following payment methods:

- **Cash on Delivery (COD)** - No setup required
- **bKash** - Bangladesh's leading MFS
- **Nagad** - Government-backed MFS
- **Rocket** - DBBL mobile banking
- **Credit/Debit Cards** - Via SSLCommerz gateway
- **Google Pay** - Digital wallet (coming soon)

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Set Base Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
NODE_ENV=development
```

## Payment Gateway Registration

### bKash Integration

**Step 1: Register as Merchant**
1. Visit: https://www.bka.sh/merchant
2. Fill out merchant registration form
3. Submit required documents (Trade License, NID, Bank Account)
4. Wait for approval (2-5 business days)

**Step 2: Get API Credentials**
1. Login to bKash Merchant Portal
2. Navigate to "Settings" → "API Credentials"
3. Copy:
   - App Key
   - App Secret
   - Username
   - Password

**Step 3: Configure Environment**
```env
BKASH_APP_KEY=your_app_key_here
BKASH_APP_SECRET=your_app_secret_here
BKASH_USERNAME=your_username_here
BKASH_PASSWORD=your_password_here
BKASH_SANDBOX=true  # Use true for testing
```

**Documentation**: https://developer.bka.sh/docs

---

### Nagad Integration

**Step 1: Register as Merchant**
1. Visit: https://nagad.com.bd/en/business/merchant-payment-gateway
2. Contact Nagad Business team: business@nagad.com.bd
3. Submit:
   - Trade License
   - NID/Passport
   - Bank Account details
   - Website URL

**Step 2: Get API Credentials**
After approval, Nagad will provide:
- Merchant ID
- Merchant Number
- Public Key (PGP key for encryption)
- Private Key (Your generated key)

**Step 3: Generate Key Pair (if not provided)**
```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Generate public key
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

**Step 4: Configure Environment**
```env
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
Your_Public_Key_Here
-----END PUBLIC KEY-----"
NAGAD_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Your_Private_Key_Here
-----END RSA PRIVATE KEY-----"
NAGAD_SANDBOX=true
```

**Contact**: merchantsupport@nagad.com.bd

---

### Rocket Integration

**Step 1: Register with DBBL**
1. Contact Dutch-Bangla Bank
2. Request Rocket Merchant Account
3. Submit:
   - Business registration documents
   - NID/Trade License
   - Bank Account at DBBL (preferred)

**Step 2: Get Merchant Credentials**
DBBL will provide:
- Merchant ID
- Merchant Secret
- API Documentation

**Step 3: Configure Environment**
```env
ROCKET_MERCHANT_ID=your_merchant_id
ROCKET_MERCHANT_SECRET=your_merchant_secret
ROCKET_SANDBOX=true
```

**Contact**: Call 16216 or visit your nearest DBBL branch

---

### SSLCommerz (Credit/Debit Cards)

**Step 1: Register for SSLCommerz**
1. Visit: https://sslcommerz.com/
2. Click "Register as Merchant"
3. Fill registration form
4. Submit documents:
   - Trade License
   - NID (Director/Owner)
   - Bank Account details
   - Website URL

**Step 2: Account Approval**
- Review takes 2-3 business days
- May require additional verification

**Step 3: Get Store Credentials**
1. Login to SSLCommerz Dashboard
2. Navigate to "Settings" → "Store Settings"
3. Copy:
   - Store ID
   - Store Password

**Step 4: Configure Environment**
```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true
```

**Step 5: Configure Webhook URLs** (in SSLCommerz Dashboard)
```
Success URL: https://yourdomain.com/api/payments/card/success
Fail URL: https://yourdomain.com/api/payments/card/fail
Cancel URL: https://yourdomain.com/api/payments/card/cancel
IPN URL: https://yourdomain.com/api/payments/card/ipn
```

**Documentation**: https://developer.sslcommerz.com/

---

## Configuration

### 1. Database Setup (Optional but Recommended)

Create orders table to store payment transactions:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(100),
  transaction_id VARCHAR(100),
  items JSONB,
  shipping_address JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_number ON orders(order_number);
CREATE INDEX idx_payment_id ON orders(payment_id);
```

### 2. Email Configuration

For order confirmations:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@minsahbeauty.com
```

### 3. SMS Configuration (Optional)

For order notifications:

```env
SMS_API_TOKEN=your_sms_api_token
SMS_SENDER_ID=MINSAH
```

## Testing

### 1. Sandbox Mode

All payment gateways are in sandbox mode by default:

```env
BKASH_SANDBOX=true
NAGAD_SANDBOX=true
ROCKET_SANDBOX=true
SSLCOMMERZ_SANDBOX=true
```

### 2. Test Credentials

#### bKash Sandbox
- Use sandbox credentials from bKash developer portal
- Test phone: Provided in sandbox docs

#### Nagad Sandbox
- Contact Nagad for sandbox credentials
- Test scenarios provided by Nagad

#### SSLCommerz Sandbox
Test cards:
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005
CVV: Any 3 digits
Expiry: Any future date
Name: Test User
```

### 3. Test the Flow

1. Start development server:
```bash
npm run dev
```

2. Navigate to http://localhost:3000
3. Add products to cart
4. Go to checkout
5. Select a payment method
6. Complete test payment

## Production Deployment

### 1. Disable Sandbox Mode

```env
BKASH_SANDBOX=false
NAGAD_SANDBOX=false
ROCKET_SANDBOX=false
SSLCOMMERZ_SANDBOX=false
NODE_ENV=production
```

### 2. Update URLs

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Verify Webhook URLs

Ensure all callback URLs are:
- Publicly accessible
- Using HTTPS
- Pointing to production domain

### 4. Security Checklist

- [ ] All API keys in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled on domain
- [ ] Webhook signature verification enabled
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Database backups scheduled

### 5. Go Live Checklist

- [ ] Test all payment methods in sandbox
- [ ] Verify webhook callbacks work
- [ ] Test refund functionality
- [ ] Check email notifications
- [ ] Verify order status updates
- [ ] Test error handling
- [ ] Monitor logs for issues
- [ ] Keep sandbox credentials for testing

## Troubleshooting

### Common Issues

**1. bKash Token Expired**
```
Error: Token expired or invalid
Solution: Tokens auto-refresh. Check if credentials are correct.
```

**2. Nagad Signature Mismatch**
```
Error: Invalid signature
Solution: Verify public/private keys are correctly formatted
```

**3. SSLCommerz Payment Failed**
```
Error: Store ID or password invalid
Solution: Check credentials in .env.local match SSLCommerz dashboard
```

**4. Webhook Not Receiving Callbacks**
```
Error: Payment completed but order not updated
Solution:
- Verify webhook URL is publicly accessible
- Check SSL certificate is valid
- Review server logs for errors
```

### Support Contacts

- **bKash**: support@bka.sh | 16247
- **Nagad**: merchantsupport@nagad.com.bd | 16167
- **Rocket**: 16216
- **SSLCommerz**: integration@sslcommerz.com | +880 9612745745

## Additional Resources

- [bKash API Documentation](https://developer.bka.sh/)
- [Nagad Integration Guide](https://nagad.com.bd/merchant)
- [SSLCommerz Documentation](https://developer.sslcommerz.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Need Help?

For implementation support:
1. Check payment library documentation in `/lib/payments/README.md`
2. Review API routes in `/app/api/payments/`
3. Create an issue on GitHub
4. Contact dev@minsahbeauty.com
