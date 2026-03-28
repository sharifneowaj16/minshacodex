import prisma from '@/lib/prisma';
import { LOYALTY_CONFIG } from '@/types/user';

function mapAddress(address: {
  id: string;
  type: 'SHIPPING' | 'BILLING';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
}) {
  return {
    id: address.id,
    type: address.type.toLowerCase(),
    isDefault: address.isDefault,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company ?? undefined,
    addressLine1: address.street1,
    addressLine2: address.street2 ?? undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? '',
  };
}

function buildTrackingTimeline(order: {
  status: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
}) {
  const timeline = [
    {
      timestamp: order.createdAt,
      status: 'pending',
      description: 'Order placed successfully',
      location: 'Online',
    },
  ];

  if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    timeline.push({
      timestamp: order.paidAt ?? order.updatedAt,
      status: 'confirmed',
      description: 'Order confirmed and queued for processing',
      location: 'Processing Center',
    });
  }

  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    timeline.push({
      timestamp: order.updatedAt,
      status: 'processing',
      description: 'Order is being prepared for shipment',
      location: 'Warehouse',
    });
  }

  if (order.shippedAt) {
    timeline.push({
      timestamp: order.shippedAt,
      status: 'shipped',
      description: 'Package shipped successfully',
      location: 'Courier Hub',
    });
  }

  if (order.deliveredAt) {
    timeline.push({
      timestamp: order.deliveredAt,
      status: 'delivered',
      description: 'Package delivered successfully',
      location: 'Delivered',
    });
  }

  if (order.cancelledAt) {
    timeline.push({
      timestamp: order.cancelledAt,
      status: 'cancelled',
      description: 'Order was cancelled',
      location: 'System',
    });
  }

  return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function getReferralLink(referralCode: string | null) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minsahbeauty.cloud';
  return `${appUrl.replace(/\/$/, '')}/referral/${referralCode ?? ''}`;
}

export async function getSettingsPageUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    dateOfBirth: user.dateOfBirth ?? undefined,
    gender: (user.gender as 'male' | 'female' | 'other' | undefined) ?? undefined,
    avatar: user.avatar ?? undefined,
    emailVerified: !!user.emailVerified,
    phoneVerified: user.phoneVerified,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? undefined,
    addresses: user.addresses.map(mapAddress),
    loyaltyPoints: user.loyaltyPoints,
    referralCode: user.referralCode ?? '',
    preferences: {
      newsletter: user.newsletter,
      smsNotifications: user.smsNotifications,
      promotions: user.promotions,
      newProducts: user.newProducts,
      orderUpdates: user.orderUpdates,
    },
  };
}

export async function getWishlistPageItems(userId: string) {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { name: true } },
        },
      },
    },
  });

  return wishlistItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0]?.url || '',
    price: item.product.price.toNumber(),
    originalPrice: item.product.compareAtPrice?.toNumber() ?? null,
    inStock: item.product.quantity > 0 && item.product.isActive,
    addedAt: item.createdAt,
    category: item.product.category?.name || 'Uncategorized',
    rating: item.product.averageRating?.toNumber() || 0,
    reviewCount: item.product.reviewCount || 0,
    discount:
      item.product.compareAtPrice && item.product.compareAtPrice.gt(item.product.price)
        ? Math.round(
            ((item.product.compareAtPrice.toNumber() - item.product.price.toNumber()) /
              item.product.compareAtPrice.toNumber()) *
              100,
          )
        : undefined,
  }));
}

export async function getReviewsPageData(userId: string) {
  const [reviews, deliveredOrders] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    }),
    prisma.order.findMany({
      where: { userId, status: 'DELIVERED' },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    }),
  ]);

  const reviewedProductIds = new Set(reviews.map((review) => review.productId));
  const reviewableProducts: Array<{
    id: string;
    name: string;
    image: string;
    orderDate: Date;
    canReview: boolean;
  }> = [];

  for (const order of deliveredOrders) {
    for (const item of order.items) {
      if (reviewedProductIds.has(item.productId)) {
        continue;
      }

      if (!reviewableProducts.some((product) => product.id === item.productId)) {
        reviewableProducts.push({
          id: item.productId,
          name: item.product?.name || item.name,
          image: item.product?.images[0]?.url || '',
          orderDate: order.createdAt,
          canReview: true,
        });
      }
    }
  }

  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      productName: review.product?.name || 'Product',
      productImage: review.product?.images[0]?.url || '',
      rating: review.rating,
      title: review.title || 'Review',
      content: review.comment || '',
      isVerified: review.isVerified,
      helpfulCount: 0,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    })),
    reviewableProducts,
  };
}

