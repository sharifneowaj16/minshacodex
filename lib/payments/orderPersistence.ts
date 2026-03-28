import prisma from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { AddressType, PaymentStatus } from '@/generated/prisma/client';

interface PaymentCartItemInput {
  id?: string;
  productId?: string;
  variantId?: string | null;
  quantity: number;
}

interface PaymentShippingAddressInput {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  street1?: string;
  zone?: string;
  street2?: string;
  city?: string;
  provinceRegion?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
  company?: string;
}

interface CreateOrderForPaymentInput {
  userId: string;
  items: PaymentCartItemInput[];
  shippingAddress?: PaymentShippingAddressInput;
  paymentMethod: string;
  customerNote?: string;
}

interface CreatePaymentRecordInput {
  orderId: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string | null;
  gatewayResponse?: Record<string, unknown> | null;
}

export async function createOrderForPayment({
  userId,
  items,
  shippingAddress,
  paymentMethod,
  customerNote,
}: CreateOrderForPaymentInput) {
  const normalizedItems = items
    .map((item) => ({
      productId: item.productId || item.id,
      variantId: item.variantId || null,
      quantity: item.quantity,
    }))
    .filter((item): item is { productId: string; variantId: string | null; quantity: number } => {
      return Boolean(item.productId) && item.quantity > 0;
    });

  if (!normalizedItems.length) {
    throw new Error('NO_ITEMS');
  }

  const productIds = normalizedItems.map((item) => item.productId);
  const variantIds = normalizedItems
    .filter((item) => item.variantId)
    .map((item) => item.variantId as string);

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        quantity: true,
        trackInventory: true,
        allowBackorder: true,
      },
    }),
    variantIds.length
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: {
            id: true,
            productId: true,
            price: true,
            quantity: true,
            sku: true,
            name: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
    }

    const variant = item.variantId ? variantMap.get(item.variantId) : null;
    if (item.variantId && (!variant || variant.productId !== item.productId)) {
      throw new Error(`INVALID_VARIANT:${item.variantId}`);
    }

    if (product.trackInventory && !product.allowBackorder) {
      const availableStock = variant ? variant.quantity : product.quantity;

      if (availableStock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
      }
    }
  }

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId)!;
    const variant = item.variantId ? variantMap.get(item.variantId) : null;
    const unitPrice = Number(variant?.price ?? product.price);
    const total = Number((unitPrice * item.quantity).toFixed(2));

    return {
      productId: item.productId,
      variantId: item.variantId,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      sku: variant?.sku ?? product.sku,
      price: unitPrice,
      quantity: item.quantity,
      total,
    };
  });

  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const shippingCost = 0;
  const taxAmount = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shippingCost + taxAmount).toFixed(2));

  return prisma.$transaction(async (tx) => {
    let resolvedAddressId: string | null = null;

    if (shippingAddress?.id && !/^\d+$/.test(shippingAddress.id)) {
      const existingAddress = await tx.address.findFirst({
        where: { id: shippingAddress.id, userId },
      });
      resolvedAddressId = existingAddress?.id ?? null;
    }

    if (!resolvedAddressId && shippingAddress) {
      const createdAddress = await tx.address.create({
        data: {
          userId,
          type: AddressType.SHIPPING,
          isDefault: false,
          firstName: shippingAddress.fullName || shippingAddress.firstName || '',
          lastName: shippingAddress.lastName || '',
          company: shippingAddress.landmark || shippingAddress.company || null,
          street1: shippingAddress.address || shippingAddress.street1 || '',
          street2: shippingAddress.zone || shippingAddress.street2 || null,
          city: shippingAddress.city || '',
          state: shippingAddress.provinceRegion || shippingAddress.state || '',
          postalCode: shippingAddress.postalCode || '',
          country: shippingAddress.country || 'Bangladesh',
          phone: shippingAddress.phoneNumber || shippingAddress.phone || '',
        },
      });
      resolvedAddressId = createdAddress.id;
    }

    if (!resolvedAddressId) {
      throw new Error('SHIPPING_ADDRESS_REQUIRED');
    }

    const orderNumber = `MB${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: resolvedAddressId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount: 0,
        total,
        customerNote: customerNote || null,
        items: {
          create: orderItems,
        },
      },
    });

    for (const item of orderItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        });
      } else {
        const product = productMap.get(item.productId)!;
        if (product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
    }

    return order;
  });
}

export async function createPaymentRecord({
  orderId,
  method,
  amount,
  status,
  transactionId,
  gatewayResponse,
}: CreatePaymentRecordInput) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId,
        method,
        status,
        amount,
        transactionId: transactionId || null,
        gatewayResponse:
          gatewayResponse === undefined || gatewayResponse === null
            ? undefined
            : (gatewayResponse as Prisma.InputJsonValue),
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        ...(status === 'COMPLETED' ? { paidAt: new Date() } : {}),
      },
    });

    return payment;
  });
}

export async function failOrderAndRestoreStock(
  orderId: string,
  paymentStatus: PaymentStatus = PaymentStatus.FAILED,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    return;
  }

  if (
    order.paymentStatus === PaymentStatus.COMPLETED ||
    order.paymentStatus === PaymentStatus.FAILED ||
    order.paymentStatus === PaymentStatus.CANCELLED ||
    order.status === 'CANCELLED'
  ) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const productIds = order.items
      .filter((item) => !item.variantId)
      .map((item) => item.productId);
    const productTrackInventory = new Map(
      (
        await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, trackInventory: true },
        })
      ).map((product) => [product.id, product.trackInventory]),
    );

    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
      } else {
        if (productTrackInventory.get(item.productId)) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: order.cancelledAt ?? new Date(),
        paymentStatus,
      },
    });
  });
}
