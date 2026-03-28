/**
 * lib/elasticsearch/filterBuilder.ts
 *
 * Dynamic filter/aggregation builder for search results.
 * Generates faceted filters like Daraz/Flipkart:
 *   - Category counts update as you filter
 *   - Brand counts update as you filter
 *   - Price range buckets
 *   - Rating distribution
 *   - Availability filter
 */

import { esClient, PRODUCT_INDEX } from '../elasticsearch';

export interface SearchFacets {
  categories: Array<{ value: string; count: number }>;
  brands: Array<{ value: string; count: number }>;
  priceRanges: Array<{ value: string; count: number; from?: number; to?: number }>;
  ratings: Array<{ value: string; count: number; rating: number }>;
  priceStats: { avg: number; min: number; max: number };
  totalInStock: number;
  totalOnSale: number;
}

/**
 * Build aggregations for dynamic faceted search.
 * These run alongside the search query to provide filter counts.
 */
export function buildFilterAggregations(): Record<string, any> {
  return {
    categories: {
      terms: {
        field: 'category',
        size: 50,
        order: { _count: 'desc' },
      },
    },
    brands: {
      terms: {
        field: 'brand.keyword',
        size: 50,
        order: { _count: 'desc' },
      },
    },
    price_ranges: {
      range: {
        field: 'price',
        ranges: [
          { key: 'Under ৳500', to: 500 },
          { key: '৳500 - ৳1000', from: 500, to: 1000 },
          { key: '৳1000 - ৳2000', from: 1000, to: 2000 },
          { key: '৳2000 - ৳5000', from: 2000, to: 5000 },
          { key: 'Over ৳5000', from: 5000 },
        ],
      },
    },
    avg_price: { avg: { field: 'price' } },
    min_price: { min: { field: 'price' } },
    max_price: { max: { field: 'price' } },
    ratings: {
      range: {
        field: 'rating',
        ranges: [
          { key: '4★ & above', from: 4 },
          { key: '3★ & above', from: 3 },
          { key: '2★ & above', from: 2 },
          { key: '1★ & above', from: 1 },
        ],
      },
    },
    in_stock: {
      filter: { term: { inStock: true } },
    },
    on_sale: {
      filter: { range: { discount: { gt: 0 } } },
    },
  };
}

/**
 * Parse ES aggregation response into clean facets.
 */
export function parseAggregations(aggs: any): SearchFacets {
  const categories = (aggs?.categories?.buckets || []).map(
    (b: any) => ({ value: b.key, count: b.doc_count })
  );

  const brands = (aggs?.brands?.buckets || []).map(
    (b: any) => ({ value: b.key, count: b.doc_count })
  );

  const priceRanges = (aggs?.price_ranges?.buckets || []).map(
    (b: any) => ({
      value: b.key,
      count: b.doc_count,
      from: b.from,
      to: b.to,
    })
  );

  const ratings = (aggs?.ratings?.buckets || []).map(
    (b: any) => ({
      value: b.key,
      count: b.doc_count,
      rating: b.from,
    })
  );

  return {
    categories,
    brands,
    priceRanges,
    ratings,
    priceStats: {
      avg: Math.round(aggs?.avg_price?.value ?? 0),
      min: Math.round(aggs?.min_price?.value ?? 0),
      max: Math.round(aggs?.max_price?.value ?? 0),
    },
    totalInStock: aggs?.in_stock?.doc_count ?? 0,
    totalOnSale: aggs?.on_sale?.doc_count ?? 0,
  };
}

/**
 * Get available filters for a given query + existing filters.
 * This is the "smart filter" — counts update as you apply filters.
 */
export async function getAvailableFilters(
  query: string,
  appliedFilters: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    rating?: number;
  } = {}
): Promise<SearchFacets> {
  const must: any[] = [];
  const filter: any[] = [];

  if (query.trim()) {
    must.push({
      multi_match: {
        query,
        fields: ['name^5', 'brand^3', 'category^2', 'description', 'tags^2'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  if (appliedFilters.category) {
    filter.push({ term: { category: appliedFilters.category } });
  }
  if (appliedFilters.brand) {
    filter.push({ term: { 'brand.keyword': appliedFilters.brand } });
  }
  if (appliedFilters.minPrice || appliedFilters.maxPrice) {
    const range: Record<string, number> = {};
    if (appliedFilters.minPrice) range.gte = appliedFilters.minPrice;
    if (appliedFilters.maxPrice) range.lte = appliedFilters.maxPrice;
    filter.push({ range: { price: range } });
  }
  if (appliedFilters.inStock) {
    filter.push({ term: { inStock: true } });
  }
  if (appliedFilters.rating) {
    filter.push({ range: { rating: { gte: appliedFilters.rating } } });
  }

  try {
    const response = await esClient.search({
      index: PRODUCT_INDEX,
      size: 0, // We only want aggregations
      query: { bool: { must, filter } },
      aggs: buildFilterAggregations(),
    });

    return parseAggregations(response.aggregations);
  } catch (error) {
    console.error('Failed to get available filters:', error);
    return {
      categories: [],
      brands: [],
      priceRanges: [],
      ratings: [],
      priceStats: { avg: 0, min: 0, max: 0 },
      totalInStock: 0,
      totalOnSale: 0,
    };
  }
}
