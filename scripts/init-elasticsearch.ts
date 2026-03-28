#!/usr/bin/env tsx

/**
 * Elasticsearch Initialization Script
 * 
 * This script:
 * 1. Tests connection to Elasticsearch
 * 2. Creates product index with proper mappings
 * 3. Bulk indexes all products from database
 * 
 * Usage:
 *   npx tsx scripts/init-elasticsearch.ts
 */

import { testConnection } from '../lib/elasticsearch';
import { createProductIndex, indexAllProducts } from '../lib/elasticsearch/indexing';

async function main() {
  console.log('🚀 Starting Elasticsearch Initialization...\n');

  // Step 1: Test connection
  console.log('📡 Step 1: Testing Elasticsearch connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('❌ Failed to connect to Elasticsearch');
    console.error('💡 Make sure:');
    console.error('   - Elasticsearch container is running');
    console.error('   - ELASTICSEARCH_URL is correct in .env');
    console.error('   - ELASTIC_PASSWORD is set correctly');
    process.exit(1);
  }

  console.log('✅ Connected to Elasticsearch\n');

  // Step 2: Create index
  console.log('📦 Step 2: Creating product index...');
  const indexCreated = await createProductIndex();
  
  if (!indexCreated) {
    console.error('❌ Failed to create product index');
    process.exit(1);
  }

  console.log('✅ Product index created successfully\n');

  // Step 3: Index all products
  console.log('📊 Step 3: Indexing all products from database...');
  const productsIndexed = await indexAllProducts();
  
  if (!productsIndexed) {
    console.error('❌ Failed to index products');
    process.exit(1);
  }

  console.log('✅ All products indexed successfully\n');

  console.log('🎉 Elasticsearch initialization completed!\n');
  console.log('💡 Next steps:');
  console.log('   - Test search: curl http://localhost:3000/api/search?q=lipstick');
  console.log('   - Test suggestions: curl http://localhost:3000/api/search/suggestions?q=lip');
  console.log('   - View in Kibana: https://kibana.minsahbeauty.cloud\n');
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