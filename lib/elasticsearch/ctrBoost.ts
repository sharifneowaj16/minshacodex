/**
 * lib/elasticsearch/ctrBoost.ts
 *
 * CTR-based re-ranking helper for Minsah Beauty search.
 *
 * How it works:
 *   1. For a given search query, fetch the top-clicked products
 *      from SearchClickMetrics (already persisted in DB).
 *   2. Build an Elasticsearch `pinned` query or `function_score`
 *      weight clauses so highly-clicked products rise in results.
 *
 * Why this approach (not a separate ES index):
 *   - SearchClickMetrics already exists in PostgreSQL — no extra infra.
 *   - We query it per-search (cached in Redis for 5 min).
 *   - Result: real user behaviour drives ranking, like Amazon A9.
 *
 * Usage (in app/api/search/route.ts):
 *   import { buildCTRBoostFunctions, getCTRBoostedIds } from '@/lib/elasticsearch/ctrBoost';
 */

import prisma from '@/lib/prisma';
import { redis } from '@/lib/cache/redis';

const CACHE_TTL_SECONDS = 300; // 5 minutes — balance freshness vs. DB load

// ─── Types ─────────────────────────────────────────────────────────────

export interface CTREntry {
  productId: string;
  clicks: number;
  avgPosition: number; // lower = clicked higher in results = more relevant
  conversions: number;
}

// ─── Fetch CTR data for a query ─────────────────────────────────────────

/**
 * Returns top-clicked products for a normalised query string.
 * Results are cached in Redis for CACHE_TTL_SECONDS.
 */
export async function getQueryCTRData(
  query: string,
  limit = 20
): Promise<CTREntry[]> {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const cacheKey = `search:ctr:${normalized}`;

  // ── Try Redis cache first ──────────────────────────────────────────
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as CTREntry[];
    } catch {
      // Redis failure is non-fatal — fall through to DB
    }
  }

  // ── Query DB ───────────────────────────────────────────────────────
  try {
    const rows = await prisma.searchClickMetrics.findMany({
      where: { query: normalized },
      orderBy: [
        { clicks: 'desc' },
        { conversions: 'desc' },
      ],
      take: limit,
      select: {
        productId: true,
        clicks: true,
        avgPosition: true,
        conversions: true,
      },
    });

    const entries: CTREntry[] = rows.map((r) => ({
      productId: r.productId,
      clicks: r.clicks,
      avgPosition: r.avgPosition,
      conversions: r.conversions,
    }));

    // Cache result
    if (redis && entries.length > 0) {
      try {
        await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(entries));
      } catch {
        // Cache write failure is non-fatal
      }
    }

    return entries;
  } catch (error) {
    console.error('[ctrBoost] DB query failed:', error);
    return [];
  }
}

// ─── Build function_score weight clauses ────────────────────────────────

/**
 * Converts CTR entries into Elasticsearch function_score `functions` array.
 *
 * Scoring formula per product:
 *   boost = log1p(clicks) × conversionMultiplier × positionMultiplier
 *
 * Examples:
 *   100 clicks, 0 conversions, avg position 1  → boost ≈ 4.6
 *   10  clicks, 2 conversions, avg position 3  → boost ≈ 3.5
 *   1   click,  0 conversions, avg position 10 → boost ≈ 0.7
 */
export function buildCTRBoostFunctions(
  entries: CTREntry[],
  maxBoost = 3.0 // cap so CTR never completely overrides text relevance
): Array<{ filter: { term: { id: string } }; weight: number }> {
  if (entries.length === 0) return [];

  const maxClicks = Math.max(...entries.map((e) => e.clicks), 1);

  return entries.map((entry) => {
    // Normalise click count → 0..1
    const clickScore = Math.log1p(entry.clicks) / Math.log1p(maxClicks);

    // Conversion multiplier: products that led to sales get extra boost
    const conversionMultiplier = entry.conversions > 0
      ? 1 + Math.min(entry.conversions / 10, 0.5) // max +50%
      : 1.0;

    // Position multiplier: clicked at position 1 > position 10
    // avgPosition is 0-indexed so position 0 = top result
    const positionMultiplier = entry.avgPosition <= 2
      ? 1.3
      : entry.avgPosition <= 5
      ? 1.1
      : 1.0;

    const rawBoost = clickScore * conversionMultiplier * positionMultiplier * maxBoost;
    const weight = Math.max(1.0, Math.min(maxBoost, parseFloat(rawBoost.toFixed(2))));

    return {
      filter: { term: { id: entry.productId } },
      weight,
    };
  });
}

/**
 * Returns ordered product IDs for use with ES `pinned` query.
 * Use this when you want strict ordering (top ~4 results pinned),
 * rather than soft boosting via function_score.
 *
 * Note: pinned query is ES 7.4+ feature — suitable here since we
 * are on ES v9.
 */
export function getCTRPinnedIds(
  entries: CTREntry[],
  maxPinned = 4
): string[] {
  return entries
    .sort((a, b) => {
      // Sort by conversion-weighted clicks
      const scoreA = a.clicks * (1 + a.conversions * 0.2);
      const scoreB = b.clicks * (1 + b.conversions * 0.2);
      return scoreB - scoreA;
    })
    .slice(0, maxPinned)
    .map((e) => e.productId);
}

// ─── Discount boost function ────────────────────────────────────────────

/**
 * Build a function_score entry that boosts products with a high discount %.
 *
 * `discount` field in ES is already computed by productTransformer.ts:
 *   discount = round((compareAtPrice - price) / compareAtPrice * 100)
 *
 * Boost scale:
 *   ≥ 40% off → weight 1.6
 *   ≥ 20% off → weight 1.3
 *   ≥ 10% off → weight 1.15
 *   < 10%     → no boost (weight 1.0, filtered out below)
 */
export function buildDiscountBoostFunctions(): Array<{
  filter: { range: { discount: { gte: number } } };
  weight: number;
}> {
  return [
    { filter: { range: { discount: { gte: 40 } } }, weight: 1.6 },
    { filter: { range: { discount: { gte: 20 } } }, weight: 1.3 },
    { filter: { range: { discount: { gte: 10 } } }, weight: 1.15 },
  ];
}
