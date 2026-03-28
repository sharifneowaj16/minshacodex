/**
 * lib/elasticsearch.ts
 *
 * Elasticsearch v9 Client Configuration
 * @elastic/elasticsearch@^9.2.0
 *
 * ES v9 changes from v8:
 *   - Client constructor accepts `node` (string | string[])
 *   - No more `body` parameter — pass query/aggs directly
 *   - Response types are fully typed (no need for `as any`)
 *   - `hits.total` is always { value: number, relation: string }
 *   - Transport layer rewritten (no more deprecated warnings)
 */

import { Client } from '@elastic/elasticsearch';

// ========================================
// 🔹 ELASTICSEARCH CLIENT (Singleton)
// ========================================

const globalForES = globalThis as unknown as { esClient?: Client };

function createESClient(): Client {
  return new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
    auth: {
      username: 'elastic',
      password: process.env.ELASTIC_PASSWORD || '',
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    maxRetries: 3,
    requestTimeout: 30_000,
    sniffOnStart: false,
  });
}

export const esClient: Client = globalForES.esClient ?? createESClient();

if (process.env.NODE_ENV !== 'production') {
  globalForES.esClient = esClient;
}

// ========================================
// 🔹 CONNECTION TEST
// ========================================

export async function testConnection(): Promise<boolean> {
  try {
    const health = await esClient.cluster.health();
    console.log('✅ Elasticsearch connected. Cluster status:', health.status);
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error);
    return false;
  }
}

// ========================================
// 🔹 INDEX HELPERS
// ========================================

export const PRODUCT_INDEX = 'products';

export async function indexExists(indexName: string): Promise<boolean> {
  try {
    return await esClient.indices.exists({ index: indexName });
  } catch {
    return false;
  }
}

// ========================================
// 🔹 INDEX MAPPING & SETTINGS
//    – beauty_search analyzer with 70+ synonyms
//    – autocomplete analyzer with edge_ngram
//    – spell correction via suggest field
// ========================================

