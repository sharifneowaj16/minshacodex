import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';
import { AddressType } from '@/generated/prisma/client';

// GET /api/addresses — fetch all addresses for logged-in user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST /api/addresses — create a new address
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      isDefault = false,
      firstName,
      lastName = '',
      company,
      street1,
      street2,
      city,
      state,
      postalCode = '',
      country = 'Bangladesh',
      phone,
    } = body as {
      type?: 'SHIPPING' | 'BILLING';
      isDefault?: boolean;
      firstName: string;
      lastName?: string;
      company?: string;
      street1: string;
      street2?: string;
      city: string;
      state: string;
      postalCode?: string;
      country?: string;
      phone?: string;
    };

    if (!firstName || !street1 || !city || !state) {
      return NextResponse.json(
        { error: 'firstName, street1, city, and state are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset previous default of same type
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, type: type ? AddressType[type] : AddressType.SHIPPING },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        type: type ? AddressType[type] : AddressType.SHIPPING,
        isDefault,
        firstName,
        lastName,
        company,
        street1,
        street2,
        city,
        state,
        postalCode,
        country,
        phone,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
