/**
 * lib/workers/steadfastWorker.ts
 *
 * Steadfast Sync Worker — BullMQ
 *
 * Automatically polls Steadfast for shipment status updates.
 * Schedule:
 *  - Recent (< 7 days): every 15 minutes
 *  - Older (7–30 days): every 60 minutes
 *
 * Run alongside the existing product worker:
 *   npx tsx lib/workers/steadfastWorker.ts
 *
 * Or add to package.json scripts:
 *   "worker:steadfast": "tsx lib/workers/steadfastWorker.ts"
 */

import { Worker, Job, Queue } from 'bullmq';
import { bullRedis } from '@/lib/queue/productQueue';
import {
  type SteadfastSyncJobData,
  steadfastQueue,
} from '@/lib/queue/steadfastQueue';
import {
  trackByCID,
  mapSteadfastStatusToOrderStatus,
} from '@/lib/steadfast/client';
import prisma from '@/lib/prisma';

// ─── Helpers ───────────────────────────────────────────────────────────────

async function syncAllActiveShipments() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all active shipments (not yet delivered or cancelled)
  const activeOrders = await prisma.order.findMany({
    where: {
      steadfastConsignmentId: { not: null },
      status: { in: ['SHIPPED', 'PROCESSING'] },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      steadfastConsignmentId: true,
      steadfastSentAt: true,
    },
  });

  if (activeOrders.length === 0) {
    console.log('[SteadfastWorker] No active shipments to sync');
    return { synced: 0, updated: 0, errors: 0 };
  }

  console.log(`[SteadfastWorker] Syncing ${activeOrders.length} active shipments...`);

  let updated = 0;
  let errors = 0;

  // Process in batches of 10 to be gentle on the API
  const BATCH_SIZE = 10;
  for (let i = 0; i < activeOrders.length; i += BATCH_SIZE) {
    const batch = activeOrders.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (order) => {
        try {
          const result = await trackByCID(order.steadfastConsignmentId!);
          const newSteadfastStatus = result.delivery_status;
          const mappedStatus = mapSteadfastStatusToOrderStatus(newSteadfastStatus);

          const updateData: Record<string, unknown> = {
            steadfastStatus: newSteadfastStatus,
          };

          if (mappedStatus && mappedStatus !== order.status) {
            updateData.status = mappedStatus;
            if (mappedStatus === 'DELIVERED') {
              updateData.deliveredAt = new Date();
            } else if (mappedStatus === 'CANCELLED') {
              updateData.cancelledAt = new Date();
            }
            console.log(
              `[SteadfastWorker] ✅ ${order.orderNumber}: ${order.status} → ${mappedStatus} (${newSteadfastStatus})`
            );
          }

          await prisma.order.update({
            where: { id: order.id },
            data: updateData,
          });

          updated++;
        } catch (err) {
          errors++;
          console.error(
            `[SteadfastWorker] ❌ Failed to sync ${order.orderNumber}:`,
            err instanceof Error ? err.message : err
          );
        }
      })
    );

    // Brief pause between batches to avoid rate limiting
    if (i + BATCH_SIZE < activeOrders.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(
    `[SteadfastWorker] Sync complete: ${updated} updated, ${errors} errors out of ${activeOrders.length}`
  );
  return { synced: activeOrders.length, updated, errors };
}

async function syncSingleOrder(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      steadfastConsignmentId: true,
    },
  });

  if (!order?.steadfastConsignmentId) {
    console.warn(`[SteadfastWorker] Order ${orderId} has no Steadfast consignment`);
    return;
  }

  const result = await trackByCID(order.steadfastConsignmentId);
  const newSteadfastStatus = result.delivery_status;
  const mappedStatus = mapSteadfastStatusToOrderStatus(newSteadfastStatus);

  const updateData: Record<string, unknown> = {
    steadfastStatus: newSteadfastStatus,
  };

  if (mappedStatus && mappedStatus !== order.status) {
    updateData.status = mappedStatus;
    if (mappedStatus === 'DELIVERED') updateData.deliveredAt = new Date();
    if (mappedStatus === 'CANCELLED') updateData.cancelledAt = new Date();
  }

  await prisma.order.update({ where: { id: order.id }, data: updateData });
  console.log(
    `[SteadfastWorker] Synced ${order.orderNumber}: ${newSteadfastStatus}`
  );
}

// ─── Worker ────────────────────────────────────────────────────────────────

export function startSteadfastWorker() {
  const worker = new Worker<SteadfastSyncJobData>(
    'steadfast-sync',
    async (job: Job<SteadfastSyncJobData>) => {
      const { data } = job;

      if (data.type === 'sync_all') {
        return syncAllActiveShipments();
      }

      if (data.type === 'sync_order') {
        return syncSingleOrder(data.orderId);
      }

      console.warn(`[SteadfastWorker] Unknown job type: ${(data as { type: string }).type}`);
    },
    {
      connection: bullRedis,
      concurrency: 1, // Only one sync at a time
    }
  );

  worker.on('completed', (job) => {
    console.log(`[SteadfastWorker] ✅ Job ${job.id} (${job.data.type}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[SteadfastWorker] ❌ Job ${job?.id} failed:`,
      err.message
    );
  });

  worker.on('error', (err) => {
    console.error('[SteadfastWorker] Worker error:', err);
  });

  console.log('[SteadfastWorker] 🚀 Steadfast sync worker started');
  return worker;
}

// ─── Scheduler ─────────────────────────────────────────────────────────────

async function scheduleRepeatableJobs(queue: Queue<SteadfastSyncJobData>) {
  // Remove old repeatable jobs first
  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    await queue.removeRepeatableByKey(job.key);
  }

  // Sync all active shipments every 15 minutes
  await queue.add(
    'sync_all',
    { type: 'sync_all' },
    {
      repeat: { every: 15 * 60 * 1000 }, // 15 minutes
      jobId: 'steadfast-sync-all-15m',
    }
  );

  console.log('[SteadfastWorker] 📅 Scheduled: sync_all every 15 minutes');
}

// ─── Entry point ────────────────────────────────────────────────────────────

async function main() {
  await scheduleRepeatableJobs(steadfastQueue);
  startSteadfastWorker();
}

const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].includes('steadfastWorker');

if (isDirectRun) {
  main().catch((err) => {
    console.error('[SteadfastWorker] Fatal error:', err);
    process.exit(1);
  });
}
