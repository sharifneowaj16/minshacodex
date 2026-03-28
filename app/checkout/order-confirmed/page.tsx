'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

export default function OrderConfirmedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderNumber] = useState(
    () => searchParams.get('orderNumber') || `MB${Date.now().toString().slice(-8)}`
  );

  useEffect(() => {
    // Clear cart after successful order
    const timer = setTimeout(() => {
      clearCart();
    }, 1000);

    return () => clearTimeout(timer);
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-minsah-light via-white to-minsah-accent flex flex-col items-center justify-center px-4 py-12">
      {/* Success Animation */}
      <div className="relative mb-8">
        {/* Animated Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-minsah-primary/10 animate-ping"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-minsah-primary/20 animate-pulse"></div>
        </div>

        {/* Checkmark */}
        <div className="relative w-32 h-32 bg-minsah-primary rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-minsah-primary rounded-full flex items-center justify-center">
              <Check size={64} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Decorative Dots */}
        <div className="absolute -top-4 -right-4 w-3 h-3 bg-minsah-secondary rounded-full animate-bounce"></div>
        <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-minsah-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-1/2 -left-8 w-2 h-2 bg-minsah-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute top-1/2 -right-8 w-2 h-2 bg-minsah-primary rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-minsah-dark mb-3">
          Order Confirmed!
        </h1>
        <p className="text-minsah-secondary text-lg mb-4">
          Your order has been placed successfully
        </p>
        <div className="inline-block bg-minsah-accent px-6 py-3 rounded-xl">
          <p className="text-sm text-minsah-secondary mb-1">Order Number</p>
          <p className="text-xl font-bold text-minsah-primary">{orderNumber}</p>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-minsah-accent">
            <div className="w-12 h-12 bg-minsah-accent rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-minsah-secondary">Estimated Delivery</p>
              <p className="font-bold text-minsah-dark">3-5 Business Days</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-minsah-accent">
            <div className="w-12 h-12 bg-minsah-accent rounded-full flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <div>
              <p className="text-sm text-minsah-secondary">Confirmation Email</p>
              <p className="font-bold text-minsah-dark">Sent to your email</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-minsah-accent rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <p className="text-sm text-minsah-secondary">Order Tracking</p>
              <p className="font-bold text-minsah-dark">Updates via SMS & Email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => router.push('/')}
          className="w-full bg-minsah-primary text-minsah-light py-4 rounded-xl font-bold text-lg hover:bg-minsah-dark transition shadow-lg"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => router.push('/account/orders')}
          className="w-full bg-white text-minsah-primary py-4 rounded-xl font-bold text-lg border-2 border-minsah-accent hover:border-minsah-primary transition"
        >
          Track Order
        </button>
      </div>

      {/* Thank You Message */}
      <div className="mt-8 text-center">
        <p className="text-minsah-secondary">
          Thank you for shopping with <span className="font-bold text-minsah-primary">Minsah Beauty</span>
        </p>
        <p className="text-sm text-minsah-secondary mt-2">
          We hope you love your products! ✨
        </p>
      </div>
    </div>
  );
}
