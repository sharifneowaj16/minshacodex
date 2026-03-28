import { NextRequest, NextResponse } from 'next/server';
import sslcommerz from '@/lib/payments/sslcommerz';
import { PaymentStatus } from '@/generated/prisma/client';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import {
  createOrderForPayment,
  createPaymentRecord,
  failOrderAndRestoreStock,
} from '@/lib/payments/orderPersistence';

export async function POST(request: NextRequest) {
  let orderId: string | null = null;
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, cardData, items, shippingAddress } = body;

    if (!cardData || !Array.isArray(items) || !shippingAddress) {
      return NextResponse.json(
        { success: false, message: 'Card data, items, and shipping address are required' },
        { status: 400 }
      );
    }

    const order = await createOrderForPayment({
      userId,
      items,
      shippingAddress,
      paymentMethod: 'card',
    });
    orderId = order.id;
    const orderTotal = order.total.toNumber();

    // Initialize SSLCommerz payment
    const payment = await sslcommerz.initPayment({
      amount: orderTotal,
      orderId: order.orderNumber,
      currency: 'BDT',
      productName: items.map((item: any) => item.name).join(', '),
      productCategory: 'Beauty Products',
      customerName: cardData.holder || shippingAddress?.fullName || 'Customer',
      customerEmail: shippingAddress?.email || 'customer@minsahbeauty.com',
      customerPhone: shippingAddress?.phoneNumber,
      customerAddress: shippingAddress?.address,
      customerCity: shippingAddress?.city,
      customerCountry: 'Bangladesh'
    });

    await createPaymentRecord({
      orderId: order.id,
      method: 'card',
      amount: orderTotal,
      status: PaymentStatus.PROCESSING,
      transactionId: payment.sessionkey,
      gatewayResponse: {
        sessionKey: payment.sessionkey,
        gatewayURL: payment.GatewayPageURL,
        requestedAmount: orderTotal,
        submittedAmount: amount != null ? Number(amount) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      sessionKey: payment.sessionkey,
      gatewayURL: payment.GatewayPageURL,
      orderNumber: order.orderNumber,
      message: 'Payment session created successfully'
    });
  } catch (error) {
    if (orderId) {
      await failOrderAndRestoreStock(orderId).catch(() => undefined);
    }

    console.error('Card payment API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      },
      { status: 500 }
    );
  }
}
