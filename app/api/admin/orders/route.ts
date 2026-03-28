import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';
import { Prisma, $Enums } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders - List all orders with filters
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyAdminAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const sortBy = searchParams.get('sortBy') || 'created';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build date filter
    let dateFilter: { gte?: Date } = {};
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      dateFilter = { gte: start };
    } else if (dateRange === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      dateFilter = { gte: start };
    } else if (dateRange === 'month') {
      const start = new Date(now); start.setMonth(now.getMonth() - 1);
      dateFilter = { gte: start };
    } else if (dateRange === 'year') {
      const start = new Date(now); start.setFullYear(now.getFullYear() - 1);
      dateFilter = { gte: start };
    }

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      const upperStatus = status.toUpperCase() as $Enums.OrderStatus;
      if (Object.values($Enums.OrderStatus).includes(upperStatus)) {
        where.status = upperStatus;
      }
    }
    if (paymentStatus) {
      const upperPayment = paymentStatus.toUpperCase() as $Enums.PaymentStatus;
      if (Object.values($Enums.PaymentStatus).includes(upperPayment)) {
        where.paymentStatus = upperPayment;
      }
    }
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'updated') orderBy = { updatedAt: 'desc' };
    else if (sortBy === 'total_high') orderBy = { total: 'desc' };
    else if (sortBy === 'total_low') orderBy = { total: 'asc' };
    else if (sortBy === 'customer') orderBy = { user: { firstName: 'asc' } };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
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
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Format orders for admin UI
    const formatted = orders.map((order) => ({
      id: order.orderNumber,
      dbId: order.id,
      customer: {
        name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email,
        email: order.user.email,
        phone: order.user.phone || '',
      },
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price.toNumber(),
        image: item.product?.images?.[0]?.url || '',
      })),
      total: order.total.toNumber(),
      status: order.status.toLowerCase(),
      paymentMethod: order.paymentMethod || 'cash_on_delivery',
      paymentStatus: order.paymentStatus.toLowerCase(),
      shipping: order.shippingAddress
        ? {
            address: order.shippingAddress.street1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          }
        : { address: '', city: '', state: '', postalCode: '', country: '' },
      tracking: order.trackingNumber || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      notes: order.customerNote || undefined,
    }));

    // Stats
    const [pendingCount, processingCount, shippedCount, totalRevenue] = await Promise.all([
      prisma.order.count({ where: { status: $Enums.OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: $Enums.OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { status: $Enums.OrderStatus.SHIPPED } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: $Enums.PaymentStatus.COMPLETED } }),
    ]);

    return NextResponse.json({
      orders: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        pending: pendingCount,
        processing: processingCount,
        shipped: shippedCount,
        totalRevenue: totalRevenue._sum.total?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
