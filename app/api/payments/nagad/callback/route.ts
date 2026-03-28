import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@/generated/prisma/client';
import nagad from '@/lib/payments/nagad';
import {
  completeGatewayPayment,
  failGatewayPayment,
  getCallbackValue,
  getGatewayOrderContextByTransactionId,
  parseGatewayCallbackPayload,
} from '@/lib/payments/gatewayCallbacks';

function buildRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

async function handleCallback(request: NextRequest) {
  const payload = await parseGatewayCallbackPayload(request);
  const paymentReferenceId = getCallbackValue(payload, [
    'payment_ref_id',
    'paymentReferenceId',
    'paymentID',
    'payment_id',
  ]);

  if (!paymentReferenceId) {
    return NextResponse.json(
      { success: false, message: 'Payment reference is required' },
      { status: 400 },
    );
  }

  const context = await getGatewayOrderContextByTransactionId('nagad', paymentReferenceId);
  if (!context) {
    return NextResponse.json(
      { success: false, message: 'Payment not found' },
      { status: 404 },
    );
  }

  try {
    const verification = await nagad.verifyPayment(paymentReferenceId);
    const verificationText = [
      verification?.status,
      verification?.statusCode,
      verification?.paymentStatus,
      verification?.message,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const isSuccessful =
      verification?.success === true ||
      verificationText.includes('success') ||
      verificationText.includes('completed') ||
      verificationText.includes('0000') ||
      verificationText.includes('000');

    if (!isSuccessful) {
      await failGatewayPayment({
        context,
        method: 'nagad',
        paymentStatus: PaymentStatus.FAILED,
        transactionId: paymentReferenceId,
        gatewayResponse: {
          callbackPayload: payload,
          verification,
        },
      });

      return buildRedirect(
        request,
        `/checkout/payment/nagad?status=failed&orderNumber=${context.order.orderNumber}`,
      );
    }

    await completeGatewayPayment({
      context,
      method: 'nagad',
      transactionId: paymentReferenceId,
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
      method: 'nagad',
      paymentStatus: PaymentStatus.FAILED,
      transactionId: paymentReferenceId,
      gatewayResponse: {
        callbackPayload: payload,
        error: error instanceof Error ? error.message : 'Nagad callback failed',
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
