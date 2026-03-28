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

// GET /api/campaign-attribution?deviceId=xxx - fetch attribution data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = await getTrackingRequestContext(
      request,
      searchParams.get('deviceId'),
    );

    let record = context.userId
      ? await prisma.campaignAttribution.findUnique({
          where: { userId: context.userId },
        })
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
        record = await prisma.campaignAttribution.findUnique({
          where: { deviceId: readDeviceId },
        });
      }
    }

    if (!record) {
      return trackingJson({
        deviceId: context.cookieDeviceId ?? undefined,
        firstTouch: null,
        lastTouch: null,
        touchpoints: [],
      });
    }

    return trackingJson({
      deviceId: record.deviceId,
      firstTouch: record.firstTouch,
      lastTouch: record.lastTouch,
      touchpoints: record.touchpoints,
    });
  } catch (error) {
    console.error('Error fetching campaign attribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribution' },
      { status: 500 },
    );
  }
}

// PUT /api/campaign-attribution - upsert attribution data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lastTouch, touchpoints, firstTouch: incomingFirstTouch } = body as {
      deviceId?: string;
      firstTouch?: Prisma.InputJsonValue;
      lastTouch?: Prisma.InputJsonValue;
      touchpoints?: Prisma.InputJsonValue[];
    };

    const context = await getTrackingRequestContext(request, body.deviceId);
    const candidateDeviceId = getTrackingWriteDeviceId(context);
    const { deviceId, existing } = await resolveExistingTrackingRecordForWrite({
      userId: context.userId,
      deviceId: candidateDeviceId,
      findByUserId: (userId) =>
        prisma.campaignAttribution.findUnique({ where: { userId } }),
      findByDeviceId: (lookupDeviceId) =>
        prisma.campaignAttribution.findUnique({
          where: { deviceId: lookupDeviceId },
        }),
    });

    if (existing) {
      const updateData: Prisma.CampaignAttributionUncheckedUpdateInput = {};

      if (incomingFirstTouch !== undefined && !existing.firstTouch) {
        updateData.firstTouch = incomingFirstTouch;
      }
      if (lastTouch !== undefined) {
        updateData.lastTouch = lastTouch;
      }
      if (touchpoints !== undefined) {
        updateData.touchpoints = touchpoints;
      }
      if (context.userId) {
        updateData.userId = context.userId;
      }

      await prisma.campaignAttribution.update({
        where: { deviceId },
        data: updateData,
      });
    } else {
      await prisma.campaignAttribution.create({
        data: {
          deviceId,
          userId: context.userId ?? null,
          ...(incomingFirstTouch !== undefined
            ? { firstTouch: incomingFirstTouch }
            : {}),
          ...(lastTouch !== undefined ? { lastTouch } : {}),
          touchpoints: touchpoints ?? [],
        },
      });
    }

    return trackingJson({ ok: true, deviceId });
  } catch (error) {
    console.error('Error saving campaign attribution:', error);
    return NextResponse.json(
      { error: 'Failed to save attribution' },
      { status: 500 },
    );
  }
}
