/**
 * bKash Payment Gateway Integration
 * Official Documentation: https://developer.bka.sh/
 */

interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseURL: string;
  sandboxMode: boolean;
}

interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashCreatePaymentRequest {
  amount: number;
  merchantInvoiceNumber: string;
  intent: 'sale' | 'authorization';
  currency?: string;
}

interface BkashCreatePaymentResponse {
  paymentID: string;
  createTime: string;
  orgLogo: string;
  orgName: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL?: string;
}

class BkashPaymentGateway {
  private config: BkashConfig;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.config = {
      appKey: process.env.BKASH_APP_KEY || '',
      appSecret: process.env.BKASH_APP_SECRET || '',
      username: process.env.BKASH_USERNAME || '',
      password: process.env.BKASH_PASSWORD || '',
      baseURL: process.env.BKASH_SANDBOX === 'true'
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta',
      sandboxMode: process.env.BKASH_SANDBOX === 'true'
    };
  }

  /**
   * Get auth token from bKash
   */
  private async getToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    try {
      const response = await fetch(`${this.config.baseURL}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': this.config.username,
          'password': this.config.password
        },
        body: JSON.stringify({
          app_key: this.config.appKey,
          app_secret: this.config.appSecret
        })
      });

      const data: BkashTokenResponse = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(`bKash token error: ${data.statusMessage}`);
      }

      // Cache token (expires in 1 hour, we refresh at 55 minutes)
      this.tokenCache = {
        token: data.id_token,
        expiresAt: Date.now() + (55 * 60 * 1000)
      };

      return data.id_token;
    } catch (error) {
      console.error('bKash token error:', error);
      throw new Error('Failed to get bKash authentication token');
    }
  }

  /**
   * Create payment request
   */
  async createPayment(params: {
    amount: number;
    orderNumber: string;
    intent?: 'sale' | 'authorization';
  }): Promise<BkashCreatePaymentResponse> {
    try {
      const token = await this.getToken();

      const payload: BkashCreatePaymentRequest = {
        amount: params.amount,
        currency: 'BDT',
        intent: params.intent || 'sale',
        merchantInvoiceNumber: params.orderNumber
      };

      const response = await fetch(`${this.config.baseURL}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.config.appKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.paymentID) {
        throw new Error(data.statusMessage || 'Failed to create payment');
      }

      return data;
    } catch (error) {
      console.error('bKash create payment error:', error);
      throw error;
    }
  }

  /**
   * Execute payment after user approval
   */
  async executePayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseURL}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.config.appKey
        },
        body: JSON.stringify({ paymentID })
      });

      const data = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(data.statusMessage || 'Payment execution failed');
      }

      return data;
    } catch (error) {
      console.error('bKash execute payment error:', error);
      throw error;
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseURL}/tokenized/checkout/payment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.config.appKey
        },
        body: JSON.stringify({ paymentID })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('bKash query payment error:', error);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(params: {
    paymentID: string;
    amount: number;
    trxID: string;
    sku: string;
    reason: string;
  }): Promise<any> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseURL}/tokenized/checkout/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.config.appKey
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('bKash refund error:', error);
      throw error;
    }
  }
}

export const bkash = new BkashPaymentGateway();
export default bkash;
