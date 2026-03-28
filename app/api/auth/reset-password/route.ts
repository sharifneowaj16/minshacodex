import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/cache/redis';
import { createLogger } from '@/lib/logger';
import { hashPassword, validatePassword } from '@/lib/auth/password';

const logger = createLogger('auth:reset-password');

// Rate limit: 3 attempts per hour per IP
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 3600;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    // Rate limiting
    const rateLimitKey = `reset-password:${ip}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for password reset', { ip });
      return NextResponse.json(
        {
          error: 'Too many password reset attempts. Please try again later.',
          retryAfter: rateLimit.resetIn
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetIn),
          }
        }
      );
    }

    const body = await request.json();
    const { token, newPassword } = body;

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Find the password reset token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      logger.info('Invalid password reset token attempted');
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      logger.info('Expired password reset token used', { email: resetToken.email });
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Check if token was already used
    if (resetToken.used) {
      logger.warn('Already used password reset token attempted', { email: resetToken.email });
      return NextResponse.json(
        { error: 'This reset token has already been used' },
        { status: 401 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      logger.error('User not found for valid reset token', { email: resetToken.email });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          email: resetToken.email,
          id: { not: resetToken.id },
        },
      }),
      // Revoke all existing refresh tokens for security
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    logger.info('Password reset successful', { userId: user.id });

    return NextResponse.json({
      message: 'Password reset successful. Please login with your new password.',
    });

  } catch (error) {
    logger.error('Password reset error', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting password. Please try again.' },
      { status: 500 }
    );
  }
}
