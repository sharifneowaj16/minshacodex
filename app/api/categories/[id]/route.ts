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

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// DELETE /api/categories/[id]
// Deletes a category and all its children (subcategories + items).
// Products linked to any of these categories have their categoryId set to null first
// to avoid FK constraint violations (no onDelete cascade in schema).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch the category with its full hierarchy (2 levels deep)
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: true, // grandchildren (items)
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Collect all IDs to delete (category + subcategories + items)
    const itemIds: string[] = [];
    const subcategoryIds: string[] = [];

    for (const sub of category.children) {
      subcategoryIds.push(sub.id);
      for (const item of sub.children) {
        itemIds.push(item.id);
      }
    }

    const allIds = [id, ...subcategoryIds, ...itemIds];

    // Use a transaction to safely delete everything
    await prisma.$transaction([
      // 1. Unlink products from ALL affected categories to avoid FK constraint
      prisma.product.updateMany({
        where: { categoryId: { in: allIds } },
        data: { categoryId: null },
      }),
      // 2. Delete grandchildren (items) first
      prisma.category.deleteMany({
        where: { id: { in: itemIds } },
      }),
      // 3. Delete children (subcategories)
      prisma.category.deleteMany({
        where: { id: { in: subcategoryIds } },
      }),
      // 4. Delete the root category
      prisma.category.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

// PUT /api/categories/[id]
// Updates a category's name, status, and rebuilds its subcategory hierarchy.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: { children: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const slug = toSlug(body.name);
    const isActive = body.status === 'active';

    // Collect old child/grandchild IDs so we can remove them before rebuilding
    const oldItemIds: string[] = [];
    const oldSubcategoryIds: string[] = [];
    for (const sub of existing.children) {
      oldSubcategoryIds.push(sub.id);
      for (const item of sub.children) {
        oldItemIds.push(item.id);
      }
    }

    // Rebuild hierarchy in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete old grandchildren and children
      if (oldItemIds.length > 0) {
        await tx.category.deleteMany({ where: { id: { in: oldItemIds } } });
      }
      if (oldSubcategoryIds.length > 0) {
        await tx.category.deleteMany({ where: { id: { in: oldSubcategoryIds } } });
      }

      // Update the main category
      await tx.category.update({
        where: { id },
        data: { name: body.name.trim(), slug, isActive },
      });

      // Recreate subcategories and items
      if (body.subcategories && Array.isArray(body.subcategories)) {
        for (const subcat of body.subcategories) {
          const newSub = await tx.category.create({
            data: {
              name: subcat.name,
              slug: toSlug(subcat.name),
              parentId: id,
              isActive,
            },
          });

          if (subcat.items && Array.isArray(subcat.items)) {
            for (const item of subcat.items) {
              await tx.category.create({
                data: {
                  name: item,
                  slug: toSlug(item),
                  parentId: newSub.id,
                  isActive,
                },
              });
            }
          }
        }
      }
    });

    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
