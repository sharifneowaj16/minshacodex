// app/api/gift/[token]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const gift = await prisma.giftRequest.findUnique({
      where: { token },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            category: true,
            brand: true,
            variants: true,
          },
        },
      },
    });

    if (!gift) {
      return NextResponse.json({ error: 'Gift link পাওয়া যায়নি' }, { status: 404 });
    }

    if (gift.expiresAt < new Date()) {
      await prisma.giftRequest.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ error: 'Gift link মেয়াদ শেষ' }, { status: 410 });
    }

    if (gift.status === 'PENDING') {
      await prisma.giftRequest.update({
        where: { token },
        data: { status: 'VIEWED', viewedAt: new Date() },
      });
    }

    const p = gift.product;
    const sortedImages = [...p.images].sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({
      gift: {
        token:            gift.token,
        giftType:         gift.giftType,          // 'SEND_GIFT' | 'GET_GIFT'
        senderName:       gift.senderName,
        recipientName:    gift.recipientName,
        message:          gift.message,
        status:           gift.status,
        expiresAt:        gift.expiresAt.toISOString(),
        // GET_GIFT only
        requesterAddress: gift.requesterAddress,  // pre-filled address
        requesterPhone:   gift.requesterPhone,
      },
      product: {
        id:            p.id,
        name:          p.name,
        slug:          p.slug,
        price:         Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        image:         sortedImages[0]?.url || '',
        images:        sortedImages.map((i) => i.url),
        brand:         p.brand?.name || '',
        category:      p.category?.name || '',
        inStock:       p.quantity > 0 && p.isActive,
        variants:      p.variants.map((v) => ({
          id:         v.id,
          name:       v.name,
          price:      v.price ? Number(v.price) : Number(p.price),
          stock:      v.quantity,
          attributes: v.attributes,
        })),
      },
      selectedVariantId: gift.variantId,
    });
  } catch (error) {
    console.error('[Gift Token]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
