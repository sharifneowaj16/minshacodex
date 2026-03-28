import { NextRequest, NextResponse } from 'next/server';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';
import { searchMetrics } from '@/lib/elasticsearch/metrics';

// ✅ Option A: Define proper types
interface ProductSuggestSource {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isNewArrival?: boolean;
}

interface SuggestionOption {
  text: string;
  _score: number;
  _source?: ProductSuggestSource;
}

interface ElasticsearchSuggestResponse {
  product_suggest?: Array<{
    text: string;
    offset: number;
    length: number;
    options: SuggestionOption[];
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q') || '';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');
    const trending = request.nextUrl.searchParams.get('trending') === 'true';

    // ✅ TRENDING SEARCHES: Return popular queries when requested or no query
    if (trending || !query.trim()) {
      const trendingLimit = parseInt(request.nextUrl.searchParams.get('trendingLimit') || '8');
      const popularQueries = searchMetrics.getSummary().popularQueries.slice(0, trendingLimit);

      // If we also have a query, mix trending with product completions
      if (query.trim()) {
        const [trendingSuggestions, productSuggestions] = await Promise.all([
          Promise.resolve(
            popularQueries
              .filter(q => q.query.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 3)
              .map(q => ({
                type: 'trending' as const,
                text: q.query,
                count: q.count,
                icon: '🔥',
              }))
          ),
          fetchProductSuggestions(query, limit),
        ]);

        return NextResponse.json({
          success: true,
          count: trendingSuggestions.length + productSuggestions.length,
          suggestions: [
            ...productSuggestions,
            ...trendingSuggestions,
          ],
        });
      }

      // Return pure trending suggestions
      const trendingSuggestions = popularQueries.map(q => ({
        type: 'trending' as const,
        text: q.query,
        count: q.count,
        icon: '🔥',
      }));

      return NextResponse.json({
        success: true,
        count: trendingSuggestions.length,
        suggestions: trendingSuggestions,
      });
    }

    // ✅ PRODUCT COMPLETION SUGGESTIONS
    const productSuggestions = await fetchProductSuggestions(query, limit);

    // ✅ Also include any trending queries that match
    const popularQueries = searchMetrics.getSummary().popularQueries;
    const matchingTrending = popularQueries
      .filter(q => q.query.toLowerCase().startsWith(query.toLowerCase()) && q.query !== query)
      .slice(0, 2)
      .map(q => ({
        type: 'trending' as const,
        text: q.query,
        count: q.count,
        icon: '🔥',
      }));

    const suggestions = [...productSuggestions, ...matchingTrending];

    return NextResponse.json({
      success: true,
      count: suggestions.length,
      suggestions,
    });

  } catch (error) {
    console.error('❌ Suggestions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ✅ Fetch product completion suggestions from Elasticsearch
async function fetchProductSuggestions(query: string, limit: number) {
  try {
    // ✅ v9 style - no body wrapper
    const response = await esClient.search({
      index: PRODUCT_INDEX,
      suggest: {
        product_suggest: {
          prefix: query,
          completion: {
            field: 'suggest',
            size: limit,
            skip_duplicates: true,
          }
        }
      },
      _source: ['id', 'name', 'slug', 'price', 'images', 'isFeatured', 'isFlashSale', 'isNewArrival']
    });

    // ✅ Type-safe extraction with Option A
    const suggestData = response.suggest as ElasticsearchSuggestResponse;
    const options = suggestData.product_suggest?.[0]?.options ?? [];

    // ✅ Map with promotional badges
    return options.map(option => {
      const badges: string[] = [];
      if (option._source?.isFeatured) badges.push('Featured');
      if (option._source?.isFlashSale) badges.push('Flash Sale');
      if (option._source?.isNewArrival) badges.push('New');

      return {
        type: 'product' as const,
        text: option.text,
        productId: option._source?.id ?? '',
        productName: option._source?.name ?? '',
        slug: option._source?.slug ?? '',
        price: option._source?.price ?? 0,
        image: option._source?.images?.[0],
        score: option._score,
        badges,
      };
    });
  } catch (error) {
    console.error('❌ Product suggestions fetch error:', error);
    return [];
  }
}
