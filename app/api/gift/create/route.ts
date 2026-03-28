// app/api/gift/create/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Gift Create] body:', JSON.stringify(body));
    const {
      productId,
      variantId,
      giftType = 'SEND_GIFT', // 'SEND_GIFT' | 'GET_GIFT'
      // SEND_GIFT fields
      senderName,
      senderPhone,
      recipientName,
      message,
      // GET_GIFT fields
      requesterName,   // যে চাইছে (আমি)
      requesterPhone,  // আমার phone
      requesterAddress, // আমার address — { name, phone, address, city }
      payerName,       // যে pay করবে (বন্ধু)
    } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId প্রয়োজন' }, { status: 400 });
    }

    // Validate based on type
    if (giftType === 'SEND_GIFT' && (!senderName?.trim() || !recipientName?.trim())) {
      return NextResponse.json(
        { error: 'senderName এবং recipientName প্রয়োজন' },
        { status: 400 }
      );
    }

    if (giftType === 'GET_GIFT' && (!requesterName?.trim() || !payerName?.trim())) {
      return NextResponse.json(
        { error: 'requesterName এবং payerName প্রয়োজন' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true, price: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'পণ্য পাওয়া যায়নি' }, { status: 404 });
    }

    const token = randomBytes(6).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const gift = await prisma.giftRequest.create({
      data: {
        token,
        productId,
        variantId: variantId || null,
        giftType,
        expiresAt,

        // SEND_GIFT
        senderName:    giftType === 'SEND_GIFT' ? senderName?.trim() : requesterName?.trim(),
        senderPhone:   giftType === 'SEND_GIFT' ? senderPhone?.trim() || null : requesterPhone?.trim() || null,
        recipientName: giftType === 'SEND_GIFT' ? recipientName?.trim() : payerName?.trim(),
        message:       message?.trim() || null,

        // GET_GIFT extra
        requesterPhone:   giftType === 'GET_GIFT' ? requesterPhone?.trim() || null : null,
        requesterAddress: giftType === 'GET_GIFT' ? requesterAddress || null : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minsahbeauty.cloud';
    const giftUrl = `${baseUrl}/gift/${gift.token}`;

    // WhatsApp message — different for each type
    let waMessage: string;

    if (giftType === 'SEND_GIFT') {
      waMessage =
        `🎁 ${recipientName}, তোমার জন্য একটা গিফট!\n\n` +
        `${senderName} তোমাকে "${product.name}" গিফট করতে চায়।\n\n` +
        `এই link-এ click করো:\n${giftUrl}\n\n💝 Minsah Beauty`;
    } else {
      // GET_GIFT — requester is asking payer to buy for them
      waMessage =
        `🎁 ${payerName}, একটা অনুরোধ আছে!\n\n` +
        `${requesterName} তোমার কাছে "${product.name}" চাইছে গিফট হিসেবে।\n\n` +
        `এই link-এ click করলে সহজেই পাঠাতে পারবে:\n${giftUrl}\n\n` +
        `💝 Minsah Beauty`;
    }

    const waText = encodeURIComponent(waMessage);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(giftUrl)}`;

    return NextResponse.json({
      token: gift.token,
      giftType,
      giftUrl,
      waUrl: `https://wa.me/?text=${waText}`,
      fbUrl,
      expiresAt: gift.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[Gift Create]', error);
    return NextResponse.json({ error: 'Gift link তৈরি হয়নি' }, { status: 500 });
  }
}
