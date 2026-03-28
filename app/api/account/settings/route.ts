import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';

type SettingsMode = 'profile' | 'preferences';

function mapUserResponse(user: {
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  newsletter: boolean;
  smsNotifications: boolean;
  promotions: boolean;
  newProducts: boolean;
  orderUpdates: boolean;
}) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
    gender: user.gender,
    preferences: {
      newsletter: user.newsletter,
      smsNotifications: user.smsNotifications,
      promotions: user.promotions,
      newProducts: user.newProducts,
      orderUpdates: user.orderUpdates,
    },
  };
}

function parseDateOfBirth(value: unknown): Date | null | 'invalid' {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return 'invalid';
  }

  return parsed;
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const mode = body?.mode as SettingsMode | undefined;

    if (mode === 'profile') {
      const firstName =
        typeof body.firstName === 'string' ? body.firstName.trim() : '';
      const lastName =
        typeof body.lastName === 'string' ? body.lastName.trim() : '';
      const phone =
        typeof body.phone === 'string' ? body.phone.trim() : '';
      const gender =
        typeof body.gender === 'string' ? body.gender.trim().toLowerCase() : '';
      const parsedDateOfBirth = parseDateOfBirth(body.dateOfBirth);

      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: 'First name and last name are required' },
          { status: 400 },
        );
      }

      if (parsedDateOfBirth === 'invalid') {
        return NextResponse.json(
          { error: 'Invalid date of birth' },
          { status: 400 },
        );
      }

      if (
        gender &&
        gender !== 'male' &&
        gender !== 'female' &&
        gender !== 'other'
      ) {
        return NextResponse.json(
          { error: 'Invalid gender value' },
          { status: 400 },
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone: phone || null,
          dateOfBirth: parsedDateOfBirth,
          gender: gender || null,
        },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          newsletter: true,
          smsNotifications: true,
          promotions: true,
          newProducts: true,
          orderUpdates: true,
        },
      });

      return NextResponse.json({
        user: mapUserResponse(updatedUser),
      });
    }

    if (mode === 'preferences') {
      if (!isBooleanRecord(body.preferences)) {
        return NextResponse.json(
          { error: 'Preferences payload is required' },
          { status: 400 },
        );
      }

      const preferences = body.preferences;
      const requiredKeys = [
        'newsletter',
        'smsNotifications',
        'promotions',
        'newProducts',
        'orderUpdates',
      ] as const;

      const hasInvalidValue = requiredKeys.some(
        (key) => typeof preferences[key] !== 'boolean',
      );

      if (hasInvalidValue) {
        return NextResponse.json(
          { error: 'Invalid preferences payload' },
          { status: 400 },
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          newsletter: preferences.newsletter,
          smsNotifications: preferences.smsNotifications,
          promotions: preferences.promotions,
          newProducts: preferences.newProducts,
          orderUpdates: preferences.orderUpdates,
        },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          newsletter: true,
          smsNotifications: true,
          promotions: true,
          newProducts: true,
          orderUpdates: true,
        },
      });

      return NextResponse.json({
        user: mapUserResponse(updatedUser),
      });
    }

    return NextResponse.json(
      { error: 'Unsupported settings update mode' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Failed to update account settings:', error);
    return NextResponse.json(
      { error: 'Failed to update account settings' },
      { status: 500 },
    );
  }
}
