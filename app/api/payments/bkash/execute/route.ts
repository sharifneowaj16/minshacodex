import { NextRequest, NextResponse } from 'next/server';
import bkash from '@/lib/payments/bkash';
import prisma from '@/lib/prisma';
import { PaymentStatus } from '@/generated/prisma/client';
import { failOrderAndRestoreStock } from '@/lib/payments/orderPersistence';

export async function POST(request: NextRequest) {
  let paymentID: string | null = null;
  let payment: {
    id: string;
    orderId: string;
    gatewayResponse: unknown;
  } | null = null;

  try {
    const body = await request.json();
    paymentID = body.paymentID;

    if (!paymentID) {
      return NextResponse.json(
        { success: false, message: 'Payment ID is required' },
        { status: 400 }
      );
    }

    payment = await prisma.payment.findFirst({
      where: {
        method: 'bkash',
        transactionId: paymentID,
      },
      select: {
        id: true,
        orderId: true,
        gatewayResponse: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Execute payment
    const result = await bkash.executePayment(paymentID);
    const existingGatewayResponse =
      payment.gatewayResponse &&
      typeof payment.gatewayResponse === 'object' &&
      !Array.isArray(payment.gatewayResponse)
        ? (payment.gatewayResponse as Record<string, unknown>)
        : {};

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: result.trxID,
          gatewayResponse: {
            ...existingGatewayResponse,
            paymentID,
            trxID: result.trxID,
            executedAt: new Date().toISOString(),
          },
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transactionID: result.trxID,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    if (payment) {
      const existingGatewayResponse =
        payment.gatewayResponse &&
        typeof payment.gatewayResponse === 'object' &&
        !Array.isArray(payment.gatewayResponse)
          ? (payment.gatewayResponse as Record<string, unknown>)
          : {};

      await prisma.payment
        .update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: {
              ...existingGatewayResponse,
              paymentID: paymentID ?? undefined,
              failedAt: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Payment execution failed',
            },
          },
        })
        .catch(() => undefined);

      await failOrderAndRestoreStock(payment.orderId).catch(() => undefined);
    }

    console.error('bKash execute error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Payment execution failed'
      },
      { status: 500 }
    );
  }
}
