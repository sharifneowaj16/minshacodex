import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('client-error');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stack, componentStack, timestamp, url } = body;

    // Log the client-side error
    logger.error('Client-side error', {
      message,
      stack,
      componentStack,
      timestamp,
      url,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