export async function getLoyaltyPageData(userId: string) {
  const [user, deliveredOrders, reviews, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId, status: 'DELIVERED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        product: { select: { name: true } },
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const referralTransactions = referrals.flatMap((referral) => {
    const transactions = [
      {
        id: `ref-signup-${referral.id}`,
        type: 'earned' as const,
        points: LOYALTY_CONFIG.points_for_referral_signup,
        description: `Referral signup: ${
          [referral.firstName, referral.lastName].filter(Boolean).join(' ') || referral.email
        }`,
        createdAt: referral.createdAt,
      },
    ];

    if (referral._count.orders > 0) {
      transactions.push({
        id: `ref-purchase-${referral.id}`,
        type: 'earned' as const,
        points: LOYALTY_CONFIG.points_for_referral_purchase,
        description: `Referral purchase bonus: ${
          [referral.firstName, referral.lastName].filter(Boolean).join(' ') || referral.email
        }`,
        createdAt: referral.createdAt,
      });
    }

    return transactions;
  });

  const orderTransactions = deliveredOrders.map((order) => ({
    id: `order-${order.id}`,
    type: 'earned' as const,
    points: Math.round(order.total.toNumber() * LOYALTY_CONFIG.points_per_bdt),
    description: `Order #${order.orderNumber}`,
    orderId: order.orderNumber,
    createdAt: order.createdAt,
  }));

  const reviewTransactions = reviews.map((review) => ({
    id: `review-${review.id}`,
    type: 'earned' as const,
    points: LOYALTY_CONFIG.points_for_review,
    description: `Product review for ${review.product.name}`,
    createdAt: review.createdAt,
  }));

  const transactions = [
    {
      id: `signup-${userId}`,
      type: 'earned' as const,
      points: LOYALTY_CONFIG.points_for_signup,
      description: 'Welcome bonus for signing up',
      createdAt: user.createdAt,
    },
    ...orderTransactions,
    ...reviewTransactions,
    ...referralTransactions,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const earnedLast30Days = transactions
    .filter((transaction) => transaction.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, transaction) => sum + transaction.points, 0);

  const inferredLifetimePoints = transactions.reduce((sum, transaction) => sum + transaction.points, 0);
  const currentPoints = user.loyaltyPoints;
  const lifetimePoints = Math.max(currentPoints, inferredLifetimePoints);
  const tier = user.role.toLowerCase();
  const nextTierPoints = tier === 'customer' ? 1000 : tier === 'vip' ? 5000 : 5000;
  const tierProgress =
    tier === 'premium'
      ? 100
      : Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

  return {
    userLoyalty: {
      currentPoints,
      lifetimePoints,
      tier,
      nextTierPoints,
      tierProgress,
      monthlyEarned: earnedLast30Days,
      pointsExpiring: 0,
      expiryDate: new Date(Date.now() + LOYALTY_CONFIG.points_expiry_days * 24 * 60 * 60 * 1000),
    },
    transactions,
  };
}

export async function getReferralPageData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      referralCode: true,
      referrals: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const referrals = user.referrals.map((referral) => {
    const hasPurchase = referral._count.orders > 0;
    const rewardPoints =
      LOYALTY_CONFIG.points_for_referral_signup +
      (hasPurchase ? LOYALTY_CONFIG.points_for_referral_purchase : 0);

    return {
      id: referral.id,
      referralCode: user.referralCode ?? '',
      referredEmail: referral.email,
      referredName:
        [referral.firstName, referral.lastName].filter(Boolean).join(' ') || referral.email,
      status: hasPurchase ? 'made_purchase' : 'signed_up',
      rewardPoints,
      createdAt: referral.createdAt,
      completedAt: hasPurchase ? referral.createdAt : undefined,
    };
  });

  const successfulReferrals = referrals.filter((referral) => referral.status === 'made_purchase');
  const totalEarned = referrals.reduce((sum, referral) => sum + referral.rewardPoints, 0);

  return {
    referralData: {
      referralCode: user.referralCode ?? '',
      referralLink: getReferralLink(user.referralCode),
      totalReferrals: referrals.length,
      successfulReferrals: successfulReferrals.length,
      pendingReferrals: 0,
      totalEarned,
      referralStats: {
        thisMonth: referrals.filter(
          (referral) => referral.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ).length,
        lastMonth: referrals.filter(
          (referral) =>
            referral.createdAt >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
            referral.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ).length,
        lifetime: successfulReferrals.length,
      },
      rewards: {
        signupBonus: LOYALTY_CONFIG.points_for_referral_signup,
        purchaseBonus: LOYALTY_CONFIG.points_for_referral_purchase,
        totalPotential:
          LOYALTY_CONFIG.points_for_referral_signup + LOYALTY_CONFIG.points_for_referral_purchase,
      },
    },
    referrals,
  };
}

export async function getOrderDetailPageData(userId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
      shippingAddress: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!order || !order.shippingAddress) {
    return null;
  }

  const shippingAddress = mapAddress({
    id: order.shippingAddress.id,
    type: order.shippingAddress.type,
    isDefault: order.shippingAddress.isDefault,
    firstName: order.shippingAddress.firstName,
    lastName: order.shippingAddress.lastName,
    company: order.shippingAddress.company,
    street1: order.shippingAddress.street1,
    street2: order.shippingAddress.street2,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    postalCode: order.shippingAddress.postalCode,
    country: order.shippingAddress.country,
    phone: order.shippingAddress.phone,
  });

  const latestPayment = order.payments[0];
  const paymentStatus =
    order.paymentStatus === 'COMPLETED'
      ? 'paid'
      : order.paymentStatus === 'REFUNDED'
      ? 'refunded'
      : order.paymentStatus === 'FAILED'
      ? 'failed'
      : 'pending';

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status.toLowerCase(),
    paymentStatus,
    paymentMethod: order.paymentMethod || latestPayment?.method || 'cod',
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.name,
      productImage: item.product?.images[0]?.url || '',
      quantity: item.quantity,
      price: item.price.toNumber(),
      totalPrice: item.total.toNumber(),
      sku: item.sku,
    })),
    subtotal: order.subtotal.toNumber(),
    shipping: order.shippingCost.toNumber(),
    tax: order.taxAmount.toNumber(),
    discount: order.discountAmount.toNumber(),
    total: order.total.toNumber(),
    currency: 'BDT',
    createdAt: order.createdAt,
    estimatedDelivery:
      order.deliveredAt || new Date(order.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
    deliveredAt: order.deliveredAt ?? undefined,
    trackingNumber: order.trackingNumber ?? order.steadfastTrackingCode ?? undefined,
    carrier: order.steadfastTrackingCode ? 'Steadfast' : 'Courier',
    shippingAddress,
    billingAddress: shippingAddress,
    tracking: buildTrackingTimeline(order),
    notes: order.customerNote ?? undefined,
  };
}
