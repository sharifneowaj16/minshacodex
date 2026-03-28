/**
 * lib/workers/productWorker.ts
 *
 * Product Sync Worker — BullMQ 5.69.3
 *
 * Consumes jobs from the "product-sync" queue and syncs
 * Elasticsearch index with the PostgreSQL database.
 *
 * Run separately from Next.js:
 *   npx tsx lib/workers/productWorker.ts
 */

import { Worker, Job } from 'bullmq';
import {
  bullRedis,
  type ProductJobData,
  type IndexJobData,
  type DeleteJobData,
} from '@/lib/queue/productQueue';
import { transformProductToES } from '@/lib/search/productTransformer';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';
import prisma from '@/lib/prisma';

const BATCH_SIZE = 500;

// ─── Prisma include ────────────────────────────────────────────────────

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: { include: { parent: { include: { parent: true } } } },
  brand: true,
  reviews: { select: { rating: true } },
} as const;

// ─── Job handlers ──────────────────────────────────────────────────────

async function handleIndex(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });

  if (!product) {
    console.warn(`[worker] Product ${productId} not found in DB — skipping`);
    return;
  }

  const doc = transformProductToES(product);

  await esClient.index({
    index: PRODUCT_INDEX,
    id: productId,
    document: doc,
  });

  console.log(`[worker] Indexed product ${productId} (${product.name})`);
}

async function handleDelete(productId: string): Promise<void> {
  try {
    await esClient.delete({ index: PRODUCT_INDEX, id: productId });
    console.log(`[worker] Deleted product ${productId} from ES`);
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'meta' in err &&
      (err as { meta: { statusCode: number } }).meta?.statusCode === 404
    ) {
      console.warn(`[worker] Product ${productId} not in ES — nothing to delete`);
      return;
    }
    throw err;
  }
}

async function handleReindex(): Promise<void> {
  console.log('[worker] Starting full reindex…');

  let skip = 0;
  let totalIndexed = 0;

  for (;;) {
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

    const { errors, items } = await esClient.bulk({
      operations,
      refresh: false,
    });

    if (errors) {
      const failed = items.filter((i) => i.index?.error);
      console.error(`[worker] Bulk errors: ${failed.length}`);
    }

    totalIndexed += products.length;
    console.log(`[worker] Reindex progress: ${totalIndexed}`);

    skip += BATCH_SIZE;
    if (products.length < BATCH_SIZE) break;
  }

  await esClient.indices.refresh({ index: PRODUCT_INDEX });
  console.log(`[worker] Full reindex complete — ${totalIndexed} products`);
}

// ─── Worker ────────────────────────────────────────────────────────────

export function startProductWorker(): Worker<ProductJobData> {
  const worker = new Worker<ProductJobData>(
    'product-sync',
    async (job: Job<ProductJobData>) => {
      const { name, data } = job;

      try {
        switch (name) {
          case 'index': {
            const { productId } = data as IndexJobData;
            await handleIndex(productId);
            break;
          }
          case 'delete': {
            const { productId } = data as DeleteJobData;
            await handleDelete(productId);
            break;
          }
          case 'reindex': {
            await handleReindex();
            break;
          }
          default:
            console.warn(`[worker] Unknown job "${name}" — skipping`);
        }
      } catch (err) {
        console.error(`[worker] Job "${name}" (id=${job.id}) failed:`, err);
        throw err;
      }
    },
    {
      connection: bullRedis,
      concurrency: 3,
      limiter: {
        max: 50,
        duration: 1_000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[worker] ✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[worker] ❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[worker] Worker error:', err);
  });

  console.log('[worker] 🚀 Product sync worker started (concurrency: 3)');
  return worker;
}

// ─── Auto-start when run directly ──────────────────────────────────────

const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].includes('productWorker') ||
    process.argv[1].includes('worker'));

if (isDirectRun) {
  startProductWorker();
}
