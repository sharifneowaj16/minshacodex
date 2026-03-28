import { NextRequest, NextResponse } from 'next/server';
import nagad from '@/lib/payments/nagad';
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
      paymentMethod: 'nagad',
    });
    orderId = order.id;
    const orderTotal = order.total.toNumber();
    const callbackURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/nagad/callback`;

    // Initialize Nagad payment
    const payment = await nagad.initializePayment({
      amount: orderTotal,
      orderId: order.orderNumber,
      productDetails: items.map((item: any) => item.name).join(', '),
      merchantCallbackURL: callbackURL
    });

    await createPaymentRecord({
      orderId: order.id,
      method: 'nagad',
      amount: orderTotal,
      status: PaymentStatus.PROCESSING,
      transactionId: payment.paymentReferenceId,
      gatewayResponse: {
        paymentID: payment.paymentReferenceId,
        nagadURL: payment.callbackURL,
        requestedAmount: orderTotal,
        submittedAmount: amount != null ? Number(amount) : undefined,
        phoneNumber,
      },
    });

    return NextResponse.json({
      success: true,
      paymentID: payment.paymentReferenceId,
      nagadURL: payment.callbackURL,
      orderNumber: order.orderNumber,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    if (orderId) {
      await failOrderAndRestoreStock(orderId).catch(() => undefined);
    }

    console.error('Nagad payment API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment failed'
      },
      { status: 500 }
    );
  }
}
