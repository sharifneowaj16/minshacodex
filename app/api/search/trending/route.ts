/**
 * app/api/search/trending/route.ts
 *
 * GET /api/search/trending
 *   - Returns trending search queries and popular product IDs
 *   - Query params: limit (default 10)
 *
 * Daraz-level feature: powers "Trending Searches" UI chips
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrendingQueries, getTrendingProductIds } from '@/lib/elasticsearch/trending';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '10',
      10
    );

    const [trendingQueries, trendingProductIds] = await Promise.all([
      getTrendingQueries(limit),
      getTrendingProductIds(limit),
    ]);

    // Fetch product details for trending products
    let trendingProducts: any[] = [];

    if (trendingProductIds.length > 0) {
      try {
        const response = await esClient.search({
          index: PRODUCT_INDEX,
          query: {
            ids: { values: trendingProductIds },
          },
          size: trendingProductIds.length,
          _source: ['id', 'name', 'slug', 'price', 'image', 'rating', 'brand', 'discount'],
        });

        trendingProducts = response.hits.hits.map((hit) => ({
          ...(hit._source as Record<string, unknown>),
          _score: hit._score,
        }));
      } catch {
        // ES might not have these products — that's fine
      }
    }

    return NextResponse.json({
      success: true,
      trendingQueries,
      trendingProducts,
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}
