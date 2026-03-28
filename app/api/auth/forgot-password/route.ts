import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/cache/redis';
import { createLogger } from '@/lib/logger';
import {
  issuePasswordResetOtp,
  normalizeEmail,
} from '@/lib/auth/passwordReset';

const logger = createLogger('auth:forgot-password');

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email || '');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const [ipRateLimit, emailRateLimit] = await Promise.all([
      checkRateLimit(`forgot-password:ip:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
      checkRateLimit(`forgot-password:email:${email}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
    ]);

    if (!ipRateLimit.allowed || !emailRateLimit.allowed) {
      const retryAfter = Math.max(ipRateLimit.resetIn, emailRateLimit.resetIn);
      logger.warn('Password reset OTP rate limit exceeded', { ip, email, retryAfter });
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    let otp: string | undefined;

    if (user) {
      otp = await issuePasswordResetOtp(email);
      logger.info('Password reset OTP issued', { userId: user.id, email });

      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Password reset OTP generated', { email, otp });
      }
    } else {
      logger.info('Password reset requested for unknown email', { email });
    }

    return NextResponse.json({
      message: 'If an account exists for this email, an OTP has been sent.',
      email,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    logger.error('Failed to issue password reset OTP', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
