import { NextRequest, NextResponse } from 'next/server';
import rocket from '@/lib/payments/rocket';
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
      paymentMethod: 'rocket',
    });
    orderId = order.id;
    const orderTotal = order.total.toNumber();

    // Create Rocket payment
    const payment = await rocket.createPayment({
      amount: orderTotal,
      orderId: order.orderNumber,
      customerMobile: phoneNumber,
      description: items.map((item: any) => item.name).join(', ')
    });

    await createPaymentRecord({
      orderId: order.id,
      method: 'rocket',
      amount: orderTotal,
      status: PaymentStatus.PROCESSING,
      transactionId: payment.paymentID,
      gatewayResponse: {
        paymentID: payment.paymentID,
        rocketURL: payment.rocketURL,
        requestedAmount: orderTotal,
        submittedAmount: amount != null ? Number(amount) : undefined,
        phoneNumber,
      },
    });

    return NextResponse.json({
      success: true,
      paymentID: payment.paymentID,
      rocketURL: payment.rocketURL,
      orderNumber: order.orderNumber,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    if (orderId) {
      await failOrderAndRestoreStock(orderId).catch(() => undefined);
    }

    console.error('Rocket payment API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      },
      { status: 500 }
    );
  }
}
