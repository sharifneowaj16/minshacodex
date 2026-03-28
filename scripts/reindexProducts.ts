#!/usr/bin/env tsx
/**
 * Full Product Reindex Script
 *
 * Fetches ALL products from PostgreSQL in batches of 500 and bulk-indexes
 * them directly into Elasticsearch (bypassing the queue for speed).
 *
 * Use this script for:
 *   - First-time index population
 *   - Recovery after index corruption
 *   - Mapping changes (run after deleting the old index)
 *
 * Usage:
 *   npm run reindex
 *   — or —
 *   npx tsx scripts/reindexProducts.ts
 */

import 'dotenv/config';

import prisma from '../lib/prisma';
import { esClient, PRODUCT_INDEX, testConnection, productIndexMapping } from '../lib/elasticsearch';
import { transformProductToES } from '../lib/search/productTransformer';

const BATCH_SIZE = 500;

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: { include: { parent: { include: { parent: true } } } },
  brand: true,
  reviews: { select: { rating: true } },
} as const;

async function ensureIndex(): Promise<void> {
  // Always delete and recreate to ensure clean mapping
  const exists = await esClient.indices.exists({ index: PRODUCT_INDEX });
  if (exists) {
    console.log(`Deleting existing index "${PRODUCT_INDEX}"…`);
    await esClient.indices.delete({ index: PRODUCT_INDEX });
  }

  console.log(`Creating index "${PRODUCT_INDEX}" with full mapping…`);
  await esClient.indices.create({
    index: PRODUCT_INDEX,
    settings: productIndexMapping.settings,
    mappings: productIndexMapping.mappings,
  });
  console.log(`✅ Index "${PRODUCT_INDEX}" created with beauty_search analyzer + full mapping`);
}

async function reindex(): Promise<void> {
  console.log('=== Product Reindex ===\n');

  // 1. Verify connectivity
  console.log('Testing Elasticsearch connection…');
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot connect to Elasticsearch. Check ELASTICSEARCH_URL and container status.');
    process.exit(1);
  }

  // 2. Recreate index with correct mapping
  await ensureIndex();

  // 3. Count products
  const total = await prisma.product.count();
  console.log(`Total products in database: ${total}\n`);

  if (total === 0) {
    console.log('No products found – nothing to index.');
    process.exit(0);
  }

  let skip = 0;
  let indexed = 0;
  let errors = 0;

  // 4. Batch loop
  while (skip < total) {
    const products = await prisma.product.findMany({
      skip,
      take: BATCH_SIZE,
      include: productInclude,
    });

    if (products.length === 0) break;

    const operations = products.flatMap((p) => [
      { index: { _index: PRODUCT_INDEX, _id: p.id } },
      transformProductToES(p),
    ]);

    const { errors: bulkErrors, items } = await esClient.bulk({
      operations,
      refresh: false,
    });

    if (bulkErrors) {
      const failed = items.filter((i) => i.index?.error);
      errors += failed.length;
      console.error(`  Batch ${skip / BATCH_SIZE + 1}: ${failed.length} document(s) failed`);
      failed.slice(0, 3).forEach((f) =>
        console.error('   →', f.index?.error?.reason)
      );
    }

    indexed += products.length - (bulkErrors ? items.filter((i) => i.index?.error).length : 0);
    const pct = Math.round(((skip + products.length) / total) * 100);
    console.log(`  Progress: ${skip + products.length}/${total} (${pct}%)`);

    skip += BATCH_SIZE;
  }

  // 5. Refresh once so all docs become searchable
  await esClient.indices.refresh({ index: PRODUCT_INDEX });

  console.log('\n=== Reindex complete ===');
  console.log(`  Indexed : ${indexed}`);
  if (errors > 0) console.warn(`  Errors  : ${errors} (check output above)`);

  const count = await esClient.count({ index: PRODUCT_INDEX });
  console.log(`  ES docs : ${count.count}\n`);
}

reindex()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
