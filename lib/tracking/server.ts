import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';

const TRACKING_DEVICE_COOKIE_NAME = 'tracking_device_id';
const TRACKING_DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const TRACKING_DEVICE_ID_PATTERN = /^[A-Za-z0-9._:-]{6,128}$/;

export interface TrackingRequestContext {
  userId: string | null;
  requestedDeviceId: string | null;
  cookieDeviceId: string | null;
}

export function normalizeTrackingDeviceId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!TRACKING_DEVICE_ID_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function getTrackingRequestContext(
  request: NextRequest,
  requestedDeviceId?: unknown,
): Promise<TrackingRequestContext> {
  return {
    userId: await getAuthenticatedUserIdFromRequest(request),
    requestedDeviceId: normalizeTrackingDeviceId(requestedDeviceId),
    cookieDeviceId: normalizeTrackingDeviceId(
      request.cookies.get(TRACKING_DEVICE_COOKIE_NAME)?.value ?? null,
    ),
  };
}

export function getTrackingReadDeviceId(
  context: TrackingRequestContext,
): string | null {
  return context.userId ? null : context.cookieDeviceId;
}

export function getTrackingWriteDeviceId(
  context: TrackingRequestContext,
): string {
  if (context.userId) {
    return context.cookieDeviceId ?? `td_${randomUUID()}`;
  }

  return context.cookieDeviceId ?? `td_${randomUUID()}`;
}

export async function resolveExistingTrackingRecordForWrite<
  TRecord extends { deviceId: string },
>(options: {
  userId: string | null;
  deviceId: string;
  findByUserId: (userId: string) => Promise<TRecord | null>;
  findByDeviceId: (deviceId: string) => Promise<TRecord | null>;
}): Promise<{ deviceId: string; existing: TRecord | null }> {
  const { userId, deviceId, findByUserId, findByDeviceId } = options;

  if (userId) {
    const userRecord = await findByUserId(userId);
    if (userRecord) {
      return {
        deviceId: userRecord.deviceId,
        existing: userRecord,
      };
    }
  }

  const deviceRecord = await findByDeviceId(deviceId);
  if (deviceRecord) {
    return {
      deviceId: deviceRecord.deviceId,
      existing: deviceRecord,
    };
  }

  return {
    deviceId,
    existing: null,
  };
}

export function attachTrackingDeviceCookie(
  response: NextResponse,
  deviceId: string,
): NextResponse {
  response.cookies.set(TRACKING_DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TRACKING_DEVICE_COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

export function trackingJson(
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.json(body, init);
  const deviceId = normalizeTrackingDeviceId(body.deviceId);

  if (deviceId) {
    attachTrackingDeviceCookie(response, deviceId);
  }

  return response;
}

export function trackingDeviceRequiredResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Tracking device is not initialized for this browser' },
    { status: 403 },
  );
}
