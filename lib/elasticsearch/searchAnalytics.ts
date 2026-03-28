/**
 * lib/elasticsearch/searchAnalytics.ts
 *
 * Search analytics engine — Daraz-level search intelligence.
 * Tracks: CTR by query, no-result queries, conversion funnel,
 * query success rate, popular queries by category.
 */

import prisma from '@/lib/prisma';
import { redis } from '@/lib/cache/redis';

const FAILED_QUERIES_KEY = 'search:failed_queries';
const QUERY_CTR_PREFIX = 'search:ctr:';

// ─── Track zero-result queries ─────────────────────────────────────────

export async function trackFailedQuery(query: string): Promise<void> {
  if (!query.trim()) return;
  if (!redis) return;

  try {
    await redis.zincrby(FAILED_QUERIES_KEY, 1, query.toLowerCase().trim());
  } catch (error) {
    console.error('Failed to track failed query:', error);
  }
}

/**
 * Get queries that returned zero results — synonym gaps, product gaps.
 */
export async function getFailedQueries(
  limit: number = 50
): Promise<Array<{ query: string; count: number }>> {
  if (!redis) return [];

  try {
    const results = await redis.zrevrange(
      FAILED_QUERIES_KEY,
      0,
      limit - 1,
      'WITHSCORES'
    );

    const queries: Array<{ query: string; count: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      queries.push({
        query: results[i],
        count: parseInt(results[i + 1], 10),
      });
    }

    return queries;
  } catch (error) {
    console.error('Failed to get failed queries:', error);
    return [];
  }
}

// ─── Query CTR tracking ────────────────────────────────────────────────

export async function trackQueryImpression(query: string): Promise<void> {
  if (!query.trim()) return;
  if (!redis) return;

  try {
    const key = `${QUERY_CTR_PREFIX}${query.toLowerCase().trim()}`;
    await redis.hincrby(key, 'impressions', 1);
    await redis.expire(key, 7 * 24 * 3600); // 7 day TTL
  } catch (error) {
    console.error('Failed to track query impression:', error);
  }
}

export async function trackQueryClick(query: string): Promise<void> {
  if (!query.trim()) return;
  if (!redis) return;

  try {
    const key = `${QUERY_CTR_PREFIX}${query.toLowerCase().trim()}`;
    await redis.hincrby(key, 'clicks', 1);
  } catch (error) {
    console.error('Failed to track query click:', error);
  }
}

export async function getQueryCTR(
  query: string
): Promise<{ impressions: number; clicks: number; ctr: number }> {
  if (!redis) return { impressions: 0, clicks: 0, ctr: 0 };

  try {
    const key = `${QUERY_CTR_PREFIX}${query.toLowerCase().trim()}`;
    const data = await redis.hgetall(key);

    const impressions = parseInt(data.impressions || '0', 10);
    const clicks = parseInt(data.clicks || '0', 10);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return { impressions, clicks, ctr: Math.round(ctr * 100) / 100 };
  } catch (error) {
    console.error('Failed to get query CTR:', error);
    return { impressions: 0, clicks: 0, ctr: 0 };
  }
}

// ─── Click-through metrics from database ───────────────────────────────

export async function getTopSearchQueries(
  limit: number = 20,
  days: number = 30
): Promise<
  Array<{
    query: string;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    totalRevenue: number;
  }>
> {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const metrics = await prisma.searchClickMetrics.groupBy({
      by: ['query'],
      _sum: {
        clicks: true,
        conversions: true,
        revenue: true,
      },
      where: {
        updatedAt: { gte: since },
      },
      orderBy: {
        _sum: { clicks: 'desc' },
      },
      take: limit,
    });

    return metrics.map((m) => {
      const totalClicks = m._sum.clicks ?? 0;
      const totalConversions = m._sum.conversions ?? 0;
      const avgCTR =
        totalClicks > 0
          ? Math.round((totalConversions / totalClicks) * 100 * 100) / 100
          : 0;
      return {
        query: m.query,
        totalClicks,
        totalConversions,
        avgCTR,
        totalRevenue: parseFloat((m._sum.revenue ?? 0).toString()),
      };
    });
  } catch (error) {
    console.error('Failed to get top search queries:', error);
    return [];
  }
}

// ─── Search funnel overview ────────────────────────────────────────────

export async function getSearchFunnel(
  days: number = 30
): Promise<{
  totalSearches: number;
  searchesWithClicks: number;
  searchesWithConversions: number;
  clickThroughRate: number;
  conversionRate: number;
}> {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const [totalClicks, totalConversions] = await Promise.all([
      prisma.searchClickEvent.count({
        where: { clickedAt: { gte: since } },
      }),
      prisma.searchClickMetrics.aggregate({
        _sum: { conversions: true },
        where: { updatedAt: { gte: since } },
      }),
    ]);

    const uniqueQueries = await prisma.searchClickEvent.groupBy({
      by: ['query'],
      where: { clickedAt: { gte: since } },
    });

    const conversions = totalConversions._sum.conversions ?? 0;

    return {
      totalSearches: uniqueQueries.length,
      searchesWithClicks: totalClicks,
      searchesWithConversions: conversions,
      clickThroughRate:
        uniqueQueries.length > 0
          ? Math.round((totalClicks / uniqueQueries.length) * 100 * 100) / 100
          : 0,
      conversionRate:
        totalClicks > 0
          ? Math.round((conversions / totalClicks) * 100 * 100) / 100
          : 0,
    };
  } catch (error) {
    console.error('Failed to get search funnel:', error);
    return {
      totalSearches: 0,
      searchesWithClicks: 0,
      searchesWithConversions: 0,
      clickThroughRate: 0,
      conversionRate: 0,
    };
  }
}
