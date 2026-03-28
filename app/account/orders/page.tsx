import { redirect } from 'next/navigation';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';
import { OrdersClient } from '@/components/account/orders-client';

async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
      shippingAddress: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  // Mapped to exactly match OrdersClient's internal Order interface
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    total: Number(order.total),
    createdAt: order.createdAt,          // Date — matches OrdersClient interface
    estimatedDelivery: order.deliveredAt
      ?? new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    trackingNumber: order.trackingNumber ?? undefined,
    steadfastTrackingCode: order.steadfastTrackingCode ?? undefined,
    steadfastStatus: order.steadfastStatus ?? undefined,
    userPhone: order.shippingAddress?.phone ?? undefined,
    canReview: order.status === 'DELIVERED',
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.name,
      productImage: item.product?.images?.[0]?.url ?? null,
      quantity: item.quantity,
      price: Number(item.price),
      totalPrice: Number(item.total),
    })),
  }));
}

export default async function AccountOrdersPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/orders');
  }

  const orders = await getUserOrders(userId);

  // initialOrders — exact prop name from OrdersClientProps
  return <OrdersClient initialOrders={orders} />;
}
// import { redirect } from 'next/navigation';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth/nextauth';
// import prisma from '@/lib/prisma';
// import { OrdersClient } from '@/components/account/orders-client';

// async function getUserOrders(userId: string) {
//   const orders = await prisma.order.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     include: {
//       items: {
//         include: {
//           product: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//               images: { take: 1, orderBy: { sortOrder: 'asc' } },
//             },
//           },
//         },
//       },
//       shippingAddress: true,
//       payments: { orderBy: { createdAt: 'desc' }, take: 1 },
//     },
//   });

//   return orders.map((order) => ({
//     id: order.id,
//     orderNumber: order.orderNumber,
//     status: order.status.toLowerCase(),
//     paymentStatus: order.paymentStatus.toLowerCase(),
//     paymentMethod: order.paymentMethod || 'cod',
//     total: Number(order.total),
//     subtotal: Number(order.subtotal),
//     shippingCost: Number(order.shippingCost),
//     discountAmount: Number(order.discountAmount),
//     couponCode: order.couponCode,
//     trackingNumber: order.trackingNumber,
//     createdAt: order.createdAt.toISOString(),
//     updatedAt: order.updatedAt.toISOString(),
//     shippedAt: order.shippedAt?.toISOString(),
//     deliveredAt: order.deliveredAt?.toISOString(),
//     canReview: order.status === 'DELIVERED',
//     items: order.items.map((item) => ({
//       id: item.id,
//       productId: item.productId,
//       productName: item.name,
//       productSlug: item.product?.slug || '',
//       productImage: item.product?.images?.[0]?.url || null,
//       sku: item.sku,
//       quantity: item.quantity,
//       price: Number(item.price),
//       totalPrice: Number(item.total),
//     })),
//     shippingAddress: order.shippingAddress
//       ? {
//           name: [order.shippingAddress.firstName, order.shippingAddress.lastName]
//             .filter(Boolean)
//             .join(' '),
//           street: [order.shippingAddress.street1, order.shippingAddress.street2]
//             .filter(Boolean)
//             .join(', '),
//           city: order.shippingAddress.city,
//           state: order.shippingAddress.state,
//           postalCode: order.shippingAddress.postalCode ?? '',
//           country: order.shippingAddress.country,
//           phone: order.shippingAddress.phone ?? '',
//         }
//       : null,
//   }));
// }

// export default async function AccountOrdersPage() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     redirect('/login?redirect=/account/orders');
//   }

//   const orders = await getUserOrders(session.user.id);

//   return <OrdersClient orders={orders} />;
// }
