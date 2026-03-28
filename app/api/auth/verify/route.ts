import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';

// POST /api/auth/verify
// Called by lib/auth.ts → getCurrentUser() → verifyAuthToken()
// Replaces the stub that returned hardcoded mock data
export async function POST(request: NextRequest) {
  try {
    // Support token from body or Authorization header
    let actualToken: string | null = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        actualToken = body?.token ?? null;
      } catch {
        // body might be empty
      }
    }

    if (!actualToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        actualToken = authHeader.substring(7);
      }
    }

    if (!actualToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Real JWT verification
    const payload = await verifyAccessToken(actualToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Fetch user from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        loyaltyPoints: true,
        referralCode: true,
        newsletter: true,
        smsNotifications: true,
        promotions: true,
        newProducts: true,
        orderUpdates: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      role: dbUser.role.toLowerCase() as 'customer' | 'vip' | 'premium',
      status: dbUser.status.toLowerCase(),
      emailVerified: !!dbUser.emailVerified,
      loyaltyPoints: dbUser.loyaltyPoints,
      referralCode: dbUser.referralCode,
      preferences: {
        newsletter: dbUser.newsletter,
        smsNotifications: dbUser.smsNotifications,
        promotions: dbUser.promotions,
        newProducts: dbUser.newProducts,
        orderUpdates: dbUser.orderUpdates,
      },
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Token verification failed' }, { status: 500 });
  }
}
