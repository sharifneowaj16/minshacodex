import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';

// PATCH /api/cart/[itemId] — update quantity of a specific cart item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body as { quantity: number };

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ error: 'Valid quantity is required' }, { status: 400 });
    }

    // Verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ cartItem: updated });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart/[itemId] — remove a specific item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await params;

    // Verify ownership before deleting
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
