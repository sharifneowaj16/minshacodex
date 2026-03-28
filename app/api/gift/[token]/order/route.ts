import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import prisma from '@/lib/prisma';

// ── Telegram notification ──────────────────────────────────────────────────────
async function sendTelegram(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId   = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
  } catch (e) {
    console.error('[Gift Order] Telegram error:', e);
  }
}

// ── Guest user resolver ────────────────────────────────────────────────────────
// Order schema এ userId NOT NULL — guest order এর জন্য
// sender/recipient userId use করি, নাহলে gift.senderId/recipientId,
// নাহলে একটা system guest user upsert করি
async function resolveUserId(
  sessionUserId: string | null,
  gift: { senderId: string | null; recipientId: string | null }
): Promise<string> {
  // 1. Logged-in user
  if (sessionUserId) return sessionUserId;

  // 2. Gift এ sender বা recipient linked থাকলে তাকে use করো
  if (gift.senderId)    return gift.senderId;
  if (gift.recipientId) return gift.recipientId;

  // 3. Guest — system guest user upsert করো
  const guestUser = await prisma.user.upsert({
    where:  { email: 'guest-gift@minsahbeauty.cloud' },
    update: {},
    create: {
      email:     'guest-gift@minsahbeauty.cloud',
      firstName: 'Guest',
      lastName:  'Gift',
      role:      'CUSTOMER',
      status:    'ACTIVE',
    },
  });
  return guestUser.id;
}