export const productIndexMapping = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        autocomplete: {
          type: 'custom' as const,
          tokenizer: 'standard',
          filter: ['lowercase', 'autocomplete_filter'],
        },
        autocomplete_search: {
          type: 'custom' as const,
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
        beauty_search: {
          type: 'custom' as const,
          tokenizer: 'standard',
          filter: ['lowercase', 'beauty_synonym_filter'],
        },
      },
      filter: {
        autocomplete_filter: {
          type: 'edge_ngram' as const,
          min_gram: 2,
          max_gram: 20,
        },
        beauty_synonym_filter: {
          type: 'synonym' as const,
          synonyms: [
            // Skincare
            'moisturizer, lotion, face cream, skin cream, hydrating cream, day cream, night cream',
            'serum, essence, ampoule, booster',
            'cleanser, face wash, facial wash, cleansing foam, cleansing gel, makeup remover',
            'toner, astringent, skin toner, face toner, balancing toner',
            'sunscreen, sunblock, spf, sun protection, uv protection, sun cream',
            'exfoliator, scrub, face scrub, body scrub, peeling gel, exfoliant',
            'face mask, sheet mask, clay mask, peel off mask, sleeping mask, overnight mask',
            'eye cream, under eye cream, eye gel, anti-aging eye',
            'lip balm, lip care, lip treatment, lip butter, lip mask',
            'tinted moisturizer, bb cream, blemish balm, beauty balm, cc cream, color correcting cream',

            // Makeup
            'foundation, base makeup, liquid foundation, powder foundation, cushion foundation',
            'concealer, color corrector, under eye concealer, blemish concealer',
            'blush, cheek color, rouge, cheek tint',
            'highlighter, illuminator, glow, shimmer, luminizer',
            'bronzer, contour, sculpting powder',
            'eyeshadow, eye color, eye palette, eye pigment',
            'eyeliner, eye pencil, kajal, kohl',
            'mascara, lash mascara, lash',
            'lipstick, lip color, lip gloss, lip tint, lip stain, lip crayon',
            'setting powder, finishing powder, loose powder, pressed powder, compact powder',
            'setting spray, finishing spray, makeup fixer, fix spray',
            'primer, face primer, pore minimizer, makeup base',
            'brow pencil, eyebrow, brow gel, brow pomade, brow powder',

            // Haircare
            'shampoo, hair wash, hair cleanser',
            'conditioner, hair conditioner, deep conditioner, leave-in conditioner',
            'hair oil, hair serum, hair treatment, hair elixir',
            'hair mask, hair pack, deep treatment, hair spa',
            'hair spray, hair styling, hair gel, hair mousse, hair wax',
            'hair color, hair dye, hair tint',

            // Fragrance
            'perfume, fragrance, eau de parfum, edp, eau de toilette, edt, cologne, body mist, attar',

            // Body care
            'body lotion, body cream, body butter, body milk',
            'body wash, shower gel, bath gel',
            'hand cream, hand lotion',
            'foot cream, foot care',
            'deodorant, antiperspirant, body spray',

            // Nails
            'nail polish, nail lacquer, nail color, nail paint, nail enamel',
            'nail art, nail sticker, nail decoration',
            'nail remover, nail polish remover, acetone',

            // Tools
            'makeup brush, brush set, cosmetic brush',
            'beauty blender, makeup sponge, puff',
            'eyelash curler, lash curler',
            'tweezers, eyebrow tweezers',

            // Skin concerns (Bangla-aware)
            'acne, pimple, breakout, blemish, spot',
            'dark spot, hyperpigmentation, melasma, pigmentation, dark circle',
            'wrinkle, anti-aging, anti-wrinkle, fine line, aging',
            'dry skin, dehydrated skin, flaky skin',
            'oily skin, greasy skin, excess oil, sebum',
            'sensitive skin, irritated skin, redness',

            // Bangla product terms
            'mekhap, makeup',
            'sada, white, whitening, fairness, brightening',
            'tel, oil',
            'sabaan, soap',
            'kajol, kajal, kohl',
          ],
        },
      },
    },
  },
  mappings: {
    properties: {
      id:              { type: 'keyword' as const },
      name:            { type: 'text' as const, analyzer: 'beauty_search', fields: { keyword: { type: 'keyword' as const }, autocomplete: { type: 'text' as const, analyzer: 'autocomplete', search_analyzer: 'autocomplete_search' } } },
      slug:            { type: 'keyword' as const },
      description:     { type: 'text' as const, analyzer: 'beauty_search' },
      brand:           { type: 'text' as const, analyzer: 'standard', fields: { keyword: { type: 'keyword' as const } } },
      category:        { type: 'keyword' as const },
      subcategory:     { type: 'keyword' as const },
      categoryHierarchy: { type: 'keyword' as const },
      price:           { type: 'float' as const },
      compareAtPrice:  { type: 'float' as const },
      discount:        { type: 'integer' as const },
      stock:           { type: 'integer' as const },
      inStock:         { type: 'boolean' as const },
      rating:          { type: 'float' as const },
      reviewCount:     { type: 'integer' as const },
      image:           { type: 'keyword' as const, index: false },
      images:          { type: 'keyword' as const, index: false },
      sku:             { type: 'keyword' as const },
      tags:            { type: 'keyword' as const },
      ingredients:     { type: 'text' as const },
      isFeatured:      { type: 'boolean' as const },
      isNewArrival:    { type: 'boolean' as const },
      isFlashSale:     { type: 'boolean' as const },
      isFavourite:     { type: 'boolean' as const },
      isRecommended:   { type: 'boolean' as const },
      isForYou:        { type: 'boolean' as const },
      createdAt:       { type: 'date' as const },
      updatedAt:       { type: 'date' as const },
      // Spell suggestion field
      suggest:         { type: 'completion' as const, analyzer: 'simple', preserve_separators: true, preserve_position_increments: true, max_input_length: 50 },
      // Trending / popularity score (for Daraz-level trending)
      popularityScore: { type: 'float' as const },
      searchClickCount: { type: 'integer' as const },
      viewCount:       { type: 'integer' as const },
      salesCount:      { type: 'integer' as const },
    },
  },
};
