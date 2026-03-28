import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  getTrackingReadDeviceId,
  getTrackingRequestContext,
  getTrackingWriteDeviceId,
  resolveExistingTrackingRecordForWrite,
  trackingDeviceRequiredResponse,
  trackingJson,
} from '@/lib/tracking/server';

function getBehaviorPayload(body: unknown): {
  deviceId?: unknown;
  data: Prisma.InputJsonValue | null;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: null };
  }

  const typedBody = body as Record<string, unknown>;

  if ('data' in typedBody) {
    return {
      deviceId: typedBody.deviceId,
      data: typedBody.data as Prisma.InputJsonValue,
    };
  }

  return {
    deviceId: typedBody.deviceId,
    data: typedBody as Prisma.InputJsonValue,
  };
}

// GET /api/behavior - fetch behavior data for logged-in user or by deviceId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = await getTrackingRequestContext(
      request,
      searchParams.get('deviceId'),
    );

    let behavior = context.userId
      ? await prisma.customerBehavior.findUnique({
          where: { userId: context.userId },
        })
      : null;

    if (!behavior) {
      const readDeviceId = context.userId
        ? context.cookieDeviceId
        : getTrackingReadDeviceId(context);

      if (!readDeviceId) {
        if (!context.userId) {
          return trackingDeviceRequiredResponse();
        }
      } else {
        behavior = await prisma.customerBehavior.findUnique({
          where: { deviceId: readDeviceId },
        });
      }
    }

    return trackingJson({
      deviceId:
        behavior?.deviceId ??
        context.cookieDeviceId ?? undefined,
      behavior: behavior?.data ?? null,
    });
  } catch (error) {
    console.error('Error fetching behavior:', error);
    return NextResponse.json(
      { error: 'Failed to fetch behavior' },
      { status: 500 },
    );
  }
}

// PUT /api/behavior - upsert (save or update) behavior data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = getBehaviorPayload(body);

    if (!payload.data) {
      return NextResponse.json(
        { error: 'behavior data is required' },
        { status: 400 },
      );
    }

    const context = await getTrackingRequestContext(request, payload.deviceId);
    const candidateDeviceId = getTrackingWriteDeviceId(context);
    const { deviceId, existing } = await resolveExistingTrackingRecordForWrite({
      userId: context.userId,
      deviceId: candidateDeviceId,
      findByUserId: (userId) =>
        prisma.customerBehavior.findUnique({ where: { userId } }),
      findByDeviceId: (lookupDeviceId) =>
        prisma.customerBehavior.findUnique({ where: { deviceId: lookupDeviceId } }),
    });

    const behavior = existing
      ? await prisma.customerBehavior.update({
          where: { deviceId },
          data: {
            data: payload.data,
            ...(context.userId ? { userId: context.userId } : {}),
          },
        })
      : await prisma.customerBehavior.create({
          data: {
            deviceId,
            userId: context.userId ?? null,
            data: payload.data,
          },
        });

    return trackingJson({
      deviceId,
      behavior: behavior.data,
    });
  } catch (error) {
    console.error('Error saving behavior:', error);
    return NextResponse.json(
      { error: 'Failed to save behavior' },
      { status: 500 },
    );
  }
}
