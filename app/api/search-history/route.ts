import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import {
  getTrackingReadDeviceId,
  getTrackingRequestContext,
  getTrackingWriteDeviceId,
  resolveExistingTrackingRecordForWrite,
  trackingDeviceRequiredResponse,
  trackingJson,
} from '@/lib/tracking/server';

// GET /api/search-history?deviceId=xxx - fetch history items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = await getTrackingRequestContext(
      request,
      searchParams.get('deviceId'),
    );

    let record = context.userId
      ? await prisma.searchHistory.findUnique({ where: { userId: context.userId } })
      : null;

    if (!record) {
      const readDeviceId = context.userId
        ? context.cookieDeviceId
        : getTrackingReadDeviceId(context);

      if (!readDeviceId) {
        if (!context.userId) {
          return trackingDeviceRequiredResponse();
        }
      } else {
        record = await prisma.searchHistory.findUnique({
          where: { deviceId: readDeviceId },
        });
      }
    }

    return trackingJson({
      deviceId:
        record?.deviceId ??
        context.cookieDeviceId ?? undefined,
      items: record ? record.items : [],
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 },
    );
  }
}

// PUT /api/search-history - upsert history items
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as {
      deviceId?: string;
      items?: Prisma.InputJsonValue[];
    };

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 },
      );
    }

    const context = await getTrackingRequestContext(request, body.deviceId);
    const candidateDeviceId = getTrackingWriteDeviceId(context);
    const { deviceId, existing } = await resolveExistingTrackingRecordForWrite({
      userId: context.userId,
      deviceId: candidateDeviceId,
      findByUserId: (userId) =>
        prisma.searchHistory.findUnique({ where: { userId } }),
      findByDeviceId: (lookupDeviceId) =>
        prisma.searchHistory.findUnique({ where: { deviceId: lookupDeviceId } }),
    });

    if (existing) {
      await prisma.searchHistory.update({
        where: { deviceId },
        data: {
          items,
          ...(context.userId ? { userId: context.userId } : {}),
        },
      });
    } else {
      await prisma.searchHistory.create({
        data: {
          deviceId,
          userId: context.userId ?? null,
          items,
        },
      });
    }

    return trackingJson({ ok: true, deviceId });
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { error: 'Failed to save search history' },
      { status: 500 },
    );
  }
}

// DELETE /api/search-history - clear history
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const context = await getTrackingRequestContext(request, body.deviceId);

    const targetDeviceId = context.userId
      ? context.cookieDeviceId
      : getTrackingReadDeviceId(context);

    if (!context.userId && !targetDeviceId) {
      return trackingDeviceRequiredResponse();
    }

    await prisma.searchHistory.updateMany({
      where: context.userId
        ? {
            OR: [
              { userId: context.userId },
              ...(targetDeviceId ? [{ deviceId: targetDeviceId }] : []),
            ],
          }
        : { deviceId: targetDeviceId! },
      data: { items: [] },
    });

    return trackingJson({
      ok: true,
      deviceId: targetDeviceId ?? context.cookieDeviceId ?? undefined,
    });
  } catch (error) {
    console.error('Error clearing search history:', error);
    return NextResponse.json(
      { error: 'Failed to clear search history' },
      { status: 500 },
    );
  }
}
