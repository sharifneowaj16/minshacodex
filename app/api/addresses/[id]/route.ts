import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';
import { AddressType } from '@/generated/prisma/client';

// PATCH /api/addresses/[id] — update an address
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await request.json();
    const { isDefault, type, ...rest } = body;

    // If setting as default, unset previous default of same type
    if (isDefault === true) {
      const addressType = type ? AddressType[type as 'SHIPPING' | 'BILLING'] : existing.type;
      await prisma.address.updateMany({
        where: { userId, type: addressType, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...rest,
        ...(isDefault !== undefined && { isDefault }),
        ...(type && { type: AddressType[type as 'SHIPPING' | 'BILLING'] }),
      },
    });

    return NextResponse.json({ address: updated });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// DELETE /api/addresses/[id] — delete an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
