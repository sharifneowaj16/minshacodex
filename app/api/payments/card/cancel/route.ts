import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@/generated/prisma/client';
import {
  failGatewayPayment,
  getCallbackValue,
  getGatewayOrderContextByOrderNumber,
  parseGatewayCallbackPayload,
} from '@/lib/payments/gatewayCallbacks';

function buildRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

async function handleCancel(request: NextRequest) {
  const payload = await parseGatewayCallbackPayload(request);
  const orderNumber = getCallbackValue(payload, ['tran_id', 'orderNumber', 'order_id']);

  if (!orderNumber) {
    return NextResponse.json(
      { success: false, message: 'Transaction reference is required' },
      { status: 400 },
    );
  }

  const context = await getGatewayOrderContextByOrderNumber(orderNumber, 'card');
  if (context) {
    await failGatewayPayment({
      context,
      method: 'card',
      paymentStatus: PaymentStatus.CANCELLED,
      transactionId: getCallbackValue(payload, ['bank_tran_id', 'bankTranId']),
      gatewayResponse: { callbackPayload: payload },
    }).catch(() => undefined);
  }

  return buildRedirect(request, `/checkout/payment/card?status=cancelled&orderNumber=${orderNumber}`);
}

export async function GET(request: NextRequest) {
  return handleCancel(request);
}

export async function POST(request: NextRequest) {
  return handleCancel(request);
}
