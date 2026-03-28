import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: 'Password change is not available for this account' },
        { status: 400 },
      );
    }

    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 },
      );
    }

    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to change password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 },
    );
  }
}
