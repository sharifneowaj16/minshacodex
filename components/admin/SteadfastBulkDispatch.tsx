'use client';

/**
 * components/admin/SteadfastBulkDispatch.tsx
 *
 * Bulk dispatch button — shown when multiple orders are selected in admin orders page.
 * Drop-in for the existing "Bulk Action Bar".
 */

import { useState } from 'react';
import { Truck, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SteadfastBulkDispatchProps {
  selectedIds: Set<string>;         // order dbIds or orderNumbers
  onComplete?: (results: BulkResult) => void;
}

interface BulkResult {
  dispatched: number;
  failed: number;
  skipped: number;
}

export default function SteadfastBulkDispatch({
  selectedIds,
  onComplete,
}: SteadfastBulkDispatchProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBulkDispatch() {
    if (selectedIds.size === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/shipping/steadfast/send-bulk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedIds) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Bulk dispatch failed');
        return;
      }

      const r: BulkResult = {
        dispatched: data.dispatched,
        failed: data.failed,
        skipped: data.skipped,
      };
      setResult(r);
      onComplete?.(r);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBulkDispatch}
        disabled={loading || selectedIds.size === 0}
        className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Truck className="w-3.5 h-3.5" />
        )}
        {loading
          ? `Dispatching ${selectedIds.size}...`
          : `Dispatch ${selectedIds.size} via Steadfast`}
      </button>

      {result && (
        <div className="flex items-center gap-1 text-xs text-white/90">
          <CheckCircle className="w-3.5 h-3.5 text-green-300" />
          {result.dispatched} sent
          {result.failed > 0 && (
            <span className="text-yellow-300 ml-1">
              · {result.failed} failed
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-200">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}
