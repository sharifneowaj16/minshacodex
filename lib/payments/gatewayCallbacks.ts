import { NextRequest } from 'next/server';
import { PaymentStatus } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { failOrderAndRestoreStock } from '@/lib/payments/orderPersistence';

type PaymentContext = {
  id: string;
  transactionId: string | null;
  gatewayResponse: unknown;
} | null;

type GatewayOrderContext = {
  order: {
    id: string;
    orderNumber: string;
    total: any;
    status: string;
    paymentStatus: PaymentStatus;
    paidAt: Date | null;
  };
  payment: PaymentContext;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toStringRecord(value: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined && entry !== null)
      .map(([key, entry]) => [key, String(entry)]),
  );
}

export function getCallbackValue(
  payload: Record<string, string>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (value) {
      return value;
    }
  }

  return null;
}

export async function parseGatewayCallbackPayload(
  request: NextRequest,
): Promise<Record<string, string>> {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  if (request.method === 'GET' || request.method === 'HEAD') {
    return query;
  }

  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      return {
        ...query,
        ...toStringRecord((body as Record<string, unknown>) || {}),
      };
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      return {
        ...query,
        ...Object.fromEntries(
          Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
        ),
      };
    }

    const text = await request.text();
    if (text) {
      return {
        ...query,
        ...Object.fromEntries(new URLSearchParams(text).entries()),
      };
    }
  } catch {
    return query;
  }

  return query;
}

export async function getGatewayOrderContextByOrderNumber(
  orderNumber: string,
  method: string,
): Promise<GatewayOrderContext | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      paymentStatus: true,
      paidAt: true,
      payments: {
        where: { method },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          transactionId: true,
          gatewayResponse: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
    },
    payment: order.payments[0] || null,
  };
}

export async function getGatewayOrderContextByTransactionId(
  method: string,
  transactionId: string,
): Promise<GatewayOrderContext | null> {
  const payment = await prisma.payment.findFirst({
    where: {
      method,
      transactionId,
    },
    select: {
      id: true,
      transactionId: true,
      gatewayResponse: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          paidAt: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  return {
    order: payment.order,
    payment: {
      id: payment.id,
      transactionId: payment.transactionId,
      gatewayResponse: payment.gatewayResponse,
    },
  };
}

export async function completeGatewayPayment({
  context,
  method,
  transactionId,
  gatewayResponse,
}: {
  context: GatewayOrderContext;
  method: string;
  transactionId?: string | null;
  gatewayResponse?: Record<string, unknown>;
}) {
  if (
    context.order.paymentStatus === PaymentStatus.COMPLETED ||
    context.order.status === 'CANCELLED' ||
    context.order.paymentStatus === PaymentStatus.FAILED ||
    context.order.paymentStatus === PaymentStatus.CANCELLED
  ) {
    return context.order;
  }

  const mergedGatewayResponse = {
    ...toRecord(context.payment?.gatewayResponse),
    ...(gatewayResponse || {}),
  };

  await prisma.$transaction(async (tx) => {
    if (context.payment) {
      await tx.payment.update({
        where: { id: context.payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: transactionId ?? context.payment.transactionId,
          gatewayResponse: mergedGatewayResponse,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: context.order.id,
          method,
          status: PaymentStatus.COMPLETED,
          amount: context.order.total,
          transactionId: transactionId || null,
          gatewayResponse: mergedGatewayResponse,
        },
      });
    }

    await tx.order.update({
      where: { id: context.order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: context.order.paidAt ?? new Date(),
      },
    });
  });

  return context.order;
}

export async function failGatewayPayment({
  context,
  method,
  paymentStatus = PaymentStatus.FAILED,
  transactionId,
  gatewayResponse,
}: {
  context: GatewayOrderContext;
  method: string;
  paymentStatus?: PaymentStatus;
  transactionId?: string | null;
  gatewayResponse?: Record<string, unknown>;
}) {
  if (context.order.paymentStatus === PaymentStatus.COMPLETED) {
    return context.order;
  }

  if (context.order.paymentStatus !== PaymentStatus.COMPLETED) {
    const mergedGatewayResponse = {
      ...toRecord(context.payment?.gatewayResponse),
      ...(gatewayResponse || {}),
    };

    if (context.payment) {
      await prisma.payment.update({
        where: { id: context.payment.id },
        data: {
          status: paymentStatus,
          transactionId: transactionId ?? context.payment.transactionId,
          gatewayResponse: mergedGatewayResponse,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: context.order.id,
          method,
          status: paymentStatus,
          amount: context.order.total,
          transactionId: transactionId || null,
          gatewayResponse: mergedGatewayResponse,
        },
      });
    }
  }

  await failOrderAndRestoreStock(context.order.id, paymentStatus);
  return context.order;
}
