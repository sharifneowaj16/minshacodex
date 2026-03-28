/**
 * lib/queue/steadfastQueue.ts
 *
 * BullMQ queue for Steadfast shipment status sync.
 * Jobs are scheduled by the worker on startup and run:
 *  - Every 15 minutes for orders shipped in the last 7 days
 *  - Every 60 minutes for older active shipments
 */

import { Queue } from 'bullmq';
import { bullRedis } from './productQueue';

export type SteadfastSyncJobData =
  | { type: 'sync_all' }
  | { type: 'sync_order'; orderId: string };

const globalForSteadfastQueue = globalThis as unknown as {
  steadfastQueue?: Queue<SteadfastSyncJobData>;
};

function createSteadfastQueue(): Queue<SteadfastSyncJobData> {
  return new Queue<SteadfastSyncJobData>('steadfast-sync', {
    connection: bullRedis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  });
}

export const steadfastQueue: Queue<SteadfastSyncJobData> =
  globalForSteadfastQueue.steadfastQueue ?? createSteadfastQueue();

if (process.env.NODE_ENV !== 'production') {
  globalForSteadfastQueue.steadfastQueue = steadfastQueue;
}
