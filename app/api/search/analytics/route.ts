/**
 * app/api/search/analytics/route.ts
 *
 * GET /api/search/analytics
 *   - Top queries, failed queries, CTR stats, search funnel
 *   - Query params: days (default 30), limit (default 20)
 *
 * Admin-facing search intelligence.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTopSearchQueries,
  getFailedQueries,
  getSearchFunnel,
} from '@/lib/elasticsearch/searchAnalytics';
import { searchMetrics } from '@/lib/elasticsearch/metrics';

export async function GET(request: NextRequest) {
  try {
    const days = parseInt(
      request.nextUrl.searchParams.get('days') || '30',
      10
    );
    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '20',
      10
    );

    const [topQueries, failedQueries, funnel] = await Promise.all([
      getTopSearchQueries(limit, days),
      getFailedQueries(limit),
      getSearchFunnel(days),
    ]);

    // In-memory metrics (recent)
    const realtimeMetrics = searchMetrics.getSummary(60);
    const zeroResultQueries = searchMetrics.getZeroResultQueries(days * 24 * 60);

    return NextResponse.json({
      success: true,
      period: { days },
      funnel,
      topQueries,
      failedQueries,
      zeroResultQueries,
      realtime: {
        totalSearches: realtimeMetrics.totalSearches,
        averageDuration: realtimeMetrics.averageDuration,
        successRate: realtimeMetrics.successRate,
        averageResultCount: realtimeMetrics.averageResultCount,
        popularQueries: realtimeMetrics.popularQueries.slice(0, 10),
        slowQueries: realtimeMetrics.slowQueries.slice(0, 5),
        filtersUsage: realtimeMetrics.filtersUsage,
      },
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}
