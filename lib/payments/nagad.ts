/**
 * Nagad Payment Gateway Integration
 * Official Documentation: https://nagad.com.bd/en/business/merchant-payment-gateway
 */

import crypto from 'crypto';

interface NagadConfig {
  merchantId: string;
  merchantNumber: string;
  publicKey: string;
  privateKey: string;
  baseURL: string;
  sandboxMode: boolean;
}

interface NagadInitPaymentResponse {
  sensitiveData: string;
  signature: string;
  merchantCallbackURL: string;
  challenge?: string;
}

class NagadPaymentGateway {
  private config: NagadConfig;

  constructor() {
    this.config = {
      merchantId: process.env.NAGAD_MERCHANT_ID || '',
      merchantNumber: process.env.NAGAD_MERCHANT_NUMBER || '',
      publicKey: process.env.NAGAD_PUBLIC_KEY || '',
      privateKey: process.env.NAGAD_PRIVATE_KEY || '',
      baseURL: process.env.NAGAD_SANDBOX === 'true'
        ? 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs'
        : 'https://api.mynagad.com/api/dfs',
      sandboxMode: process.env.NAGAD_SANDBOX === 'true'
    };
  }

  /**
   * Generate timestamp
   */
  private getTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * Generate random string
   */
  private generateRandomString(length: number = 40): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  /**
   * Create signature
   */
  private createSignature(data: string): string {
    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();
    return sign.sign(this.config.privateKey, 'base64');
  }

  /**
   * Encrypt sensitive data
   */
  private encryptData(data: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: this.config.publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    return encrypted.toString('base64');
  }

  /**
   * Initialize payment
   */
  async initializePayment(params: {
    amount: number;
    orderId: string;
    productDetails?: string;
    merchantCallbackURL: string;
  }): Promise<any> {
    try {
      const timestamp = this.getTimestamp();
      const orderNumber = `${this.config.merchantId}${params.orderId}`;

      // Step 1: Initialize payment
      const initURL = `${this.config.baseURL}/check-out/initialize/${this.config.merchantId}/${orderNumber}`;

      const sensitiveData = {
        merchantId: this.config.merchantId,
        datetime: timestamp,
        orderId: orderNumber,
        challenge: this.generateRandomString()
      };

      const initResponse = await fetch(initURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.58',
          'X-KM-Client-Type': 'PC_WEB'
        },
        body: JSON.stringify(sensitiveData)
      });

      const initData = await initResponse.json();

      if (!initData.sensitiveData || !initData.signature) {
        throw new Error('Nagad initialization failed');
      }

      // Step 2: Complete payment
      const completeURL = `${this.config.baseURL}/check-out/complete/${initData.paymentReferenceId}`;

      const paymentData = {
        merchantId: this.config.merchantId,
        orderId: orderNumber,
        currencyCode: '050', // BDT
        amount: params.amount.toString(),
        challenge: initData.challenge
      };

      const merchantAdditionalInfo = {
        merchantNumber: this.config.merchantNumber,
        merchantCallbackURL: params.merchantCallbackURL
      };

      const sensitivePaymentData = this.encryptData(JSON.stringify(paymentData));
      const signature = this.createSignature(JSON.stringify(paymentData));

      const completeResponse = await fetch(completeURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.58',
          'X-KM-Client-Type': 'PC_WEB'
        },
        body: JSON.stringify({
          paymentReferenceId: initData.paymentReferenceId,
          sensitiveData: sensitivePaymentData,
          signature: signature,
          merchantCallbackURL: params.merchantCallbackURL,
          additionalMerchantInfo: merchantAdditionalInfo
        })
      });

      const completeData = await completeResponse.json();

      return {
        success: true,
        paymentReferenceId: initData.paymentReferenceId,
        callbackURL: completeData.callBackUrl,
        ...completeData
      };
    } catch (error) {
      console.error('Nagad payment error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentReferenceId: string): Promise<any> {
    try {
      const verifyURL = `${this.config.baseURL}/verify/payment/${paymentReferenceId}`;

      const response = await fetch(verifyURL, {
        method: 'GET',
        headers: {
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.58',
          'X-KM-Client-Type': 'PC_WEB'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Nagad verify error:', error);
      throw error;
    }
  }
}

export const nagad = new NagadPaymentGateway();
export default nagad;
