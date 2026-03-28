import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete in transaction to ensure all-or-nothing
    await prisma.$transaction(async (tx) => {
      // Delete all items (3rd level)
      for (const subcat of existing.children) {
        if (subcat.children.length > 0) {
          await tx.category.deleteMany({
            where: { parentId: subcat.id },
          });
        }
      }

      // Delete all subcategories (2nd level)
      if (existing.children.length > 0) {
        await tx.category.deleteMany({
          where: { parentId: id },
        });
      }

      // Delete main category (1st level)
      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
