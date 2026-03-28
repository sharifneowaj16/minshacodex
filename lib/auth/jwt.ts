import { SignJWT, jwtVerify, JWTPayload } from 'jose';

// Get JWT secrets from environment
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

// Token expiration times
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AdminTokenPayload extends JWTPayload {
  adminId: string;
  email: string;
  role: string;
  name: string;
  type: 'access' | 'refresh';
}

/**
 * Generate an access token for regular users
 */
export async function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('minsah-beauty')
    .setAudience('minsah-beauty-app')
    .sign(getJwtSecret());

  return token;
}

/**
 * Generate a refresh token for regular users
 */
export async function generateRefreshToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('minsah-beauty')
    .setAudience('minsah-beauty-app')
    .sign(getJwtRefreshSecret());

  return token;
}

/**
 * Generate an access token for admin users
 */
export async function generateAdminAccessToken(payload: {
  adminId: string;
  email: string;
  role: string;
  name: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('minsah-beauty')
    .setAudience('minsah-beauty-admin')
    .sign(getJwtSecret());

  return token;
}

/**
 * Generate a refresh token for admin users
 */
export async function generateAdminRefreshToken(payload: {
  adminId: string;
  email: string;
  role: string;
  name: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('minsah-beauty')
    .setAudience('minsah-beauty-admin')
    .sign(getJwtRefreshSecret());

  return token;
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'minsah-beauty',
      audience: 'minsah-beauty-app',
    });

    if (payload.type !== 'access') {
      return null;
    }

    return payload as TokenPayload;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtRefreshSecret(), {
      issuer: 'minsah-beauty',
      audience: 'minsah-beauty-app',
    });

    if (payload.type !== 'refresh') {
      return null;
    }

    return payload as TokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Verify an admin access token
 */
export async function verifyAdminAccessToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'minsah-beauty',
      audience: 'minsah-beauty-admin',
    });

    if (payload.type !== 'access') {
      return null;
    }

    return payload as AdminTokenPayload;
  } catch (error) {
    console.error('Admin access token verification failed:', error);
    return null;
  }
}

/**
 * Verify an admin refresh token
 */
export async function verifyAdminRefreshToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtRefreshSecret(), {
      issuer: 'minsah-beauty',
      audience: 'minsah-beauty-admin',
    });

    if (payload.type !== 'refresh') {
      return null;
    }

    return payload as AdminTokenPayload;
  } catch (error) {
    console.error('Admin refresh token verification failed:', error);
    return null;
  }
}

/**
 * Generate both access and refresh tokens for a user
 */
export async function generateTokenPair(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Generate both access and refresh tokens for an admin
 */
export async function generateAdminTokenPair(payload: {
  adminId: string;
  email: string;
  role: string;
  name: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAdminAccessToken(payload),
    generateAdminRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Decode a token without verifying (for reading expiration, etc.)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  return Date.now() >= payload.exp * 1000;
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;

  return payload.exp * 1000 - Date.now();
}
