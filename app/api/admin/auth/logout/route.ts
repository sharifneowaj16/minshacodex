import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    const refreshToken = request.cookies.get('admin_refresh_token')?.value;

    // Revoke refresh token in database if it exists
    if (refreshToken) {
      await prisma.adminRefreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }

    // Optionally revoke all tokens for this admin
    if (accessToken) {
      const payload = await verifyAdminAccessToken(accessToken);
      if (payload?.adminId) {
        await prisma.adminRefreshToken.updateMany({
          where: { adminId: payload.adminId },
          data: { revoked: true },
        });
      }
    }

    // Clear cookies
    const response = NextResponse.json({ success: true });

    response.cookies.delete('admin_access_token');
    response.cookies.delete('admin_refresh_token');
    response.cookies.delete('admin_user'); // Remove old cookie if exists

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);

    // Still clear cookies even if there's an error
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_access_token');
    response.cookies.delete('admin_refresh_token');
    response.cookies.delete('admin_user');

    return response;
  }
}
