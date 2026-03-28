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

// GET /api/tracking-device?deviceId=xxx - fetch UTM data for a device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = await getTrackingRequestContext(
      request,
      searchParams.get('deviceId'),
    );

    let record = context.userId
      ? await prisma.trackingDevice.findUnique({ where: { userId: context.userId } })
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
        record = await prisma.trackingDevice.findUnique({
          where: { deviceId: readDeviceId },
        });
      }
    }

    if (!record) {
      return trackingJson({
        deviceId: context.cookieDeviceId ?? undefined,
        firstTouchUtm: null,
        lastTouchUtm: null,
      });
    }

    return trackingJson({
      deviceId: record.deviceId,
      firstTouchUtm: record.firstTouchUtm,
      lastTouchUtm: record.lastTouchUtm,
    });
  } catch (error) {
    console.error('Error fetching tracking device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking device' },
      { status: 500 },
    );
  }
}

// PUT /api/tracking-device - upsert device UTM data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstTouchUtm, lastTouchUtm } = body as {
      deviceId?: string;
      firstTouchUtm?: Prisma.InputJsonValue;
      lastTouchUtm?: Prisma.InputJsonValue;
    };

    const context = await getTrackingRequestContext(request, body.deviceId);
    const candidateDeviceId = getTrackingWriteDeviceId(context);
    const { deviceId, existing } = await resolveExistingTrackingRecordForWrite({
      userId: context.userId,
      deviceId: candidateDeviceId,
      findByUserId: (userId) =>
        prisma.trackingDevice.findUnique({ where: { userId } }),
      findByDeviceId: (lookupDeviceId) =>
        prisma.trackingDevice.findUnique({ where: { deviceId: lookupDeviceId } }),
    });

    if (existing) {
      const updateData: Prisma.TrackingDeviceUncheckedUpdateInput = {};

      if (firstTouchUtm !== undefined && !existing.firstTouchUtm) {
        updateData.firstTouchUtm = firstTouchUtm;
      }
      if (lastTouchUtm !== undefined) {
        updateData.lastTouchUtm = lastTouchUtm;
      }
      if (context.userId) {
        updateData.userId = context.userId;
      }

      await prisma.trackingDevice.update({
        where: { deviceId },
        data: updateData,
      });
    } else {
      await prisma.trackingDevice.create({
        data: {
          deviceId,
          userId: context.userId ?? null,
          ...(firstTouchUtm !== undefined ? { firstTouchUtm } : {}),
          ...(lastTouchUtm !== undefined ? { lastTouchUtm } : {}),
        },
      });
    }

    return trackingJson({ ok: true, deviceId });
  } catch (error) {
    console.error('Error saving tracking device:', error);
    return NextResponse.json(
      { error: 'Failed to save tracking device' },
      { status: 500 },
    );
  }
}
