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

function getInventoryStatus(quantity: number, lowStockThreshold: number) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= lowStockThreshold) return 'low_stock';
  if (quantity > lowStockThreshold * 10) return 'overstocked';
  return 'in_stock';
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.PRODUCTS_VIEW)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'stock';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (category !== 'all') {
      where.category = {
        name: { equals: category, mode: 'insensitive' },
      };
    }

    if (status !== 'all') {
      switch (status) {
        case 'out_of_stock':
          where.quantity = 0;
          break;
        case 'low_stock':
          where.quantity = { gt: 0 };
          // Will filter after fetch since lowStockThreshold varies per product
          break;
        case 'in_stock':
          // Will filter after fetch
          break;
        case 'overstocked':
          // Will filter after fetch
          break;
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
      },
      orderBy:
        sort === 'name'
          ? { name: 'asc' }
          : sort === 'value'
          ? { price: 'desc' }
          : { quantity: sort === 'lowStock' ? 'asc' : 'desc' },
    });

    let inventoryItems = products.map((p) => {
      const itemStatus = getInventoryStatus(p.quantity, p.lowStockThreshold);
      const maxStock = Math.max(p.lowStockThreshold * 10, p.quantity);
      const totalValue = p.quantity * p.price.toNumber();

      return {
        id: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category?.name || 'Uncategorized',
        currentStock: p.quantity,
        reorderLevel: p.lowStockThreshold,
        maxStock,
        unitPrice: p.price.toNumber(),
        costPrice: p.costPrice ? p.costPrice.toNumber() : null,
        totalValue,
        status: itemStatus,
        isActive: p.isActive,
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    // Apply post-fetch status filter for statuses that depend on lowStockThreshold
    if (status !== 'all' && status !== 'out_of_stock') {
      inventoryItems = inventoryItems.filter((item) => item.status === status);
    }

    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = inventoryItems.filter((i) => i.status === 'low_stock').length;
    const outOfStockCount = inventoryItems.filter((i) => i.status === 'out_of_stock').length;
    const totalProducts = inventoryItems.length;

    return NextResponse.json({
      inventory: inventoryItems,
      stats: {
        totalValue,
        totalProducts,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
