'use client';

/**
 * components/admin/SteadfastShipPanel.tsx
 *
 * Slide-in panel to dispatch an order to Steadfast courier.
 * Used inside /admin/orders page.
 *
 * Features:
 * - Pre-filled recipient & COD info
 * - Editable note
 * - Live status badge
 * - Re-sync button
 * - Wallet balance display
 */

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Truck,
  Package,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Wallet,
  Copy,
  ExternalLink,
  Send,
  MapPin,
  Phone,
  User,
  DollarSign,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface OrderForShipping {
  id: string;
  dbId: string;
  customer: { name: string; email: string; phone: string };
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shipping?: {
    address: string;
    city: string;
    phone: string;
    name: string;
  };
  steadfastConsignmentId?: string;
  steadfastTrackingCode?: string;
  steadfastStatus?: string;
  steadfastSentAt?: string;
}

interface SteadfastShipPanelProps {
  order: OrderForShipping | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: (orderNumber: string, trackingCode: string) => void;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending Pickup',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  in_review: {
    label: 'In Review',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
  },
  partial_delivered: {
    label: 'Partially Delivered',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Package className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: 'Delivered ✓',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <Package className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function SteadfastShipPanel({
  order,
  isOpen,
  onClose,
  onDispatched,
}: SteadfastShipPanelProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [codAmount, setCodAmount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [consignmentId, setConsignmentId] = useState<string | null>(null);

  // Init state when order changes
  useEffect(() => {
    if (order) {
      const isCOD =
        order.paymentMethod?.toLowerCase().includes('cod') ||
        order.paymentMethod?.toLowerCase().includes('cash') ||
        order.paymentStatus !== 'completed';
      setCodAmount(isCOD ? order.total : 0);
      setNote('');
      setError(null);
      setSuccess(null);
      setCurrentStatus(order.steadfastStatus ?? null);
      setTrackingCode(order.steadfastTrackingCode ?? null);
      setConsignmentId(order.steadfastConsignmentId ?? null);
    }
  }, [order]);

  // Fetch balance when panel opens
  useEffect(() => {
    if (isOpen) {
      setBalanceLoading(true);
      fetch('/api/admin/shipping/steadfast/balance', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setBalance(d.balance ?? null))
        .catch(() => setBalance(null))
        .finally(() => setBalanceLoading(false));
    }
  }, [isOpen]);

  const handleDispatch = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/shipping/steadfast/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.dbId,
          codAmount,
          note: note || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to dispatch order');
        return;
      }

      setTrackingCode(data.trackingCode);
      setConsignmentId(String(data.consignmentId));
      setCurrentStatus('pending');
      setSuccess(`✓ Dispatched! Tracking: ${data.trackingCode}`);
      onDispatched?.(order.id, data.trackingCode);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [order, codAmount, note, onDispatched]);

  const handleSync = useCallback(async () => {
    if (!order) return;
    setSyncing(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/shipping/steadfast/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.dbId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentStatus(data.steadfastStatus);
        setSuccess(`Status refreshed: ${data.steadfastStatus}`);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSyncing(false);
    }
  }, [order]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (!isOpen || !order) return null;

  const alreadyDispatched = !!(consignmentId || order.steadfastConsignmentId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Steadfast Courier</h2>
              <p className="text-white/70 text-sm">Order #{order.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-white/80" />
              <span className="text-white text-sm font-medium">
                {balanceLoading ? (
                  <span className="animate-pulse">...</span>
                ) : balance !== null ? (
                  `৳${balance.toLocaleString()}`
                ) : (
                  'N/A'
                )}
              </span>
              {balance !== null && balance < 500 && (
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status card — if already dispatched */}
          {alreadyDispatched && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-800">
                  📦 Dispatched to Steadfast
                </span>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {currentStatus && <StatusBadge status={currentStatus} />}

              <div className="space-y-2">
                {(trackingCode || order.steadfastTrackingCode) && (
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs text-gray-500">Tracking Code</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {trackingCode || order.steadfastTrackingCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(trackingCode || order.steadfastTrackingCode || '')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`/track?code=${trackingCode || order.steadfastTrackingCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
                {(consignmentId || order.steadfastConsignmentId) && (
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs text-gray-500">Consignment ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {consignmentId || order.steadfastConsignmentId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipient Info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" />
              Recipient Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.shipping?.name || order.customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.shipping?.phone || order.customer.phone || '—'}</span>
              </div>
              {order.shipping?.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {order.shipping.address}
                    {order.shipping.city ? `, ${order.shipping.city}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* COD Amount */}
          {!alreadyDispatched && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-500" />
                  COD Amount (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(Number(e.target.value))}
                    min={0}
                    step={0.01}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {codAmount === 0
                    ? '💳 Prepaid — no cash collection'
                    : `💵 Collect ৳${codAmount.toFixed(2)} on delivery`}
                </p>
              </div>

              {/* Optional note */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Delivery Note{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Call before delivery, fragile items..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          {copied && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
              <p className="text-sm text-violet-700 text-center">✓ Copied to clipboard</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 space-y-3">
          {!alreadyDispatched ? (
            <button
              onClick={handleDispatch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending to Steadfast...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch to Steadfast
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 flex items-center justify-center gap-2 border border-violet-200 text-violet-700 hover:bg-violet-50 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync Status
              </button>
              <a
                href={`https://portal.steadfast.com.bd`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Portal
              </a>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
