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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const where = activeOnly ? { isActive: true, parentId: null } : { parentId: null };

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          include: {
            children: true, // subcategory items
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      href: `/shop?category=${cat.name}`,
      icon: cat.image || undefined,
      productCount: cat._count.products,
      status: cat.isActive ? 'active' : 'inactive',
      createdAt: cat.createdAt.toISOString(),
      subcategories: cat.children.map(sub => ({
        name: sub.name,
        items: sub.children.map(item => item.name),
      })),
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = toSlug(body.name);
    const status = body.status === 'active';

    // Create main category
    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug,
        isActive: status,
        sortOrder: 0,
      },
    });

    // Create subcategories and items
    if (body.subcategories && Array.isArray(body.subcategories)) {
      for (const subcat of body.subcategories) {
        const subcategory = await prisma.category.create({
          data: {
            name: subcat.name,
            slug: toSlug(subcat.name),
            parentId: category.id,
            isActive: status,
          },
        });

        // Create items under subcategory
        if (subcat.items && Array.isArray(subcat.items)) {
          for (const item of subcat.items) {
            await prisma.category.create({
              data: {
                name: item,
                slug: toSlug(item),
                parentId: subcategory.id,
                isActive: status,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ message: 'Category created successfully', category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
