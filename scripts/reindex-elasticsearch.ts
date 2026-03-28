#!/usr/bin/env tsx

/**
 * Elasticsearch Reindex Script
 * 
 * This script completely rebuilds the Elasticsearch index:
 * 1. Deletes existing index
 * 2. Creates fresh index with mappings
 * 3. Bulk indexes all products
 * 
 * Usage:
 *   npx tsx scripts/reindex-elasticsearch.ts
 */

import { reindexAllProducts } from '../lib/elasticsearch/indexing';
import { testConnection } from '../lib/elasticsearch';

async function main() {
  console.log('🔄 Starting Elasticsearch Reindex...\n');

  // Test connection first
  console.log('📡 Testing Elasticsearch connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('❌ Failed to connect to Elasticsearch');
    console.error('💡 Make sure Elasticsearch container is running');
    process.exit(1);
  }

  console.log('✅ Connected to Elasticsearch\n');

  // Reindex everything
  console.log('🔄 Starting reindex process...');
  console.log('⚠️  This will:');
  console.log('   1. Delete existing index');
  console.log('   2. Create new index with fresh mappings');
  console.log('   3. Index all products from database\n');

  const success = await reindexAllProducts();
  
  if (!success) {
    console.error('❌ Reindex failed');
    process.exit(1);
  }

  console.log('✅ Reindex completed successfully!\n');
  console.log('💡 You can now search products via:');
  console.log('   curl http://localhost:3000/api/search?q=lipstick\n');
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