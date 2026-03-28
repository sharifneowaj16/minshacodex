import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRefreshToken, generateAdminTokenPair } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('admin_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyAdminRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await prisma.adminRefreshToken.findUnique({
      where: { token: refreshToken },
      include: { admin: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    if (storedToken.admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Revoke old refresh token (token rotation)
    await prisma.adminRefreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateAdminTokenPair({
      adminId: storedToken.admin.id,
      email: storedToken.admin.email,
      role: storedToken.admin.role,
      name: storedToken.admin.name,
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.adminRefreshToken.create({
      data: {
        token: newRefreshToken,
        adminId: storedToken.admin.id,
        expiresAt,
      },
    });

    // Create response with new tokens
    const response = NextResponse.json({
      success: true,
      user: {
        id: storedToken.admin.id,
        name: storedToken.admin.name,
        email: storedToken.admin.email,
        role: storedToken.admin.role,
        avatar: storedToken.admin.avatar,
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('admin_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
