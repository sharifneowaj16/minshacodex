import { Suspense } from 'react';
import { OrderConfirmedClient } from './order-confirmed-client';

function OrderConfirmedFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-minsah-light via-white to-minsah-accent flex flex-col items-center justify-center px-4 py-12">
      <div className="h-32 w-32 rounded-full bg-minsah-primary/10 animate-pulse" aria-hidden />
      <p className="mt-8 text-minsah-secondary">Loading confirmation…</p>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<OrderConfirmedFallback />}>
      <OrderConfirmedClient />
    </Suspense>
  );
}
