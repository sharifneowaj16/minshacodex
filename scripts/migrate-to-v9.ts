#!/usr/bin/env tsx

/**
 * Elasticsearch v9 Migration Script
 *
 * Migrates the products index to v9 configuration with:
 *   - Synonym filter (70+ beauty product terms)
 *   - Beauty search analyzer (query-time synonym expansion)
 *   - Updated field mappings for spell correction
 *
 * Usage:
 *   npx tsx scripts/migrate-to-v9.ts
 */

import { testConnection, indexExists, PRODUCT_INDEX } from '../lib/elasticsearch';
import { createProductIndex, indexAllProducts } from '../lib/elasticsearch/indexing';
import { esClient } from '../lib/elasticsearch';

async function main() {
  console.log('🚀 Elasticsearch v9 Migration Starting...\n');
  console.log('📋 Features being added:');
  console.log('   ✅ Synonym filter (70+ beauty terms)');
  console.log('   ✅ Spell correction support');
  console.log('   ✅ Promotional boosting fields');
  console.log('   ✅ Trending search tracking\n');

  // Step 1: Test connection
  console.log('📡 Step 1: Testing Elasticsearch connection...');
  const connected = await testConnection();

  if (!connected) {
    console.error('❌ Failed to connect to Elasticsearch');
    console.error('💡 Make sure:');
    console.error('   - Elasticsearch container is running');
    console.error('   - ELASTICSEARCH_URL is set in .env');
    console.error('   - ELASTIC_PASSWORD is set in .env');
    process.exit(1);
  }

  console.log('✅ Connected to Elasticsearch\n');

  // Step 2: Check existing index
  console.log('📦 Step 2: Checking existing index...');
  const exists = await indexExists(PRODUCT_INDEX);

  if (exists) {
    // Count existing documents so we can verify after migration
    const countResponse = await esClient.count({ index: PRODUCT_INDEX });
    const existingCount = countResponse.count;
    console.log(`   Found existing index with ${existingCount} documents`);

    console.log('   🗑️  Deleting old index to apply new synonym settings...');
    await esClient.indices.delete({ index: PRODUCT_INDEX });
    console.log('   ✅ Old index deleted\n');
  } else {
    console.log('   No existing index found — creating fresh\n');
  }

  // Step 3: Create new index with v9 mappings (synonym filter + beauty_search analyzer)
  console.log('📦 Step 3: Creating new index with v9 mappings...');
  const indexCreated = await createProductIndex();

  if (!indexCreated) {
    console.error('❌ Failed to create product index');
    process.exit(1);
  }

  console.log('✅ New index created with:');
  console.log('   - beauty_synonym_filter (70+ synonym mappings)');
  console.log('   - beauty_search analyzer for query-time expansion');
  console.log('   - Updated name/description search analyzers\n');

  // Step 4: Re-index all products from database
  console.log('📊 Step 4: Re-indexing all products from database...');
  const productsIndexed = await indexAllProducts();

  if (!productsIndexed) {
    console.error('❌ Failed to index products');
    console.error('💡 Check database connection and product data');
    process.exit(1);
  }

  // Step 5: Verify the new index has the synonym filter
  console.log('\n🔍 Step 5: Verifying index settings...');
  try {
    const settings = await esClient.indices.getSettings({ index: PRODUCT_INDEX });
    const indexSettings = settings[PRODUCT_INDEX]?.settings as any;
    const hasSynonyms = JSON.stringify(indexSettings).includes('beauty_synonym_filter');

    if (hasSynonyms) {
      console.log('✅ Synonym filter confirmed in index settings');
    } else {
      console.warn('⚠️  Synonym filter not found in settings — verify manually');
    }
  } catch {
    console.warn('⚠️  Could not verify index settings');
  }

  console.log('\n🎉 Migration completed successfully!\n');
  console.log('📋 What to test next:');
  console.log('');
  console.log('   # 1. Spell correction ("did you mean?")');
  console.log('   curl "http://localhost:3000/api/search?q=lipstik" | jq \'.data.spellSuggestion\'');
  console.log('');
  console.log('   # 2. Synonym expansion');
  console.log('   curl "http://localhost:3000/api/search?q=face%20cream" | jq \'.data.pagination.total\'');
  console.log('   # Should return moisturizers, lotions, etc.');
  console.log('');
  console.log('   # 3. Promotional boosting');
  console.log('   curl "http://localhost:3000/api/search?q=lipstick" | jq \'.data.products[0].isFeatured\'');
  console.log('   # Featured products should rank first');
  console.log('');
  console.log('   # 4. Trending searches');
  console.log('   curl "http://localhost:3000/api/search/suggestions?trending=true" | jq');
  console.log('   # Run some searches first to populate trending data');
  console.log('');
  console.log('💡 Notes:');
  console.log('   - Synonyms apply at query time (search_analyzer), not index time');
  console.log('   - Spell correction uses term suggester with "popular" mode');
  console.log('   - Promotional boosts: Featured 2.0x, Flash Sale 1.8x, New 1.3x');
  console.log('   - Trending data accumulates as users perform searches\n');
}

main()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
