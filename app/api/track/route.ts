/**
 * GET /api/track?code=SF-XXXXXXX
 * GET /api/track?order=MB1234&phone=01XXXXXXXXX
 *
 * Public route — no auth required.
 * Customers can track by:
 *   1. Steadfast tracking code (?code=)
 *   2. Order number + phone (?order=&phone=)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  trackByTrackingCode,
  trackByInvoice,
  getSteadfastStatusLabel,
  getSteadfastStatusColor,
  SteadfastError,
} from '@/lib/steadfast/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingCode = searchParams.get('code');
  const orderNumber = searchParams.get('order');
  const phone = searchParams.get('phone');

  // ── Validation ────────────────────────────────────────────────────────────
  if (!trackingCode && (!orderNumber || !phone)) {
    return NextResponse.json(
      {
        error:
          'Provide either ?code= (tracking code) or ?order= + ?phone= (order number + phone)',
      },
      { status: 400 }
    );
  }

  try {
    // ── Lookup by tracking code ───────────────────────────────────────────
    if (trackingCode) {
      // Find order in our DB first
      const order = await prisma.order.findFirst({
        where: { steadfastTrackingCode: trackingCode },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          steadfastStatus: true,
          steadfastTrackingCode: true,
          steadfastSentAt: true,
          createdAt: true,
          shippedAt: true,
          deliveredAt: true,
          total: true,
          items: {
            select: { name: true, quantity: true },
            take: 5,
          },
        },
      });

      // Also fetch live status from Steadfast
      let liveStatus: string | null = null;
      try {
        const trackResult = await trackByTrackingCode(trackingCode);
        liveStatus = trackResult.delivery_status;

        // Update our DB silently if status changed
        if (order && liveStatus && liveStatus !== order.steadfastStatus) {
          await prisma.order.update({
            where: { id: order.id },
            data: { steadfastStatus: liveStatus },
          }).catch(() => {}); // Non-blocking
        }
      } catch {
        // Steadfast might not find it if very new — use DB status
        liveStatus = order?.steadfastStatus ?? null;
      }

      const status = liveStatus ?? order?.steadfastStatus ?? 'unknown';

      return NextResponse.json({
        found: !!order,
        trackingCode,
        orderNumber: order?.orderNumber,
        steadfastStatus: status,
        statusLabel: getSteadfastStatusLabel(status),
        statusColor: getSteadfastStatusColor(status),
        timeline: buildTimeline(order, status),
        estimatedDelivery: getEstimatedDelivery(order?.shippedAt ?? null),
        orderDate: order?.createdAt,
        shippedAt: order?.shippedAt,
        deliveredAt: order?.deliveredAt,
        itemCount: order?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
      });
    }

    // ── Lookup by order number + phone ────────────────────────────────────
    if (orderNumber && phone) {
      const normalizedPhone = phone.replace(/\s+/g, '');

      const order = await prisma.order.findFirst({
        where: { orderNumber },
        include: {
          shippingAddress: {
            select: { phone: true, city: true, state: true },
          },
          user: { select: { phone: true } },
          items: { select: { name: true, quantity: true }, take: 5 },
        },
      });

      if (!order) {
        return NextResponse.json(
          { found: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      // Verify phone matches (security check)
      const addrPhone = order.shippingAddress?.phone?.replace(/\s+/g, '') ?? '';
      const userPhone = order.user?.phone?.replace(/\s+/g, '') ?? '';

      const phoneMatch =
        addrPhone.endsWith(normalizedPhone.slice(-10)) ||
        userPhone.endsWith(normalizedPhone.slice(-10));

      if (!phoneMatch) {
        return NextResponse.json(
          { found: false, error: 'Order not found or phone number does not match' },
          { status: 404 }
        );
      }

      // If dispatched to Steadfast, fetch live status
      let liveStatus = order.steadfastStatus ?? null;
      if (order.steadfastConsignmentId) {
        try {
          const trackResult = await trackByInvoice(order.orderNumber);
          liveStatus = trackResult.delivery_status;
        } catch {
          // fallback to DB value
        }
      }

      const status = liveStatus ?? mapOrderStatusToDisplay(order.status);

      return NextResponse.json({
        found: true,
        orderNumber: order.orderNumber,
        trackingCode: order.steadfastTrackingCode,
        steadfastStatus: liveStatus,
        orderStatus: order.status,
        statusLabel: liveStatus
          ? getSteadfastStatusLabel(liveStatus)
          : formatOrderStatus(order.status),
        statusColor: liveStatus
          ? getSteadfastStatusColor(liveStatus)
          : getOrderStatusColor(order.status),
        timeline: buildTimeline(order, liveStatus ?? ''),
        estimatedDelivery: getEstimatedDelivery(order.shippedAt),
        orderDate: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        deliveryCity: order.shippingAddress?.city,
        itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
        items: order.items,
      });
    }
  } catch (err) {
    if (err instanceof SteadfastError) {
      return NextResponse.json(
        { error: `Courier tracking error: ${err.message}` },
        { status: 502 }
      );
    }
    console.error('[Track] Error:', err);
    return NextResponse.json({ error: 'Tracking lookup failed' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildTimeline(
  order: {
    createdAt: Date;
    status: string;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
    steadfastSentAt?: Date | null;
  } | null,
  steadfastStatus: string
) {
  if (!order) return [];

  const steps = [
    {
      key: 'ordered',
      label: 'Order Placed',
      done: true,
      date: order.createdAt,
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      done: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      date: null,
    },
    {
      key: 'dispatched',
      label: 'Dispatched to Courier',
      done: !!order.steadfastSentAt || order.status === 'SHIPPED' || order.status === 'DELIVERED',
      date: order.steadfastSentAt ?? order.shippedAt,
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      done:
        steadfastStatus === 'partial_delivered' ||
        steadfastStatus === 'delivered' ||
        order.status === 'DELIVERED',
      date: null,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      done: steadfastStatus === 'delivered' || order.status === 'DELIVERED',
      date: order.deliveredAt,
    },
  ];

  return steps;
}

function getEstimatedDelivery(shippedAt: Date | null): string | null {
  if (!shippedAt) return null;
  const estimated = new Date(shippedAt);
  estimated.setDate(estimated.getDate() + 3); // Steadfast typical 1-3 days BD
  return estimated.toISOString();
}

function mapOrderStatusToDisplay(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'pending',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'cancelled',
  };
  return map[status] ?? 'unknown';
}

function formatOrderStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-600',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}
