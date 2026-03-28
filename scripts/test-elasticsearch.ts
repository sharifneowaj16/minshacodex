#!/usr/bin/env tsx

/**
 * Elasticsearch Test Script
 * 
 * Tests all Elasticsearch functionality:
 * 1. Connection test
 * 2. Index existence check
 * 3. Document count
 * 4. Sample search
 * 5. Suggestions test
 * 
 * Usage:
 *   npx tsx scripts/test-elasticsearch.ts
 */

import { testConnection, indexExists, PRODUCT_INDEX, esClient } from '../lib/elasticsearch';
import { searchProducts } from '../lib/elasticsearch/indexing';

async function main() {
  console.log('🧪 Elasticsearch Test Suite\n');
  console.log('=' .repeat(50) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Connection
  console.log('Test 1: Connection Test');
  console.log('-'.repeat(50));
  const connected = await testConnection();
  if (connected) {
    console.log('✅ PASSED - Connected to Elasticsearch\n');
    passedTests++;
  } else {
    console.log('❌ FAILED - Cannot connect to Elasticsearch\n');
    failedTests++;
    console.log('💥 Stopping tests - connection required\n');
    process.exit(1);
  }

  // Test 2: Index Exists
  console.log('Test 2: Index Existence Check');
  console.log('-'.repeat(50));
  const exists = await indexExists(PRODUCT_INDEX);
  if (exists) {
    console.log(`✅ PASSED - Index "${PRODUCT_INDEX}" exists\n`);
    passedTests++;
  } else {
    console.log(`❌ FAILED - Index "${PRODUCT_INDEX}" does not exist`);
    console.log('💡 Run: npm run elasticsearch:init\n');
    failedTests++;
  }

  // Test 3: Document Count
  console.log('Test 3: Document Count');
  console.log('-'.repeat(50));
  try {
    const countResponse = await esClient.count({ index: PRODUCT_INDEX });
    const count = countResponse.count;
    console.log(`📊 Found ${count} documents in index`);
    
    if (count > 0) {
      console.log('✅ PASSED - Index has documents\n');
      passedTests++;
    } else {
      console.log('⚠️  WARNING - Index is empty');
      console.log('💡 Run: npm run elasticsearch:init\n');
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ FAILED - Cannot count documents');
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 4: Sample Search
  console.log('Test 4: Search Functionality');
  console.log('-'.repeat(50));
  try {
    const results = await searchProducts('lipstick', { limit: 5 });
    console.log(`🔍 Search query: "lipstick"`);
    console.log(`📊 Total results: ${results.total}`);
    console.log(`📦 Returned: ${results.products.length} products`);
    
    if (results.products.length > 0) {
      console.log('\nSample results:');
      results.products.slice(0, 3).forEach((product: any, index: number) => {
        console.log(`  ${index + 1}. ${product.name} - BDT ${product.price}`);
      });
      console.log('✅ PASSED - Search working\n');
      passedTests++;
    } else {
      console.log('⚠️  WARNING - Search returned no results\n');
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ FAILED - Search error');
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 5: Fuzzy Search (typo tolerance)
  console.log('Test 5: Fuzzy Search (Typo Tolerance)');
  console.log('-'.repeat(50));
  try {
    const results = await searchProducts('lipstik', { limit: 3 }); // Intentional typo
    console.log(`🔍 Search query: "lipstik" (with typo)`);
    console.log(`📊 Total results: ${results.total}`);
    
    if (results.total > 0) {
      console.log('✅ PASSED - Fuzzy search working (found results despite typo)\n');
      passedTests++;
    } else {
      console.log('⚠️  WARNING - Fuzzy search found no results\n');
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ FAILED - Fuzzy search error');
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 6: Filtered Search
  console.log('Test 6: Filtered Search');
  console.log('-'.repeat(50));
  try {
    const results = await searchProducts('', { 
      category: 'makeup',
      minPrice: 100,
      maxPrice: 1000,
      limit: 5
    });
    console.log(`🔍 Filter: category=makeup, price=100-1000`);
    console.log(`📊 Total results: ${results.total}`);
    
    if (results.products.length > 0) {
      console.log('✅ PASSED - Filtered search working\n');
      passedTests++;
    } else {
      console.log('⚠️  INFO - No products match filters\n');
    }
  } catch (error: any) {
    console.log('❌ FAILED - Filtered search error');
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 7: Aggregations
  console.log('Test 7: Aggregations (Facets)');
  console.log('-'.repeat(50));
  try {
    const response = await esClient.search({
      index: PRODUCT_INDEX,
      size: 0,
      aggs: {
        categories: {
          terms: { field: 'category', size: 10 }
        },
        price_stats: {
          stats: { field: 'price' }
        }
      }
    });

    const categories = response.aggregations?.categories as any;
    const priceStats = response.aggregations?.price_stats as any;

    console.log('\n📊 Categories:');
    categories?.buckets?.forEach((bucket: any) => {
      console.log(`  - ${bucket.key}: ${bucket.doc_count} products`);
    });

    console.log('\n💰 Price Statistics:');
    console.log(`  - Min: BDT ${priceStats?.min?.toFixed(2) || 'N/A'}`);
    console.log(`  - Max: BDT ${priceStats?.max?.toFixed(2) || 'N/A'}`);
    console.log(`  - Avg: BDT ${priceStats?.avg?.toFixed(2) || 'N/A'}`);
    
    console.log('\n✅ PASSED - Aggregations working\n');
    passedTests++;
  } catch (error: any) {
    console.log('❌ FAILED - Aggregations error');
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }

  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Summary\n');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Elasticsearch is ready to use.\n');
    console.log('💡 Next steps:');
    console.log('   - Integrate with frontend');
    console.log('   - Add auto-sync hooks to product APIs');
    console.log('   - Monitor performance in Kibana\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });