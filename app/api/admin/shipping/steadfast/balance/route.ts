/**
 * GET /api/admin/shipping/steadfast/balance
 *
 * Returns Steadfast wallet balance. Cached in Redis for 5 minutes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';
import { getSteadfastBalance, SteadfastError } from '@/lib/steadfast/client';
import { cacheGet, cacheSet } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'steadfast:balance';
const CACHE_TTL = 5 * 60; // 5 minutes

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const accessToken = request.cookies.get('admin_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const payload = await verifyAdminAccessToken(accessToken);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Force refresh if ?refresh=1
  const forceRefresh =
    new URL(request.url).searchParams.get('refresh') === '1';

  // ── Try cache first ───────────────────────────────────────────────────────
  if (!forceRefresh) {
    const cached = await cacheGet<{ balance: number; cachedAt: string }>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({
        balance: cached.balance,
        cached: true,
        cachedAt: cached.cachedAt,
      });
    }
  }

  // ── Fetch from Steadfast ──────────────────────────────────────────────────
  try {
    const result = await getSteadfastBalance();
    const balance = result.current_balance;

    await cacheSet(CACHE_KEY, { balance, cachedAt: new Date().toISOString() }, CACHE_TTL);

    return NextResponse.json({ balance, cached: false });
  } catch (err) {
    if (err instanceof SteadfastError) {
      return NextResponse.json(
        { error: `Steadfast error: ${err.message}` },
        { status: err.statusCode ?? 502 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch Steadfast balance' },
      { status: 500 }
    );
  }
}
