import { NextRequest, NextResponse } from 'next/server';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';
import { sanitizeQuery, validateNumericParam, validateSearchParams } from '@/lib/elasticsearch/utils';
import { searchMetrics } from '@/lib/elasticsearch/metrics';
import { BehaviorTracker } from '@/lib/tracking/behavior';
// ✅ CTR + Discount boost (Amazon A9 + Daraz style)
import {
  getQueryCTRData,
  buildCTRBoostFunctions,
  buildDiscountBoostFunctions,
} from '@/lib/elasticsearch/ctrBoost';

// ✅ Type definitions for search
interface ProductSource {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  images?: string[];
  inStock: boolean;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isNewArrival?: boolean;
}

interface SearchHit {
  _id: string;
  _score: number;
  _source: ProductSource;
  highlight?: {
    name?: string[];
    description?: string[];
  };
}

interface AggregationBucket {
  key: string;
  doc_count: number;
}

interface SpellSuggestion {
  text: string;
  offset: number;
  length: number;
  options: Array<{
    text: string;
    score: number;
    freq: number;
  }>;
}

interface ElasticsearchSearchResponse {
  hits: {
    total: number | { value: number; relation: string };
    hits: SearchHit[];
  };
  aggregations?: {
    categories?: { buckets: AggregationBucket[] };
    brands?: { buckets: AggregationBucket[] };
    price_ranges?: { buckets: AggregationBucket[] };
    avg_price?: { value?: number };
    min_price?: { value?: number };
    max_price?: { value?: number };
  };
  suggest?: {
    spell_correction?: SpellSuggestion[];
  };
}

// ✅ Zero-results fallback strategy
interface ZeroResultsFallback {
  strategy: 'relaxed_query' | 'category_browse' | 'popular_products';
  message: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let errorMessage: string | undefined;

