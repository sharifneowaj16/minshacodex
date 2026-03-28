/**
 * Rocket (DBBL) Payment Gateway Integration
 * Dutch-Bangla Bank Rocket Mobile Banking
 */

interface RocketConfig {
  merchantId: string;
  merchantSecret: string;
  baseURL: string;
  sandboxMode: boolean;
}

interface RocketPaymentRequest {
  amount: number;
  orderId: string;
  customerMobile: string;
  description?: string;
}

class RocketPaymentGateway {
  private config: RocketConfig;

  constructor() {
    this.config = {
      merchantId: process.env.ROCKET_MERCHANT_ID || '',
      merchantSecret: process.env.ROCKET_MERCHANT_SECRET || '',
      baseURL: process.env.ROCKET_SANDBOX === 'true'
        ? 'https://sandbox.rocket.com.bd/api'
        : 'https://api.rocket.com.bd/api',
      sandboxMode: process.env.ROCKET_SANDBOX === 'true'
    };
  }

  /**
   * Generate payment hash
   */
  private generateHash(data: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.config.merchantSecret)
      .update(data)
      .digest('hex');
  }

  /**
   * Create payment request
   */
  async createPayment(params: RocketPaymentRequest): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const payload = {
        merchant_id: this.config.merchantId,
        order_id: params.orderId,
        amount: params.amount.toFixed(2),
        currency: 'BDT',
        customer_mobile: params.customerMobile,
        description: params.description || 'Payment for order',
        timestamp: timestamp,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/rocket/callback`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/order-confirmed?orderNumber=${params.orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/rocket?status=cancelled&orderNumber=${params.orderId}`,
        fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/rocket?status=failed&orderNumber=${params.orderId}`
      };

      // Generate hash for security
      const hashString = `${payload.merchant_id}${payload.order_id}${payload.amount}${timestamp}`;
      const hash = this.generateHash(hashString);

      const response = await fetch(`${this.config.baseURL}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.merchantSecret}`
        },
        body: JSON.stringify({
          ...payload,
          hash: hash
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Rocket payment initiation failed');
      }

      return {
        success: true,
        paymentID: data.payment_id,
        rocketURL: data.payment_url,
        message: 'Payment initiated successfully'
      };
    } catch (error) {
      console.error('Rocket payment error:', error);

      // For sandbox/development: Return mock response
      if (this.config.sandboxMode) {
        const mockPaymentID = `ROCKET_${Date.now()}`;
        return {
          success: true,
          paymentID: mockPaymentID,
          rocketURL: null,
          message: 'Sandbox mode: Payment initiated (mock)',
          sandbox: true
        };
      }

      throw error;
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentID: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/payment/verify/${paymentID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.merchantSecret}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Rocket verify error:', error);

      // For sandbox: Return mock success
      if (this.config.sandboxMode) {
        return {
          success: true,
          status: 'completed',
          payment_id: paymentID,
          sandbox: true
        };
      }

      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(params: {
    paymentID: string;
    amount: number;
    reason?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.merchantSecret}`
        },
        body: JSON.stringify({
          payment_id: params.paymentID,
          amount: params.amount,
          reason: params.reason || 'Customer refund request'
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Rocket refund error:', error);
      throw error;
    }
  }
}

export const rocket = new RocketPaymentGateway();
export default rocket;
