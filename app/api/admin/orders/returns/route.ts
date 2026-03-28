import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';
import { Prisma } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders/returns - List all return requests
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

    const where: Prisma.ReturnWhereInput = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase() as Prisma.ReturnWhereInput['status'];
    }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [returns, totalCount, pendingCount, approvedCount, totalRefund] = await Promise.all([
      prisma.return.findMany({
        where,
        orderBy: { requestDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          order: {
            select: { orderNumber: true },
          },
          items: true,
        },
      }),
      prisma.return.count(),
      prisma.return.count({ where: { status: 'PENDING' } }),
      prisma.return.count({ where: { status: 'APPROVED' } }),
      prisma.return.aggregate({ _sum: { refundAmount: true } }),
    ]);

    const formatted = returns.map((ret) => ({
      id: ret.returnNumber,
      dbId: ret.id,
      orderId: ret.order.orderNumber,
      customer: {
        name: `${ret.user.firstName || ''} ${ret.user.lastName || ''}`.trim() || ret.user.email,
        email: ret.user.email,
      },
      items: ret.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price.toNumber(),
      })),
      reason: ret.reason,
      status: ret.status.toLowerCase(),
      refundAmount: ret.refundAmount.toNumber(),
      requestDate: ret.requestDate.toISOString(),
      notes: ret.adminNote || undefined,
      images: ret.images,
    }));

    return NextResponse.json({
      returns: formatted,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        totalRefundAmount: totalRefund._sum.refundAmount?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error('Admin returns GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
