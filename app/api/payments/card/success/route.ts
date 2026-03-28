import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@/generated/prisma/client';
import sslcommerz from '@/lib/payments/sslcommerz';
import {
  completeGatewayPayment,
  failGatewayPayment,
  getCallbackValue,
  getGatewayOrderContextByOrderNumber,
  parseGatewayCallbackPayload,
} from '@/lib/payments/gatewayCallbacks';

function buildRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function handleCardSuccess(
  request: NextRequest,
  responseMode: 'redirect' | 'json',
) {
  const payload = await parseGatewayCallbackPayload(request);
  const orderNumber = getCallbackValue(payload, ['tran_id', 'orderNumber', 'order_id']);
  const valId = getCallbackValue(payload, ['val_id', 'valId']);

  if (!orderNumber || !valId) {
    return NextResponse.json(
      { success: false, message: 'Transaction reference and validation id are required' },
      { status: 400 },
    );
  }

  const context = await getGatewayOrderContextByOrderNumber(orderNumber, 'card');
  if (!context) {
    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404 },
    );
  }

  try {
    const validation = await sslcommerz.validatePayment({ valId });
    const validationText = String(validation?.status || '').toUpperCase();
    const bankTransactionId = getCallbackValue(payload, ['bank_tran_id', 'bankTranId']) || valId;

    if (!validationText.includes('VALID')) {
      await failGatewayPayment({
        context,
        method: 'card',
        paymentStatus: PaymentStatus.FAILED,
        transactionId: bankTransactionId,
        gatewayResponse: {
          callbackPayload: payload,
          validation,
        },
      });

      if (responseMode === 'json') {
        return NextResponse.json({
          success: false,
          message: 'Payment validation failed',
          orderNumber,
        });
      }

      return buildRedirect(request, `/checkout/payment/card?status=failed&orderNumber=${orderNumber}`);
    }

    await completeGatewayPayment({
      context,
      method: 'card',
      transactionId: bankTransactionId,
      gatewayResponse: {
        callbackPayload: payload,
        validation,
      },
    });

    if (responseMode === 'json') {
      return NextResponse.json({
        success: true,
        orderNumber,
      });
    }

    return buildRedirect(request, `/checkout/order-confirmed?orderNumber=${orderNumber}`);
  } catch (error) {
    await failGatewayPayment({
      context,
      method: 'card',
      paymentStatus: PaymentStatus.FAILED,
      transactionId: valId,
      gatewayResponse: {
        callbackPayload: payload,
        error: error instanceof Error ? error.message : 'SSLCommerz callback failed',
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
  return handleCardSuccess(request, 'redirect');
}

export async function POST(request: NextRequest) {
  return handleCardSuccess(request, 'redirect');
}
