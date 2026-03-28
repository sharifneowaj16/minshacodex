import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth:logout');

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const userId = request.cookies.get('user_id')?.value;

    // Revoke refresh token if it exists
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      }).catch(() => {
        // Ignore errors - token might not exist
      });
    }

    logger.info('User logged out', { userId: userId || 'unknown' });

    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    // Clear all auth cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Logout error', error);
    // Even on error, clear cookies
    const response = NextResponse.json({
      message: 'Logged out',
    });

    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_id', '', { maxAge: 0, path: '/' });

    return response;
  }
}
