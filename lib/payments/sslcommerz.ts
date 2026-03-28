/**
 * SSLCommerz Payment Gateway Integration
 * For Credit/Debit Card payments
 * Official Documentation: https://developer.sslcommerz.com/
 */

interface SSLCommerzConfig {
  storeId: string;
  storePassword: string;
  baseURL: string;
  sandboxMode: boolean;
}

interface SSLCommerzPaymentRequest {
  amount: number;
  orderId: string;
  currency: string;
  productName: string;
  productCategory: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
}

interface SSLCommerzInitResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  gw?: {
    visa: string;
    master: string;
    amex: string;
    internetbank: string;
  };
  GatewayPageURL?: string;
  storeBanner?: string;
  storeLogo?: string;
  desc?: string;
  is_direct_pay_enable?: string;
}

class SSLCommerzPaymentGateway {
  private config: SSLCommerzConfig;

  constructor() {
    this.config = {
      storeId: process.env.SSLCOMMERZ_STORE_ID || '',
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
      baseURL: process.env.SSLCOMMERZ_SANDBOX === 'true'
        ? 'https://sandbox.sslcommerz.com'
        : 'https://securepay.sslcommerz.com',
      sandboxMode: process.env.SSLCOMMERZ_SANDBOX === 'true'
    };
  }

  /**
   * Initialize payment session
   */
  async initPayment(params: SSLCommerzPaymentRequest): Promise<SSLCommerzInitResponse> {
    try {
      const payload = new URLSearchParams({
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        total_amount: params.amount.toString(),
        currency: params.currency || 'BDT',
        tran_id: params.orderId,
        product_name: params.productName,
        product_category: params.productCategory,
        cus_name: params.customerName,
        cus_email: params.customerEmail,
        cus_add1: params.customerAddress || 'N/A',
        cus_city: params.customerCity || 'Dhaka',
        cus_country: params.customerCountry || 'Bangladesh',
        cus_phone: params.customerPhone || '01700000000',
        shipping_method: 'NO',
        product_profile: 'general',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/card/success`,
        fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/card/fail`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/card/cancel`,
        ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/card/ipn`,
      });

      const response = await fetch(`${this.config.baseURL}/gwprocess/v4/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });

      const data: SSLCommerzInitResponse = await response.json();

      if (data.status !== 'SUCCESS') {
        throw new Error(data.failedreason || 'Payment initialization failed');
      }

      return data;
    } catch (error) {
      console.error('SSLCommerz init error:', error);
      throw error;
    }
  }

  /**
   * Validate payment
   */
  async validatePayment(params: {
    valId: string;
    storeId?: string;
    storePassword?: string;
  }): Promise<any> {
    try {
      const payload = new URLSearchParams({
        val_id: params.valId,
        store_id: params.storeId || this.config.storeId,
        store_passwd: params.storePassword || this.config.storePassword,
        format: 'json'
      });

      const response = await fetch(
        `${this.config.baseURL}/validator/api/validationserverAPI.php?${payload.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SSLCommerz validate error:', error);
      throw error;
    }
  }

  /**
   * Query transaction status
   */
  async queryTransaction(transactionId: string): Promise<any> {
    try {
      const payload = new URLSearchParams({
        tran_id: transactionId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword
      });

      const response = await fetch(
        `${this.config.baseURL}/validator/api/merchantTransIDvalidationAPI.php?${payload.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SSLCommerz query error:', error);
      throw error;
    }
  }

  /**
   * Initiate refund
   */
  async initiateRefund(params: {
    bankTranId: string;
    refundAmount: number;
    refundRemarks: string;
    refundRef?: string;
  }): Promise<any> {
    try {
      const payload = new URLSearchParams({
        refund_amount: params.refundAmount.toString(),
        refund_remarks: params.refundRemarks,
        bank_tran_id: params.bankTranId,
        refe_id: params.refundRef || params.bankTranId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword
      });

      const response = await fetch(`${this.config.baseURL}/validator/api/merchantTransIDvalidationAPI.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SSLCommerz refund error:', error);
      throw error;
    }
  }

  /**
   * Check refund status
   */
  async checkRefundStatus(refundRefId: string): Promise<any> {
    try {
      const payload = new URLSearchParams({
        refund_ref_id: refundRefId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword
      });

      const response = await fetch(
        `${this.config.baseURL}/validator/api/merchantTransIDvalidationAPI.php?${payload.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SSLCommerz refund status error:', error);
      throw error;
    }
  }
}

export const sslcommerz = new SSLCommerzPaymentGateway();
export default sslcommerz;
