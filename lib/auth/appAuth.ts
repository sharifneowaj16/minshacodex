import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth/nextauth';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';
import prisma from '@/lib/prisma';

export interface AppAuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'customer' | 'vip' | 'premium';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  emailVerified: boolean;
  loyaltyPoints: number;
  referralCode: string | null;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    promotions: boolean;
    newProducts: boolean;
    orderUpdates: boolean;
  };
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

async function getUserIdFromCustomTokens(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<string | null> {
  if (accessToken) {
    const accessPayload = await verifyAccessToken(accessToken);
    if (accessPayload?.userId) {
      return accessPayload.userId;
    }
  }

  if (!refreshToken) {
    return null;
  }

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload?.userId) {
    return null;
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (
    !storedToken ||
    storedToken.revoked ||
    storedToken.expiresAt < new Date() ||
    storedToken.user.status !== 'ACTIVE'
  ) {
    return null;
  }

  return storedToken.userId;
}

function mapUser(user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: Date | null;
  loyaltyPoints: number;
  referralCode: string | null;
  newsletter: boolean;
  smsNotifications: boolean;
  promotions: boolean;
  newProducts: boolean;
  orderUpdates: boolean;
}): AppAuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role.toLowerCase() as AppAuthUser['role'],
    status: user.status.toLowerCase() as AppAuthUser['status'],
    emailVerified: !!user.emailVerified,
    loyaltyPoints: user.loyaltyPoints,
    referralCode: user.referralCode,
    preferences: {
      newsletter: user.newsletter,
      smsNotifications: user.smsNotifications,
      promotions: user.promotions,
      newProducts: user.newProducts,
      orderUpdates: user.orderUpdates,
    },
  };
}

export async function getAppUserById(userId: string): Promise<AppAuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return mapUser(user);
}

export async function getAuthenticatedUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const customUserId = await getUserIdFromCustomTokens(
    request.cookies.get('auth_token')?.value ?? getBearerToken(request),
    request.cookies.get('refresh_token')?.value ?? null,
  );

  if (customUserId) {
    return customUserId;
  }

  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getAuthenticatedUserFromRequest(
  request: NextRequest,
): Promise<AppAuthUser | null> {
  const userId = await getAuthenticatedUserIdFromRequest(request);
  if (!userId) {
    return null;
  }

  return getAppUserById(userId);
}

export async function getAuthenticatedUserIdFromServer(): Promise<string | null> {
  const cookieStore = await cookies();

  const customUserId = await getUserIdFromCustomTokens(
    cookieStore.get('auth_token')?.value ?? null,
    cookieStore.get('refresh_token')?.value ?? null,
  );

  if (customUserId) {
    return customUserId;
  }

  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getAuthenticatedUserFromServer(): Promise<AppAuthUser | null> {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    return null;
  }

  return getAppUserById(userId);
}

export function hasUserAuthCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('auth_token')?.value ||
      request.cookies.get('refresh_token')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value,
  );
}
