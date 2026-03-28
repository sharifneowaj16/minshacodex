'use client';

/**
 * app/track/page.tsx
 *
 * Public order tracking page — no login required.
 * Customers can track by:
 *   1. Steadfast tracking code
 *   2. Order number + phone number
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Phone,
  ShoppingBag,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TrackingTimeline {
  key: string;
  label: string;
  done: boolean;
  date?: string | null;
}

interface TrackingResult {
  found: boolean;
  trackingCode?: string;
  orderNumber?: string;
  steadfastStatus?: string;
  orderStatus?: string;
  statusLabel?: string;
  statusColor?: string;
  timeline?: TrackingTimeline[];
  estimatedDelivery?: string | null;
  orderDate?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  deliveryCity?: string;
  itemCount?: number;
  items?: Array<{ name: string; quantity: number }>;
  error?: string;
}

// ─── Timeline Step ─────────────────────────────────────────────────────────

function TimelineStep({
  step,
  isLast,
}: {
  step: TrackingTimeline;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            step.done
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {step.key === 'ordered' && <ShoppingBag className="w-5 h-5" />}
          {step.key === 'confirmed' && <CheckCircle className="w-5 h-5" />}
          {step.key === 'dispatched' && <Package className="w-5 h-5" />}
          {step.key === 'out_for_delivery' && <Truck className="w-5 h-5" />}
          {step.key === 'delivered' && <MapPin className="w-5 h-5" />}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-1 ${
              step.done ? 'bg-violet-300' : 'bg-gray-200'
            }`}
            style={{ minHeight: '2rem' }}
          />
        )}
      </div>
      <div className="pb-6 pt-2">
        <p
          className={`font-semibold text-sm ${
            step.done ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {step.label}
        </p>
        {step.date && (
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(step.date).toLocaleString('en-BD', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

function TrackPageContent() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'code' | 'order'>('order');
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doTrack = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let url: string;
      if (mode === 'code') {
        if (!trackingCode.trim()) {
          setError('Please enter a tracking code');
          return;
        }
        url = `/api/track?code=${encodeURIComponent(trackingCode.trim())}`;
      } else {
        if (!orderNumber.trim() || !phone.trim()) {
          setError('Please enter both order number and phone number');
          return;
        }
        url = `/api/track?order=${encodeURIComponent(
          orderNumber.trim()
        )}&phone=${encodeURIComponent(phone.trim())}`;
      }

      const res = await fetch(url);
      const data: TrackingResult = await res.json();

      if (!res.ok || !data.found) {
        setError(data.error || 'Order not found. Please check your details.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, trackingCode, orderNumber, phone]);

  // Auto-search if URL has params
  useEffect(() => {
    const code = searchParams.get('code');
    const order = searchParams.get('order');
    const ph = searchParams.get('phone');
    if (code) {
      setMode('code');
      setTrackingCode(code);
    } else if (order && ph) {
      setMode('order');
      setOrderNumber(order);
      setPhone(ph);
    }
    if (code || (order && ph)) {
      setTimeout(doTrack, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doTrack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-gray-900">Minsah Beauty</span>
          </Link>
          <Link
            href="/shop"
            className="text-sm text-violet-600 hover:text-violet-800 font-medium"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-200">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">
            Enter your order details to get real-time delivery updates
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 p-6 mb-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            <button
              onClick={() => { setMode('order'); setResult(null); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'order'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Order Number
            </button>
            <button
              onClick={() => { setMode('code'); setResult(null); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'code'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tracking Code
            </button>
          </div>

          {mode === 'order' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  ORDER NUMBER
                </label>
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. MB1234567890ABCD"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                STEADFAST TRACKING CODE
              </label>
              <input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. SFB12345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
              />
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={doTrack}
            disabled={loading}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Track Order
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden">
            {/* Status header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium">ORDER NUMBER</p>
                  <p className="text-white font-bold text-lg font-mono">
                    {result.orderNumber || '—'}
                  </p>
                </div>
                {result.trackingCode && (
                  <div className="text-right">
                    <p className="text-white/70 text-xs font-medium">TRACKING CODE</p>
                    <p className="text-white font-bold font-mono text-sm">
                      {result.trackingCode}
                    </p>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30`}>
                  {result.steadfastStatus === 'delivered' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : result.steadfastStatus === 'cancelled' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                  )}
                  {result.statusLabel || result.orderStatus}
                </span>
                {result.deliveryCity && (
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {result.deliveryCity}
                  </span>
                )}
              </div>

              {/* Estimated delivery */}
              {result.estimatedDelivery && result.steadfastStatus !== 'delivered' && (
                <p className="text-white/80 text-xs mt-2">
                  🗓 Estimated delivery:{' '}
                  {new Date(result.estimatedDelivery).toLocaleDateString('en-BD', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
            </div>

            {/* Timeline */}
            {result.timeline && result.timeline.length > 0 && (
              <div className="px-6 py-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Delivery Timeline
                </h3>
                <div>
                  {result.timeline.map((step, idx) => (
                    <TimelineStep
                      key={step.key}
                      step={step}
                      isLast={idx === result.timeline!.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            {result.items && result.items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Items ({result.itemCount})
                </h3>
                <div className="space-y-1.5">
                  {result.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm text-gray-600"
                    >
                      <span>{item.name}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order date */}
            {result.orderDate && (
              <div className="border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-500">
                  Ordered on{' '}
                  {new Date(result.orderDate).toLocaleDateString('en-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Help */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Need help?{' '}
                <Link href="/contact" className="text-violet-600 hover:underline font-medium">
                  Contact Support
                </Link>{' '}
                or call us at{' '}
                <a href="tel:+8801XXXXXXXXX" className="text-violet-600 hover:underline font-medium">
                  01XXXXXXXXX
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Steadfast attribution */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by{' '}
          <a
            href="https://steadfast.com.bd"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-600"
          >
            Steadfast Courier
          </a>
        </p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}