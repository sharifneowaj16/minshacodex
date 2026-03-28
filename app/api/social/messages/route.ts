import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Inbox messages list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const platform = searchParams.get('platform'); // optional filter
    const unreadOnly = searchParams.get('unread') === 'true';

    const messages = await prisma.socialMessage.findMany({
      where: {
        ...(platform && { platform }),
        ...(unreadOnly && { isRead: false }),
        isIncoming: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.socialMessage.count({
      where: { isRead: false, isIncoming: true },
    });

    return NextResponse.json({ messages, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// PATCH - Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const { id, markAll } = await request.json();

    if (markAll) {
      await prisma.socialMessage.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    } else {
      await prisma.socialMessage.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
