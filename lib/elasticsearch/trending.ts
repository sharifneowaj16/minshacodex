/**
 * lib/elasticsearch/trending.ts
 *
 * Trending search queries and products tracker.
 * Uses Redis sorted sets for real-time trending data.
 * Daraz-level feature: shows "Trending Searches" and "Popular Products".
 */

import { redis } from '@/lib/cache/redis';

const TRENDING_QUERIES_KEY = 'trending:queries';
const TRENDING_PRODUCTS_KEY = 'trending:products';
const TRENDING_QUERIES_HOURLY = 'trending:queries:hourly';
const TTL_HOURS = 24;

/**
 * Record a search query for trending tracking.
 */
export async function trackSearchQuery(query: string): Promise<void> {
  if (!redis) return;
  if (!query.trim()) return;

  const normalized = query.toLowerCase().trim();
  const hourKey = `${TRENDING_QUERIES_HOURLY}:${new Date().getHours()}`;

  try {
    await Promise.all([
      // Overall trending (decays via TTL on hourly keys)
      redis.zincrby(TRENDING_QUERIES_KEY, 1, normalized),
      // Hourly bucket
      redis.zincrby(hourKey, 1, normalized),
      redis.expire(hourKey, TTL_HOURS * 3600),
    ]);
  } catch (error) {
    console.error('Failed to track trending query:', error);
  }
}

/**
 * Record a product view/click for trending products.
 */
export async function trackProductView(productId: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.zincrby(TRENDING_PRODUCTS_KEY, 1, productId);
  } catch (error) {
    console.error('Failed to track product view:', error);
  }
}

/**
 * Get top trending search queries.
 */
export async function getTrendingQueries(
  limit: number = 10
): Promise<Array<{ query: string; score: number }>> {
  if (!redis) return [];
  try {
    const results = await redis.zrevrange(
      TRENDING_QUERIES_KEY,
      0,
      limit - 1,
      'WITHSCORES'
    );

    const trending: Array<{ query: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      trending.push({
        query: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return trending;
  } catch (error) {
    console.error('Failed to get trending queries:', error);
    return [];
  }
}

/**
 * Get trending products by ID.
 */
export async function getTrendingProductIds(
  limit: number = 20
): Promise<string[]> {
  if (!redis) return [];
  try {
    return await redis.zrevrange(TRENDING_PRODUCTS_KEY, 0, limit - 1);
  } catch (error) {
    console.error('Failed to get trending products:', error);
    return [];
  }
}

/**
 * Clean up old trending data (run periodically via cron or scheduler).
 */
export async function cleanupTrending(): Promise<void> {
  if (!redis) return;
  try {
    // Remove entries with score < 2 (noise)
    await redis.zremrangebyscore(TRENDING_QUERIES_KEY, '-inf', '1');
    await redis.zremrangebyscore(TRENDING_PRODUCTS_KEY, '-inf', '1');

    // Keep only top 500
    const queryCount = await redis.zcard(TRENDING_QUERIES_KEY);
    if (queryCount > 500) {
      await redis.zremrangebyrank(TRENDING_QUERIES_KEY, 0, queryCount - 501);
    }

    const productCount = await redis.zcard(TRENDING_PRODUCTS_KEY);
    if (productCount > 500) {
      await redis.zremrangebyrank(TRENDING_PRODUCTS_KEY, 0, productCount - 501);
    }
  } catch (error) {
    console.error('Failed to cleanup trending data:', error);
  }
}
