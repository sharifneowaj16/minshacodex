import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const PASSWORD_RESET_OTP_EXPIRY_MINUTES = 10;
export const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generatePasswordResetOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function issuePasswordResetOtp(email: string): Promise<string> {
  const otp = generatePasswordResetOtp();
  const expires = new Date(Date.now() + PASSWORD_RESET_OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: { email },
    });

    await tx.passwordResetToken.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });
  });

  return otp;
}

export async function exchangePasswordResetOtp(
  email: string,
  otp: string,
): Promise<string | null> {
  const now = new Date();
  const resetToken = generatePasswordResetToken();
  const resetExpires = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  );

  return prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        email,
        OR: [
          { used: true },
          { expires: { lt: now } },
        ],
      },
    });

    const otpToken = await tx.passwordResetToken.findFirst({
      where: {
        email,
        token: otp,
        used: false,
        expires: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpToken) {
      return null;
    }

    await tx.passwordResetToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: resetExpires,
      },
    });

    return resetToken;
  });
}
