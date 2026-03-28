import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_PERMISSIONS,
  getAuthenticatedAdminFromRequest,
  hasAdminPermission,
} from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH /api/inventory/[id] - adjust stock (add/remove/set)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.PRODUCTS_EDIT)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let newQuantity = product.quantity;

    if (body.action === 'add') {
      const amount = parseInt(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      newQuantity = product.quantity + amount;
    } else if (body.action === 'remove') {
      const amount = parseInt(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      newQuantity = Math.max(0, product.quantity - amount);
    } else if (body.action === 'set') {
      const quantity = parseInt(body.quantity);
      if (isNaN(quantity) || quantity < 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
      newQuantity = quantity;
    } else if (body.reorderLevel !== undefined) {
      // Update reorder level only
      const level = parseInt(body.reorderLevel);
      if (isNaN(level) || level < 0) {
        return NextResponse.json({ error: 'Invalid reorder level' }, { status: 400 });
      }
      const updated = await prisma.product.update({
        where: { id },
        data: { lowStockThreshold: level },
      });
      return NextResponse.json({ id: updated.id, reorderLevel: updated.lowStockThreshold });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    return NextResponse.json({
      id: updated.id,
      currentStock: updated.quantity,
      reorderLevel: updated.lowStockThreshold,
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
