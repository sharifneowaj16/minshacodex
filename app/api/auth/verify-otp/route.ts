import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/cache/redis';
import { createLogger } from '@/lib/logger';
import {
  exchangePasswordResetOtp,
  normalizeEmail,
} from '@/lib/auth/passwordReset';

const logger = createLogger('auth:verify-otp');

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 900;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email || '');
    const otp = String(body?.otp || '').trim();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit code' }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(
      `verify-otp:${ip}:${email}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      logger.warn('OTP verification rate limit exceeded', { ip, email, retryAfter: rateLimit.resetIn });
      return NextResponse.json(
        {
          error: 'Too many OTP verification attempts. Please try again later.',
          retryAfter: rateLimit.resetIn,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetIn) },
        },
      );
    }

    const resetToken = await exchangePasswordResetOtp(email, otp);

    if (!resetToken) {
      logger.info('Invalid or expired password reset OTP used', { email, ip });
      return NextResponse.json(
        { error: 'OTP not found, invalid, or expired. Please request a new one.' },
        { status: 401 },
      );
    }

    logger.info('Password reset OTP verified', { email, ip });

    return NextResponse.json({
      message: 'OTP verified successfully',
      token: resetToken,
    });
  } catch (error) {
    logger.error('Failed to verify password reset OTP', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
