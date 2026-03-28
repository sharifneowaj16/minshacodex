import { NextRequest, NextResponse } from 'next/server';
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
    const { amount, items, shippingAddress } = body;

    if (!Array.isArray(items) || !shippingAddress) {
      return NextResponse.json(
        { success: false, message: 'Items and shipping address are required' },
        { status: 400 }
      );
    }

    const order = await createOrderForPayment({
      userId,
      items,
      shippingAddress,
      paymentMethod: 'cod',
    });
    orderId = order.id;
    const orderTotal = order.total.toNumber();

    await createPaymentRecord({
      orderId: order.id,
      method: 'cod',
      amount: orderTotal,
      status: PaymentStatus.PENDING,
      gatewayResponse: {
        requestedAmount: orderTotal,
        submittedAmount: amount != null ? Number(amount) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      paymentMethod: 'cod',
      message: 'Order placed successfully. Pay cash on delivery.',
      redirectURL: `/checkout/order-confirmed?orderNumber=${order.orderNumber}`
    });
  } catch (error) {
    if (orderId) {
      await failOrderAndRestoreStock(orderId).catch(() => undefined);
    }

    console.error('COD order API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Order placement failed'
      },
      { status: 500 }
    );
  }
}
