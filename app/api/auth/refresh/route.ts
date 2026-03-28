import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTokenPair, verifyRefreshToken } from '@/lib/auth/jwt';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth:refresh');

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshTokenCookie = request.cookies.get('refresh_token')?.value;
    const body = await request.json().catch(() => ({}));
    const refreshToken = refreshTokenCookie || body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      logger.info('Invalid refresh token used');
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked) {
      logger.warn('Revoked or non-existent refresh token used', { userId: payload.userId });
      return NextResponse.json(
        { error: 'Refresh token has been revoked' },
        { status: 401 }
      );
    }

    // Check if token is expired in database
    if (storedToken.expiresAt < new Date()) {
      logger.info('Expired refresh token used', { userId: payload.userId });
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    // Check user status
    if (storedToken.user.status !== 'ACTIVE') {
      logger.warn('Token refresh attempt for inactive user', { userId: storedToken.userId });
      return NextResponse.json(
        { error: 'User account is not active' },
        { status: 403 }
      );
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair({
      userId: storedToken.userId,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Revoke old refresh token and create new one (token rotation)
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          expiresAt: refreshTokenExpiry,
        },
      }),
    ]);

    logger.info('Token refreshed successfully', { userId: storedToken.userId });

    const response = NextResponse.json({
      accessToken,
      message: 'Token refreshed successfully',
    });

    // Set new cookies
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Token refresh error', error);
    return NextResponse.json(
      { error: 'An error occurred during token refresh' },
      { status: 500 }
    );
  }
}
