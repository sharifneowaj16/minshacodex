import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@/generated/prisma/client';
import rocket from '@/lib/payments/rocket';
import {
  completeGatewayPayment,
  failGatewayPayment,
  getCallbackValue,
  getGatewayOrderContextByOrderNumber,
  getGatewayOrderContextByTransactionId,
  parseGatewayCallbackPayload,
} from '@/lib/payments/gatewayCallbacks';

function buildRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

async function handleCallback(request: NextRequest) {
  const payload = await parseGatewayCallbackPayload(request);
  const statusHint = (getCallbackValue(payload, ['status', 'payment_status']) || '').toLowerCase();
  const paymentID = getCallbackValue(payload, ['payment_id', 'paymentID', 'paymentId', 'transactionId']);
  const orderNumber = getCallbackValue(payload, ['order_id', 'orderId', 'tran_id']);

  const context =
    (paymentID && (await getGatewayOrderContextByTransactionId('rocket', paymentID))) ||
    (orderNumber && (await getGatewayOrderContextByOrderNumber(orderNumber, 'rocket')));

  if (!context) {
    return NextResponse.json(
      { success: false, message: 'Payment not found' },
      { status: 404 },
    );
  }

  if (statusHint === 'cancelled' || statusHint === 'canceled') {
    await failGatewayPayment({
      context,
      method: 'rocket',
      paymentStatus: PaymentStatus.CANCELLED,
      transactionId: paymentID,
      gatewayResponse: { callbackPayload: payload },
    });

    return buildRedirect(
      request,
      `/checkout/payment/rocket?status=cancelled&orderNumber=${context.order.orderNumber}`,
    );
  }

  if (!paymentID) {
    return NextResponse.json(
      { success: false, message: 'Payment ID is required for verification' },
      { status: 400 },
    );
  }

  try {
    const verification = await rocket.verifyPayment(paymentID);
    const verificationText = [
      verification?.status,
      verification?.message,
      statusHint,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const isSuccessful =
      verification?.success === true ||
      verificationText.includes('completed') ||
      verificationText.includes('success');

    if (!isSuccessful) {
      await failGatewayPayment({
        context,
        method: 'rocket',
        paymentStatus: PaymentStatus.FAILED,
        transactionId: paymentID,
        gatewayResponse: {
          callbackPayload: payload,
          verification,
        },
      });

      return buildRedirect(
        request,
        `/checkout/payment/rocket?status=failed&orderNumber=${context.order.orderNumber}`,
      );
    }

    await completeGatewayPayment({
      context,
      method: 'rocket',
      transactionId: paymentID,
      gatewayResponse: {
        callbackPayload: payload,
        verification,
      },
    });

    return buildRedirect(
      request,
      `/checkout/order-confirmed?orderNumber=${context.order.orderNumber}`,
    );
  } catch (error) {
    await failGatewayPayment({
      context,
      method: 'rocket',
      paymentStatus: PaymentStatus.FAILED,
      transactionId: paymentID,
      gatewayResponse: {
        callbackPayload: payload,
        error: error instanceof Error ? error.message : 'Rocket callback failed',
      },
    }).catch(() => undefined);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}
