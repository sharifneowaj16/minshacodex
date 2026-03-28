import { NextRequest, NextResponse } from 'next/server';
import bkash from '@/lib/payments/bkash';
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
    const { amount, phoneNumber, items, shippingAddress } = body;

    // Validate required fields
    if (!phoneNumber || !Array.isArray(items) || !shippingAddress) {
      return NextResponse.json(
        { success: false, message: 'Phone number, items, and shipping address are required' },
        { status: 400 }
      );
    }

    const order = await createOrderForPayment({
      userId,
      items,
      shippingAddress,
      paymentMethod: 'bkash',
    });
    orderId = order.id;
    const orderTotal = order.total.toNumber();

    // Create payment with bKash
    const payment = await bkash.createPayment({
      amount: orderTotal,
      orderNumber: order.orderNumber,
      intent: 'sale'
    });

    await createPaymentRecord({
      orderId: order.id,
      method: 'bkash',
      amount: orderTotal,
      status: PaymentStatus.PROCESSING,
      transactionId: payment.paymentID,
      gatewayResponse: {
        paymentID: payment.paymentID,
        bkashURL: payment.bkashURL,
        requestedAmount: orderTotal,
        submittedAmount: amount != null ? Number(amount) : undefined,
        phoneNumber,
      },
    });

    return NextResponse.json({
      success: true,
      paymentID: payment.paymentID,
      bkashURL: payment.bkashURL,
      orderNumber: order.orderNumber,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    if (orderId) {
      await failOrderAndRestoreStock(orderId).catch(() => undefined);
    }

    console.error('bKash payment API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      },
      { status: 500 }
    );
  }
}
