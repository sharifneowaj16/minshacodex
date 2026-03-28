/**
 * instrumentation.ts  (project root — next to next.config.ts)
 *
 * Next.js instrumentation hook — runs ONCE when the server starts.
 * Used here to auto-start the BullMQ product-sync worker so it
 * runs inside the same container as the Next.js app.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to avoid bundling issues
    const { startProductWorker } = await import('./lib/workers/productWorker');
    startProductWorker();
    console.log('[instrumentation] ✅ Product sync worker started');
  }
}