  try {
    const searchParams = request.nextUrl.searchParams;

    // ✅ VALIDATE REQUEST PARAMETERS
    const validation = validateSearchParams(searchParams);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // ✅ SANITIZE AND VALIDATE INPUT
    const rawQuery = searchParams.get('q') || '';
    const query = sanitizeQuery(rawQuery);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock') === 'true';
    const brand = searchParams.get('brand');
    const rating = searchParams.get('rating');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    const page = validateNumericParam(searchParams.get('page'), 1, 1, 1000);
    const limit = validateNumericParam(searchParams.get('limit'), 20, 1, 100);
    const sort = searchParams.get('sort') || 'relevance';

    // ✅ Get user behavior for personalization (returns null server-side, handled below)
    const behavior = BehaviorTracker.getBehavior();
    const userCategories = behavior?.categoriesViewed || [];

    // ✅ FETCH CTR DATA in parallel (Redis cache 5min → DB fallback)
    // Only when sort=relevance — price/newest sort doesn't need CTR boost
    const ctrDataPromise = (query.trim() && sort === 'relevance')
      ? getQueryCTRData(query, 20)
      : Promise.resolve([]);

    // ========================================
    // BUILD ELASTICSEARCH QUERY
    // ========================================
    const must: any[] = [];
    const filter: any[] = [];
    const should: any[] = [];

    // ✅ MAIN SEARCH QUERY with SYNONYMS (via beauty_search analyzer on name/description)
    if (query.trim()) {
      must.push({
        multi_match: {
          query: query,
          fields: [
            'name^5',
            'brand^3',
            'category^2',
            'description^1.5',
            'tags^2',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 2,
        }
      });

      // Boost exact phrase matches
      should.push({
        match_phrase: {
          name: {
            query: query,
            boost: 3,
          }
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    // ✅ PERSONALIZED RANKING: boost user's previously viewed categories
    if (userCategories.length > 0 && query.trim()) {
      should.push({
        terms: {
          'category.keyword': userCategories, // 👈 FIXED
          boost: 1.5,
        }
      });
    }

    // ✅ FILTERS
    if (category) {
      filter.push({ term: { 'category.keyword': category } }); // 👈 FIXED
    }
    if (subcategory) {
      filter.push({ term: { 'subcategory.keyword': subcategory } }); // 👈 FIXED
    }
    if (brand) {
      filter.push({ term: { 'brand.keyword': brand } }); // 👈 FIXED
    }
    if (minPrice || maxPrice) {
      const priceRange: any = {};
      if (minPrice) priceRange.gte = parseFloat(minPrice);
      if (maxPrice) priceRange.lte = parseFloat(maxPrice);
      filter.push({ range: { price: priceRange } });
    }
    if (inStock) {
      filter.push({ term: { inStock: true } });
    }
    if (rating) {
      filter.push({ range: { rating: { gte: parseFloat(rating) } } });
    }
    if (tags && tags.length > 0) {
      filter.push({ terms: { 'tags.keyword': tags } }); // 👈 FIXED
    }

    // ========================================
    // ✅ PROMOTIONAL BOOSTING with function_score
    // ========================================

    // ✅ Await CTR data (was fetching in parallel above)
    const ctrData = await ctrDataPromise;
    const ctrBoostFunctions = buildCTRBoostFunctions(ctrData, 3.0);
    const discountBoostFunctions = buildDiscountBoostFunctions();

    const promotionalFunctions: any[] = [
      // ── Admin / promotional signals ──
      { filter: { term: { isFeatured: true } }, weight: 2.0 },
      { filter: { term: { isFlashSale: true } }, weight: 1.8 },
      { filter: { term: { isNewArrival: true } }, weight: 1.3 },

      // ✅ CTR-based re-ranking (Amazon A9 style)
      // Dynamic per-query: products clicked most for this query rise up
      ...ctrBoostFunctions,

      // ✅ Discount boost (Daraz style)
      // ≥40% off → 1.6x | ≥20% off → 1.3x | ≥10% off → 1.15x
      ...discountBoostFunctions,

      {
        field_value_factor: {
          field: 'rating',
          factor: 0.1,
          modifier: 'sqrt',
          missing: 1,
        }
      },
      {
        field_value_factor: {
          field: 'reviewCount',
          factor: 0.01,
          modifier: 'log1p',
          missing: 1,
        }
      },
    ];

    // Add personalization boost if user has category preferences
    if (userCategories.length > 0) {
      promotionalFunctions.push({
        filter: { terms: { 'category.keyword': userCategories } }, // 👈 FIXED
        weight: 1.4,
      });
    }

    const searchQuery: any = {
      function_score: {
        query: {
          bool: {
            must,
            filter,
            should,
            minimum_should_match: should.length > 0 ? 0 : undefined,
          }
        },
        functions: promotionalFunctions,
        score_mode: 'sum',
        boost_mode: 'multiply',
      }
    };

    // ========================================
    // DETERMINE SORT ORDER
    // ========================================
    let sortOrder: any[] = [];

    switch (sort) {
      case 'price_asc':
        sortOrder = [{ price: 'asc' }, { _score: 'desc' }];
        break;
      case 'price_desc':
        sortOrder = [{ price: 'desc' }, { _score: 'desc' }];
        break;
      case 'newest':
        sortOrder = [{ createdAt: 'desc' }, { _score: 'desc' }];
        break;
      case 'rating':
        sortOrder = [{ rating: 'desc' }, { _score: 'desc' }];
        break;
      case 'name_asc':
        sortOrder = [{ 'name.keyword': 'asc' }];
        break;
      case 'name_desc':
        sortOrder = [{ 'name.keyword': 'desc' }];
        break;
      case 'relevance':
      default:
        sortOrder = [{ _score: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // ========================================
    // ✅ EXECUTE SEARCH with SPELL CORRECTION
    // ========================================
    const searchBody: any = {
      query: searchQuery,
      from: (page - 1) * limit,
      size: limit,
      sort: sortOrder,
      highlight: {
        fields: {
          name: {},
          description: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
      aggs: {
        categories: {
          terms: { field: 'category.keyword', size: 20 } // 👈 FIXED
        },
        brands: {
          terms: { field: 'brand.keyword', size: 20 } // 👈 FIXED
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { key: 'Under 500', to: 500 },
              { key: '500-1000', from: 500, to: 1000 },
              { key: '1000-2000', from: 1000, to: 2000 },
              { key: 'Over 2000', from: 2000 },
            ]
          }
        },
        avg_price: { avg: { field: 'price' } },
        min_price: { min: { field: 'price' } },
        max_price: { max: { field: 'price' } },
      }
    };

    // ✅ ADD SPELL CORRECTION (phrase suggester) if query present
    if (query.trim()) {
      searchBody.suggest = {
        spell_correction: {
          text: query,
          phrase: {
            field: 'name',
            size: 1,
            gram_size: 2,
            direct_generator: [
              {
                field: 'name',
                suggest_mode: 'always',
                min_word_length: 3,
              }
            ],
            highlight: {
              pre_tag: '<em>',
              post_tag: '</em>',
            }
          }
        }
      };
    }

    const response = await esClient.search({
      index: PRODUCT_INDEX,
      ...searchBody,
    }) as unknown as ElasticsearchSearchResponse;

    // ========================================
    // PROCESS RESULTS
    // ========================================
    const totalHits = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total.value;

    let products: Array<ProductSource & { score: number | null; highlighted?: { name?: string; description?: string } }> = response.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score,
      highlighted: {
        name: hit.highlight?.name?.[0],
        description: hit.highlight?.description?.[0],
      }
    }));

    // ========================================
    // ✅ SMART ZERO-RESULTS HANDLING
    // ========================================
    let zeroResultsFallback: ZeroResultsFallback | null = null;

    if (totalHits === 0 && query.trim()) {
      // Strategy 1: Relax filters (keep query, remove category/price/stock filters)
      if (filter.length > 0) {
        const relaxedQuery: any = {
          function_score: {
            query: {
              bool: {
                must,
                should,
              }
            },
            functions: [
              { filter: { term: { isFeatured: true } }, weight: 2.0 },
              { filter: { term: { isFlashSale: true } }, weight: 1.8 },
            ],
            score_mode: 'sum',
            boost_mode: 'multiply',
          }
        };

        const relaxedResponse = await esClient.search({
          index: PRODUCT_INDEX,
          query: relaxedQuery,
          size: limit,
          sort: sortOrder,
        }) as unknown as ElasticsearchSearchResponse;

        const relaxedTotal = typeof relaxedResponse.hits.total === 'number'
          ? relaxedResponse.hits.total
          : relaxedResponse.hits.total.value;

        if (relaxedTotal > 0) {
          products = relaxedResponse.hits.hits.map(hit => ({
            ...hit._source,
            score: hit._score,
          }));
          zeroResultsFallback = {
            strategy: 'relaxed_query',
            message: 'No exact matches found. Showing similar products:',
          };
        }
      }

      // Strategy 2: Show popular products from user's preferred categories
      if (products.length === 0 && userCategories.length > 0) {
        const categoryBrowseResponse = await esClient.search({
          index: PRODUCT_INDEX,
          query: {
            bool: {
              must: [{ terms: { 'category.keyword': userCategories.slice(0, 3) } }] // 👈 FIXED
            }
          } as any,
          sort: [{ rating: { order: 'desc' as const } }, { reviewCount: { order: 'desc' as const } }],
          size: limit,
        }) as unknown as ElasticsearchSearchResponse;

        const browseTotal = typeof categoryBrowseResponse.hits.total === 'number'
          ? categoryBrowseResponse.hits.total
          : categoryBrowseResponse.hits.total.value;

        if (browseTotal > 0) {
          products = categoryBrowseResponse.hits.hits.map(hit => ({
            ...hit._source,
            score: hit._score,
          }));
          zeroResultsFallback = {
            strategy: 'category_browse',
            message: `No results for "${query}". You might like these from ${userCategories[0]}:`,
          };
        }
      }

      // Strategy 3: Fall back to featured/popular products
      if (products.length === 0) {
        const popularResponse = await esClient.search({
          index: PRODUCT_INDEX,
          query: {
            bool: {
              should: [
                { term: { isFeatured: { value: true, boost: 2 } } },
                { term: { isFlashSale: { value: true, boost: 1.5 } } },
              ]
            }
          } as any,
          sort: [{ _score: { order: 'desc' as const } }, { rating: { order: 'desc' as const } }],
          size: limit,
        }) as unknown as ElasticsearchSearchResponse;

        products = popularResponse.hits.hits.map(hit => ({
          ...hit._source,
          score: hit._score,
        }));
        zeroResultsFallback = {
          strategy: 'popular_products',
          message: `No results for "${query}". Check out our popular products:`,
        };
      }
    }

    // ✅ EXTRACT SPELL CORRECTION SUGGESTION
    let spellSuggestion: string | null = null;
    if (response.suggest?.spell_correction?.[0]?.options?.length) {
      const suggestion = response.suggest.spell_correction[0].options[0];
      if (suggestion.text.toLowerCase() !== query.toLowerCase()) {
        spellSuggestion = suggestion.text;
      }
    }

    // ========================================
    // TRACK METRICS
    // ========================================
    const duration = Date.now() - startTime;
    const filtersUsed = [
      category && 'category',
      subcategory && 'subcategory',
      brand && 'brand',
      (minPrice || maxPrice) && 'price',
      inStock && 'inStock',
      rating && 'rating',
      tags && 'tags',
    ].filter(Boolean) as string[];

    searchMetrics.add({
      query: query || '[empty]',
      duration,
      resultCount: totalHits,
      filters: filtersUsed,
      timestamp: new Date(),
      success: true,
    });

    // ✅ Track search in behavior system (no-op on server, runs client-side only)
    if (query.trim()) {
      BehaviorTracker.trackEvent('Search', {
        query,
        resultCount: totalHits,
        filters: filtersUsed,
        hadResults: totalHits > 0,
        usedFallback: !!zeroResultsFallback,
      });
    }

    // ========================================
    // RETURN RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      query,
      spellSuggestion,
      total: totalHits,
      page,
      limit,
      totalPages: Math.ceil((totalHits || products.length) / limit),
      products,
      ...(zeroResultsFallback && {
        fallback: {
          strategy: zeroResultsFallback.strategy,
          message: zeroResultsFallback.message,
          applied: true,
        }
      }),
      facets: {
        categories: response.aggregations?.categories?.buckets.map(b => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
        brands: response.aggregations?.brands?.buckets.map(b => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
        priceRanges: response.aggregations?.price_ranges?.buckets.map(b => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
      },
      priceStats: {
        avg: response.aggregations?.avg_price?.value || 0,
        min: response.aggregations?.min_price?.value || 0,
        max: response.aggregations?.max_price?.value || 0,
      },
      meta: {
        duration,
        sort,
        filters: filtersUsed,
        personalized: userCategories.length > 0,
        preferredCategories: userCategories.slice(0, 3),
        ctrBoostsApplied: ctrBoostFunctions.length,
      }
    }, {
      headers: {
        'X-Search-Duration': String(duration),
        'X-Result-Count': String(totalHits),
        'Cache-Control': 'public, max-age=60',
      }
    });

  } catch (error: any) {
    errorMessage = error.message;
    console.error('❌ Search error:', error);

    searchMetrics.add({
      query: sanitizeQuery(request.nextUrl.searchParams.get('q') || ''),
      duration: Date.now() - startTime,
      resultCount: 0,
      filters: [],
      timestamp: new Date(),
      success: false,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';
// import { sanitizeQuery, validateNumericParam, validateSearchParams } from '@/lib/elasticsearch/utils';
// import { searchMetrics } from '@/lib/elasticsearch/metrics';
// import { BehaviorTracker } from '@/lib/tracking/behavior';
// // ✅ CTR + Discount boost (Amazon A9 + Daraz style)
// import {
//   getQueryCTRData,
//   buildCTRBoostFunctions,
//   buildDiscountBoostFunctions,
// } from '@/lib/elasticsearch/ctrBoost';

// // ✅ Type definitions for search
// interface ProductSource {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
//   price: number;
//   compareAtPrice?: number;
//   category?: string;
//   subcategory?: string;
//   brand?: string;
//   images?: string[];
//   inStock: boolean;
//   rating?: number;
//   tags?: string[];
//   isFeatured?: boolean;
//   isFlashSale?: boolean;
//   isNewArrival?: boolean;
// }

// interface SearchHit {
//   _id: string;
//   _score: number;
//   _source: ProductSource;
//   highlight?: {
//     name?: string[];
//     description?: string[];
//   };
// }

// interface AggregationBucket {
//   key: string;
//   doc_count: number;
// }

// interface SpellSuggestion {
//   text: string;
//   offset: number;
//   length: number;
//   options: Array<{
//     text: string;
//     score: number;
//     freq: number;
//   }>;
// }

// interface ElasticsearchSearchResponse {
//   hits: {
//     total: number | { value: number; relation: string };
//     hits: SearchHit[];
//   };
//   aggregations?: {
//     categories?: { buckets: AggregationBucket[] };
//     brands?: { buckets: AggregationBucket[] };
//     price_ranges?: { buckets: AggregationBucket[] };
//     avg_price?: { value?: number };
//     min_price?: { value?: number };
//     max_price?: { value?: number };
//   };
//   suggest?: {
//     spell_correction?: SpellSuggestion[];
//   };
// }

// // ✅ Zero-results fallback strategy
// interface ZeroResultsFallback {
//   strategy: 'relaxed_query' | 'category_browse' | 'popular_products';
//   message: string;
// }

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   let errorMessage: string | undefined;

//   try {
//     const searchParams = request.nextUrl.searchParams;

//     // ✅ VALIDATE REQUEST PARAMETERS
//     const validation = validateSearchParams(searchParams);
//     if (!validation.valid) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Invalid request parameters',
//           details: validation.errors,
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ SANITIZE AND VALIDATE INPUT
//     const rawQuery = searchParams.get('q') || '';
//     const query = sanitizeQuery(rawQuery);
//     const category = searchParams.get('category');
//     const subcategory = searchParams.get('subcategory');
//     const minPrice = searchParams.get('minPrice');
//     const maxPrice = searchParams.get('maxPrice');
//     const inStock = searchParams.get('inStock') === 'true';
//     const brand = searchParams.get('brand');
//     const rating = searchParams.get('rating');
//     const tags = searchParams.get('tags')?.split(',').filter(Boolean);

//     const page = validateNumericParam(searchParams.get('page'), 1, 1, 1000);
//     const limit = validateNumericParam(searchParams.get('limit'), 20, 1, 100);
//     const sort = searchParams.get('sort') || 'relevance';

//     // ✅ Get user behavior for personalization (returns null server-side, handled below)
//     const behavior = BehaviorTracker.getBehavior();
//     const userCategories = behavior?.categoriesViewed || [];

//     // ✅ FETCH CTR DATA in parallel (Redis cache 5min → DB fallback)
//     // Only when sort=relevance — price/newest sort doesn't need CTR boost
//     const ctrDataPromise = (query.trim() && sort === 'relevance')
//       ? getQueryCTRData(query, 20)
//       : Promise.resolve([]);

//     // ========================================
//     // BUILD ELASTICSEARCH QUERY
//     // ========================================
//     const must: any[] = [];
//     const filter: any[] = [];
//     const should: any[] = [];

//     // ✅ MAIN SEARCH QUERY with SYNONYMS (via beauty_search analyzer on name/description)
//     if (query.trim()) {
//       must.push({
//         multi_match: {
//           query: query,
//           fields: [
//             'name^5',
//             'brand^3',
//             'category^2',
//             'description^1.5',
//             'tags^2',
//           ],
//           type: 'best_fields',
//           fuzziness: 'AUTO',
//           prefix_length: 2,
//         }
//       });

//       // Boost exact phrase matches
//       should.push({
//         match_phrase: {
//           name: {
//             query: query,
//             boost: 3,
//           }
//         }
//       });
//     } else {
//       must.push({ match_all: {} });
//     }

//     // ✅ PERSONALIZED RANKING: boost user's previously viewed categories
//     if (userCategories.length > 0 && query.trim()) {
//       should.push({
//         terms: {
//           category: userCategories,
//           boost: 1.5,
//         }
//       });
//     }

//     // ✅ FILTERS
//     if (category) {
//       filter.push({ term: { category } });
//     }
//     if (subcategory) {
//       filter.push({ term: { subcategory } });
//     }
//     if (brand) {
//       filter.push({ term: { brand } });
//     }
//     if (minPrice || maxPrice) {
//       const priceRange: any = {};
//       if (minPrice) priceRange.gte = parseFloat(minPrice);
//       if (maxPrice) priceRange.lte = parseFloat(maxPrice);
//       filter.push({ range: { price: priceRange } });
//     }
//     if (inStock) {
//       filter.push({ term: { inStock: true } });
//     }
//     if (rating) {
//       filter.push({ range: { rating: { gte: parseFloat(rating) } } });
//     }
//     if (tags && tags.length > 0) {
//       filter.push({ terms: { tags } });
//     }

//     // ========================================
//     // ✅ PROMOTIONAL BOOSTING with function_score
//     // ========================================

//     // ✅ Await CTR data (was fetching in parallel above)
//     const ctrData = await ctrDataPromise;
//     const ctrBoostFunctions = buildCTRBoostFunctions(ctrData, 3.0);
//     const discountBoostFunctions = buildDiscountBoostFunctions();

//     const promotionalFunctions: any[] = [
//       // ── Admin / promotional signals ──
//       { filter: { term: { isFeatured: true } }, weight: 2.0 },
//       { filter: { term: { isFlashSale: true } }, weight: 1.8 },
//       { filter: { term: { isNewArrival: true } }, weight: 1.3 },

//       // ✅ CTR-based re-ranking (Amazon A9 style)
//       // Dynamic per-query: products clicked most for this query rise up
//       ...ctrBoostFunctions,

//       // ✅ Discount boost (Daraz style)
//       // ≥40% off → 1.6x | ≥20% off → 1.3x | ≥10% off → 1.15x
//       ...discountBoostFunctions,

//       {
//         field_value_factor: {
//           field: 'rating',
//           factor: 0.1,
//           modifier: 'sqrt',
//           missing: 1,
//         }
//       },
//       {
//         field_value_factor: {
//           field: 'reviewCount',
//           factor: 0.01,
//           modifier: 'log1p',
//           missing: 1,
//         }
//       },
//     ];

//     // Add personalization boost if user has category preferences
//     if (userCategories.length > 0) {
//       promotionalFunctions.push({
//         filter: { terms: { category: userCategories } },
//         weight: 1.4,
//       });
//     }

//     const searchQuery: any = {
//       function_score: {
//         query: {
//           bool: {
//             must,
//             filter,
//             should,
//             minimum_should_match: should.length > 0 ? 0 : undefined,
//           }
//         },
//         functions: promotionalFunctions,
//         score_mode: 'sum',
//         boost_mode: 'multiply',
//       }
//     };

//     // ========================================
//     // DETERMINE SORT ORDER
//     // ========================================
//     let sortOrder: any[] = [];

//     switch (sort) {
//       case 'price_asc':
//         sortOrder = [{ price: 'asc' }, { _score: 'desc' }];
//         break;
//       case 'price_desc':
//         sortOrder = [{ price: 'desc' }, { _score: 'desc' }];
//         break;
//       case 'newest':
//         sortOrder = [{ createdAt: 'desc' }, { _score: 'desc' }];
//         break;
//       case 'rating':
//         sortOrder = [{ rating: 'desc' }, { _score: 'desc' }];
//         break;
//       case 'name_asc':
//         sortOrder = [{ 'name.keyword': 'asc' }];
//         break;
//       case 'name_desc':
//         sortOrder = [{ 'name.keyword': 'desc' }];
//         break;
//       case 'relevance':
//       default:
//         sortOrder = [{ _score: 'desc' }, { createdAt: 'desc' }];
//         break;
//     }

//     // ========================================
//     // ✅ EXECUTE SEARCH with SPELL CORRECTION
//     // ========================================
//     const searchBody: any = {
//       query: searchQuery,
//       from: (page - 1) * limit,
//       size: limit,
//       sort: sortOrder,
//       highlight: {
//         fields: {
//           name: {},
//           description: {},
//         },
//         pre_tags: ['<mark>'],
//         post_tags: ['</mark>'],
//       },
//       aggs: {
//         categories: {
//           terms: { field: 'category', size: 20 }
//         },
//         brands: {
//           terms: { field: 'brand', size: 20 }
//         },
//         price_ranges: {
//           range: {
//             field: 'price',
//             ranges: [
//               { key: 'Under 500', to: 500 },
//               { key: '500-1000', from: 500, to: 1000 },
//               { key: '1000-2000', from: 1000, to: 2000 },
//               { key: 'Over 2000', from: 2000 },
//             ]
//           }
//         },
//         avg_price: { avg: { field: 'price' } },
//         min_price: { min: { field: 'price' } },
//         max_price: { max: { field: 'price' } },
//       }
//     };

//     // ✅ ADD SPELL CORRECTION (phrase suggester) if query present
//     if (query.trim()) {
//       searchBody.suggest = {
//         spell_correction: {
//           text: query,
//           phrase: {
//             field: 'name',
//             size: 1,
//             gram_size: 2,
//             direct_generator: [
//               {
//                 field: 'name',
//                 suggest_mode: 'always',
//                 min_word_length: 3,
//               }
//             ],
//             highlight: {
//               pre_tag: '<em>',
//               post_tag: '</em>',
//             }
//           }
//         }
//       };
//     }

//     const response = await esClient.search({
//       index: PRODUCT_INDEX,
//       ...searchBody,
//     }) as unknown as ElasticsearchSearchResponse;

//     // ========================================
//     // PROCESS RESULTS
//     // ========================================
//     const totalHits = typeof response.hits.total === 'number'
//       ? response.hits.total
//       : response.hits.total.value;

//     let products: Array<ProductSource & { score: number | null; highlighted?: { name?: string; description?: string } }> = response.hits.hits.map(hit => ({
//       ...hit._source,
//       score: hit._score,
//       highlighted: {
//         name: hit.highlight?.name?.[0],
//         description: hit.highlight?.description?.[0],
//       }
//     }));

//     // ========================================
//     // ✅ SMART ZERO-RESULTS HANDLING
//     // ========================================
//     let zeroResultsFallback: ZeroResultsFallback | null = null;

//     if (totalHits === 0 && query.trim()) {
//       // Strategy 1: Relax filters (keep query, remove category/price/stock filters)
//       if (filter.length > 0) {
//         const relaxedQuery: any = {
//           function_score: {
//             query: {
//               bool: {
//                 must,
//                 should,
//               }
//             },
//             functions: [
//               { filter: { term: { isFeatured: true } }, weight: 2.0 },
//               { filter: { term: { isFlashSale: true } }, weight: 1.8 },
//             ],
//             score_mode: 'sum',
//             boost_mode: 'multiply',
//           }
//         };

//         const relaxedResponse = await esClient.search({
//           index: PRODUCT_INDEX,
//           query: relaxedQuery,
//           size: limit,
//           sort: sortOrder,
//         }) as unknown as ElasticsearchSearchResponse;

//         const relaxedTotal = typeof relaxedResponse.hits.total === 'number'
//           ? relaxedResponse.hits.total
//           : relaxedResponse.hits.total.value;

//         if (relaxedTotal > 0) {
//           products = relaxedResponse.hits.hits.map(hit => ({
//             ...hit._source,
//             score: hit._score,
//           }));
//           zeroResultsFallback = {
//             strategy: 'relaxed_query',
//             message: 'No exact matches found. Showing similar products:',
//           };
//         }
//       }

//       // Strategy 2: Show popular products from user's preferred categories
//       if (products.length === 0 && userCategories.length > 0) {
//         const categoryBrowseResponse = await esClient.search({
//           index: PRODUCT_INDEX,
//           query: {
//             bool: {
//               must: [{ terms: { category: userCategories.slice(0, 3) } }]
//             }
//           } as any,
//           sort: [{ rating: { order: 'desc' as const } }, { reviewCount: { order: 'desc' as const } }],
//           size: limit,
//         }) as unknown as ElasticsearchSearchResponse;

//         const browseTotal = typeof categoryBrowseResponse.hits.total === 'number'
//           ? categoryBrowseResponse.hits.total
//           : categoryBrowseResponse.hits.total.value;

//         if (browseTotal > 0) {
//           products = categoryBrowseResponse.hits.hits.map(hit => ({
//             ...hit._source,
//             score: hit._score,
//           }));
//           zeroResultsFallback = {
//             strategy: 'category_browse',
//             message: `No results for "${query}". You might like these from ${userCategories[0]}:`,
//           };
//         }
//       }

//       // Strategy 3: Fall back to featured/popular products
//       if (products.length === 0) {
//         const popularResponse = await esClient.search({
//           index: PRODUCT_INDEX,
//           query: {
//             bool: {
//               should: [
//                 { term: { isFeatured: { value: true, boost: 2 } } },
//                 { term: { isFlashSale: { value: true, boost: 1.5 } } },
//               ]
//             }
//           } as any,
//           sort: [{ _score: { order: 'desc' as const } }, { rating: { order: 'desc' as const } }],
//           size: limit,
//         }) as unknown as ElasticsearchSearchResponse;

//         products = popularResponse.hits.hits.map(hit => ({
//           ...hit._source,
//           score: hit._score,
//         }));
//         zeroResultsFallback = {
//           strategy: 'popular_products',
//           message: `No results for "${query}". Check out our popular products:`,
//         };
//       }
//     }

//     // ✅ EXTRACT SPELL CORRECTION SUGGESTION
//     let spellSuggestion: string | null = null;
//     if (response.suggest?.spell_correction?.[0]?.options?.length) {
//       const suggestion = response.suggest.spell_correction[0].options[0];
//       if (suggestion.text.toLowerCase() !== query.toLowerCase()) {
//         spellSuggestion = suggestion.text;
//       }
//     }

//     // ========================================
//     // TRACK METRICS
//     // ========================================
//     const duration = Date.now() - startTime;
//     const filtersUsed = [
//       category && 'category',
//       subcategory && 'subcategory',
//       brand && 'brand',
//       (minPrice || maxPrice) && 'price',
//       inStock && 'inStock',
//       rating && 'rating',
//       tags && 'tags',
//     ].filter(Boolean) as string[];

//     searchMetrics.add({
//       query: query || '[empty]',
//       duration,
//       resultCount: totalHits,
//       filters: filtersUsed,
//       timestamp: new Date(),
//       success: true,
//     });

//     // ✅ Track search in behavior system (no-op on server, runs client-side only)
//     if (query.trim()) {
//       BehaviorTracker.trackEvent('Search', {
//         query,
//         resultCount: totalHits,
//         filters: filtersUsed,
//         hadResults: totalHits > 0,
//         usedFallback: !!zeroResultsFallback,
//       });
//     }

//     // ========================================
//     // RETURN RESPONSE
//     // ========================================
//     return NextResponse.json({
//       success: true,
//       query,
//       spellSuggestion,
//       total: totalHits,
//       page,
//       limit,
//       totalPages: Math.ceil((totalHits || products.length) / limit),
//       products,
//       ...(zeroResultsFallback && {
//         fallback: {
//           strategy: zeroResultsFallback.strategy,
//           message: zeroResultsFallback.message,
//           applied: true,
//         }
//       }),
//       facets: {
//         categories: response.aggregations?.categories?.buckets.map(b => ({
//           value: b.key,
//           count: b.doc_count,
//         })) || [],
//         brands: response.aggregations?.brands?.buckets.map(b => ({
//           value: b.key,
//           count: b.doc_count,
//         })) || [],
//         priceRanges: response.aggregations?.price_ranges?.buckets.map(b => ({
//           value: b.key,
//           count: b.doc_count,
//         })) || [],
//       },
//       priceStats: {
//         avg: response.aggregations?.avg_price?.value || 0,
//         min: response.aggregations?.min_price?.value || 0,
//         max: response.aggregations?.max_price?.value || 0,
//       },
//       meta: {
//         duration,
//         sort,
//         filters: filtersUsed,
//         personalized: userCategories.length > 0,
//         preferredCategories: userCategories.slice(0, 3),
//         ctrBoostsApplied: ctrBoostFunctions.length,
//       }
//     }, {
//       headers: {
//         'X-Search-Duration': String(duration),
//         'X-Result-Count': String(totalHits),
//         'Cache-Control': 'public, max-age=60',
//       }
//     });

//   } catch (error: any) {
//     errorMessage = error.message;
//     console.error('❌ Search error:', error);

//     searchMetrics.add({
//       query: sanitizeQuery(request.nextUrl.searchParams.get('q') || ''),
//       duration: Date.now() - startTime,
//       resultCount: 0,
//       filters: [],
//       timestamp: new Date(),
//       success: false,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Search failed',
//         message: errorMessage,
//         details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//       },
//       { status: 500 }
//     );
//   }
// }
