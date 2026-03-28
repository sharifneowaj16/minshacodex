/**
 * POST /api/admin/shipping/steadfast/sync
 *
 * Manually refresh Steadfast status for a specific order OR
 * sync all active shipments (no body = sync all).
 *
 * Body: { orderId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';
import {
  trackByCID,
  mapSteadfastStatusToOrderStatus,
  SteadfastError,
} from '@/lib/steadfast/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const accessToken = request.cookies.get('admin_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const payload = await verifyAdminAccessToken(accessToken);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId: string | undefined = body.orderId;

  // ── Single order sync ─────────────────────────────────────────────────────
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!order.steadfastConsignmentId) {
      return NextResponse.json(
        { error: 'Order not dispatched to Steadfast yet' },
        { status: 400 }
      );
    }

    try {
      const result = await trackByCID(order.steadfastConsignmentId);
      const newStatus = result.delivery_status;
      const mappedStatus = mapSteadfastStatusToOrderStatus(newStatus);

      const updates: Record<string, unknown> = {
        steadfastStatus: newStatus,
      };

      if (mappedStatus && mappedStatus !== order.status) {
        updates.status = mappedStatus;
        if (mappedStatus === 'DELIVERED') {
          updates.deliveredAt = new Date();
        } else if (mappedStatus === 'CANCELLED') {
          updates.cancelledAt = new Date();
        }
      }

      await prisma.order.update({ where: { id: order.id }, data: updates });

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        steadfastStatus: newStatus,
        orderStatus: mappedStatus ?? order.status,
      });
    } catch (err) {
      if (err instanceof SteadfastError) {
        return NextResponse.json(
          { error: `Steadfast error: ${err.message}` },
          { status: err.statusCode ?? 502 }
        );
      }
      throw err;
    }
  }

  // ── Batch sync (all active shipments) ────────────────────────────────────
  const activeShipments = await prisma.order.findMany({
    where: {
      steadfastConsignmentId: { not: null },
      status: { in: ['SHIPPED', 'PROCESSING'] },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      steadfastConsignmentId: true,
    },
    take: 100, // Safety cap
  });

  if (activeShipments.length === 0) {
    return NextResponse.json({ success: true, updated: 0, message: 'No active shipments' });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const order of activeShipments) {
    try {
      const result = await trackByCID(order.steadfastConsignmentId!);
      const newStatus = result.delivery_status;
      const mappedStatus = mapSteadfastStatusToOrderStatus(newStatus);

      const updates: Record<string, unknown> = { steadfastStatus: newStatus };

      if (mappedStatus && mappedStatus !== order.status) {
        updates.status = mappedStatus;
        if (mappedStatus === 'DELIVERED') updates.deliveredAt = new Date();
        if (mappedStatus === 'CANCELLED') updates.cancelledAt = new Date();
      }

      await prisma.order.update({ where: { id: order.id }, data: updates });
      updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${order.orderNumber}: ${msg}`);
    }
  }

  return NextResponse.json({
    success: true,
    total: activeShipments.length,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