// ── POST /api/gift/[token]/order ───────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    console.log('[Gift Order] token:', token, 'body:', JSON.stringify(body));

    // ── 1. Fetch gift ─────────────────────────────────────────────────────────
    const gift = await prisma.giftRequest.findUnique({
      where: { token },
      include: {
        product: {
          select: {
            id:            true,
            name:          true,
            sku:           true,
            price:         true,
            quantity:      true,
            trackInventory:true,
            allowBackorder:true,
          },
        },
      },
    });

    if (!gift) {
      return NextResponse.json({ error: 'Gift link পাওয়া যায়নি' }, { status: 404 });
    }
    if (gift.status === 'ORDERED') {
      return NextResponse.json({ error: 'এই gift ইতিমধ্যে order হয়ে গেছে' }, { status: 409 });
    }
    if (gift.status === 'EXPIRED' || new Date() > gift.expiresAt) {
      return NextResponse.json({ error: 'Gift link এর মেয়াদ শেষ' }, { status: 410 });
    }

    const isSendGift = gift.giftType === 'SEND_GIFT';
    const product    = gift.product;

    // ── 2. Delivery address ───────────────────────────────────────────────────
    let deliveryName:  string;
    let deliveryPhone: string;
    let deliveryStreet: string;
    let deliveryCity:  string;
    let deliveryNote:  string | undefined;

    if (isSendGift) {
      // Recipient fills their address
      const { name, phone, street, city, note } = body;
      if (!name?.trim() || !phone?.trim() || !street?.trim()) {
        return NextResponse.json(
          { error: 'নাম, ফোন ও ঠিকানা দিন' },
          { status: 400 }
        );
      }
      deliveryName   = name.trim();
      deliveryPhone  = phone.trim();
      deliveryStreet = street.trim();
      deliveryCity   = city || 'ঢাকা';
      deliveryNote   = note?.trim();
    } else {
      // GET_GIFT — address pre-saved by requester
      const addr = gift.requesterAddress as {
        name: string; phone: string; street: string; city: string;
      } | null;

      if (!addr?.name || !addr?.phone || !addr?.street) {
        return NextResponse.json(
          { error: 'Delivery address পাওয়া যায়নি' },
          { status: 400 }
        );
      }
      deliveryName   = addr.name;
      deliveryPhone  = addr.phone;
      deliveryStreet = addr.street;
      deliveryCity   = addr.city || 'ঢাকা';
    }

    // ── 3. Payer identity ─────────────────────────────────────────────────────
    const session     = await getServerSession(authOptions);
    const sessionUser = session?.user ?? null;

    // Guest payer name (from body if not logged in)
    const payerName  = sessionUser?.name  ?? body.payerName  ?? gift.senderName;
    const payerPhone = sessionUser?.email ?? body.payerPhone ?? null;

    // ── 4. Stock check ────────────────────────────────────────────────────────
    if (product.trackInventory && !product.allowBackorder && product.quantity < 1) {
      return NextResponse.json({ error: 'পণ্যটি স্টকে নেই' }, { status: 409 });
    }

    // ── 5. Resolve userId — never empty ───────────────────────────────────────
    const userId = await resolveUserId(sessionUser?.id ?? null, {
      senderId:    gift.senderId,
      recipientId: gift.recipientId,
    });

    console.log('[Gift Order] resolved userId:', userId, 'isGuest:', !sessionUser?.id);

    // ── 6. Transaction ────────────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {

      // 6a. Shipping address
      const nameParts = deliveryName.split(' ');
      const address = await tx.address.create({
        data: {
          userId,
          firstName:  nameParts[0] || deliveryName,
          lastName:   nameParts.slice(1).join(' ') || '',
          phone:      deliveryPhone,
          street1:    deliveryStreet,
          city:       deliveryCity,
          state:      deliveryCity,
          postalCode: '',
          country:    'Bangladesh',
          isDefault:  false,
          type:       'SHIPPING',
        },
      });

      // 6b. Order number
      const orderNumber = `MB${Date.now()}${Math.random()
        .toString(36).substring(2, 5).toUpperCase()}`;

      const unitPrice = parseFloat(product.price.toString());

      // 6c. Customer note
      const noteLines = [
        `🎁 Gift Order — ${isSendGift ? 'Send Gift' : 'Get Gift'}`,
        `Sender: ${gift.senderName}`,
        `Payer: ${payerName}`,
        payerPhone ? `Payer Phone: ${payerPhone}` : null,
        deliveryNote ? `Note: ${deliveryNote}` : null,
      ].filter(Boolean).join(' | ');

      // 6d. Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId:      address.id,
          status:         'PENDING',
          paymentStatus:  'PENDING',
          paymentMethod:  'cod',
          subtotal:       unitPrice,
          shippingCost:   0,
          taxAmount:      0,
          discountAmount: 0,
          total:          unitPrice,
          isGiftOrder:    true,
          giftToken:      token,
          customerNote:   noteLines,
          items: {
            create: [{
              productId: product.id,
              variantId: gift.variantId ?? null,
              name:      product.name,
              sku:       product.sku,
              price:     unitPrice,
              quantity:  1,
              total:     unitPrice,
            }],
          },
        },
      });

      // 6e. Decrement stock
      if (product.trackInventory) {
        if (gift.variantId) {
          await tx.productVariant.update({
            where: { id: gift.variantId },
            data:  { quantity: { decrement: 1 } },
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data:  { quantity: { decrement: 1 } },
          });
        }
      }

      // 6f. Mark gift ORDERED
      await tx.giftRequest.update({
        where: { token },
        data:  { status: 'ORDERED', orderedAt: new Date() },
      });

      // 6g. Admin notification
      await tx.adminNotification.create({
        data: {
          type:    'GIFT_ORDER',
          title:   '🎁 নতুন Gift Order',
          message: `${payerName} — ${product.name} — ৳${unitPrice.toLocaleString()} | Delivery: ${deliveryName}, ${deliveryCity}`,
          orderId: order.id,
          isRead:  false,
        },
      });

      return { order };
    });

    // ── 7. Telegram (fire & forget) ───────────────────────────────────────────
    const tgMsg = [
      `🎁 <b>নতুন Gift Order!</b>`,
      ``,
      `📦 পণ্য: ${product.name}`,
      `💰 মূল্য: ৳${parseFloat(product.price.toString()).toLocaleString()}`,
      ``,
      `👤 Payer: ${payerName}`,
      `📍 Delivery: ${deliveryName}`,
      `📞 Phone: ${deliveryPhone}`,
      `🏠 ঠিকানা: ${deliveryStreet}, ${deliveryCity}`,
      ``,
      `🎀 Type: ${isSendGift ? 'Send Gift' : 'Get Gift'}`,
      `🔑 Token: <code>${token}</code>`,
      `📋 Order: #${result.order.orderNumber}`,
    ].join('\n');

    sendTelegram(tgMsg).catch(() => {});

    // ── 8. Response ───────────────────────────────────────────────────────────
    return NextResponse.json({
      success:     true,
      orderNumber: result.order.orderNumber,
      orderId:     result.order.id,
    });

  } catch (error) {
    console.error('[Gift Order] Error:', error);
    return NextResponse.json(
      { error: 'Order create করতে পারিনি। আবার try করুন।' },
      { status: 500 }
    );
  }
}
