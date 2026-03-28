import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateTokenPair } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/cache/redis';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth:login');

// Rate limit: 5 attempts per 15 minutes per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 900; // 15 minutes in seconds

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    // Rate limiting
    const rateLimitKey = `login:${ip}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for login', { ip });
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.resetIn
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetIn),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        loyaltyPoints: true,
        referralCode: true,
      },
    });

    // User not found - use generic error to prevent enumeration
    if (!user) {
      logger.info('Login attempt for non-existent user', { email: email.toLowerCase() });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password (not a social login user)
    if (!user.passwordHash) {
      logger.info('Login attempt for social login user', { userId: user.id });
      return NextResponse.json(
        { error: 'Please use social login for this account' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      logger.warn('Login attempt for inactive user', { userId: user.id, status: user.status });
      return NextResponse.json(
        { error: 'Your account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.info('Invalid password attempt', { userId: user.id });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info('User logged in successfully', { userId: user.id });

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      user: {
        ...userWithoutPassword,
        role: user.role.toLowerCase(),
      },
      accessToken,
      message: 'Login successful',
    });

    // Set HTTP-only cookies for tokens
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
