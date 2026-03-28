import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// GET /api/admin/notifications — fetch unread notifications
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyAdminAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const onlyUnread = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const notifications = await prisma.adminNotification.findMany({
      where: onlyUnread ? { isRead: false } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        order: {
          select: { orderNumber: true, total: true },
        },
      },
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id:        n.id,
        type:      n.type,
        title:     n.title,
        message:   n.message,
        isRead:    n.isRead,
        createdAt: n.createdAt.toISOString(),
        order:     n.order
          ? { orderNumber: n.order.orderNumber, total: n.order.total.toNumber() }
          : null,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('GET /api/admin/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/notifications — mark as read
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyAdminAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { ids, markAllRead } = body as { ids?: string[]; markAllRead?: boolean };

    if (markAllRead) {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data:  { isRead: true },
      });
    } else if (ids?.length) {
      await prisma.adminNotification.updateMany({
        where: { id: { in: ids } },
        data:  { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/admin/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
