import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateAdminTokenPair } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/cache/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting - 5 attempts per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `admin-login:${ip}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 5, 900);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetIn.toString(),
          },
        }
      );
    }

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAdminTokenPair({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.adminRefreshToken.create({
      data: {
        token: refreshToken,
        adminId: admin.id,
        expiresAt,
      },
    });

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Create response with HTTP-only cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
