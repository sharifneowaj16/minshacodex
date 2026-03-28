'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { formatPrice } from '@/utils/currency';
import {
  Search, Filter, Eye, Truck, RefreshCw, Download, X, ChevronDown,
  ChevronLeft, ChevronRight, Package, Clock, CheckCircle, XCircle,
  AlertCircle, CreditCard, MapPin, User, Phone, Mail, Copy,
  ExternalLink, Printer, MessageSquare, ArrowUpDown, Calendar,
  TrendingUp, ShoppingBag, DollarSign, MoreHorizontal, Edit3,
  Check, Loader2, ChevronUp, Hash, Layers, Star, Send
} from 'lucide-react';
import SteadfastShipPanel from '@/components/admin/SteadfastShipPanel';
import SteadfastStatusBadge from '@/components/admin/SteadfastStatusBadge';
import SteadfastBulkDispatch from '@/components/admin/SteadfastBulkDispatch';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  variant?: {
    name: string;
    attributes?: Record<string, string>;
  };
}

interface Payment {
  id: string;
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  createdAt: string;
}

interface ShippingAddress {
  name?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface TimelineEvent {
  timestamp: string;
  status: string;
  note?: string;
  actor?: string;
}

interface Order {
  id: string;        // orderNumber
  dbId?: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  payments?: Payment[];
  shipping: ShippingAddress;
  shippingMethod?: string;
  tracking?: string;
  customerNote?: string;
  adminNote?: string;
  timeline?: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  // Steadfast fields
  steadfastConsignmentId?: string | null;
  steadfastTrackingCode?: string | null;
  steadfastStatus?: string | null;
  steadfastSentAt?: string | null;
}

interface Stats {
  pending: number;
  processing: number;
  shipped: number;
  totalRevenue: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-400' },
  processing: { label: 'Processing', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-400' },
  shipped:    { label: 'Shipped',    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',      dot: 'bg-cyan-400' },
  completed:  { label: 'Completed',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-400' },
  refunded:   { label: 'Refunded',   color: 'bg-slate-50 text-slate-600 border-slate-200',  dot: 'bg-slate-400' },
} as const;

const PAYMENT_STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:     { label: 'Paid',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed:{ label: 'Paid',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:   { label: 'Failed',   color: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', color: 'bg-slate-50 text-slate-600 border-slate-200' },
} as const;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Cash on Delivery',
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  card: 'Card',
  sslcommerz: 'SSLCommerz',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {});
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const cfg = PAYMENT_STATUS_CONFIG[status as keyof typeof PAYMENT_STATUS_CONFIG];
  if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDetailDrawer({
  order,
  onClose,
  onStatusUpdate,
  onNoteUpdate,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, tracking?: string) => Promise<void>;
  onNoteUpdate: (id: string, note: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'payments' | 'timeline'>('overview');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingInput, setTrackingInput] = useState(order.tracking || '');
  const [noteInput, setNoteInput] = useState(order.adminNote || '');
  const [savingNote, setSavingNote] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }));

  const handleStatusSave = async () => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus, trackingInput || undefined);
    } finally {
      setUpdating(false);
    }
  };

  const handleNoteSave = async () => {
    setSavingNote(true);
    try {
      await onNoteUpdate(order.id, noteInput);
    } finally {
      setSavingNote(false);
    }
  };

  const buildTimeline = (): TimelineEvent[] => {
    const t: TimelineEvent[] = [{ timestamp: order.createdAt, status: 'Order Placed', note: 'Customer submitted order', actor: 'Customer' }];
    if (order.paidAt) t.push({ timestamp: order.paidAt, status: 'Payment Received', note: `Paid via ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}`, actor: 'System' });
    if (order.steadfastSentAt) t.push({ timestamp: order.steadfastSentAt, status: 'Sent to Steadfast', note: `Tracking: ${order.steadfastTrackingCode || '—'}`, actor: 'Admin' });
    if (order.shippedAt) t.push({ timestamp: order.shippedAt, status: 'Shipped', note: order.tracking ? `Tracking: ${order.tracking}` : 'Order dispatched', actor: 'Warehouse' });
    if (order.deliveredAt) t.push({ timestamp: order.deliveredAt, status: 'Delivered', note: 'Order delivered successfully', actor: 'Courier' });
    if (order.cancelledAt) t.push({ timestamp: order.cancelledAt, status: 'Cancelled', note: 'Order cancelled', actor: 'System' });
    return t.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const timeline = order.timeline?.length ? order.timeline : buildTimeline();

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Drawer Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">#{order.id}</h2>
              <CopyButton text={order.id} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100">
          <div className="flex gap-1 -mb-px">
            {(['overview', 'items', 'payments', 'timeline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5">

          {/* ── Overview Tab ──────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Customer</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${order.customer.email}`} className="hover:text-violet-600">{order.customer.email}</a>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${order.customer.phone}`} className="hover:text-violet-600">{order.customer.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Shipping Address</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      {order.shipping.name && <p className="font-medium">{order.shipping.name}</p>}
                      {order.shipping.street1 && <p>{order.shipping.street1}</p>}
                      {order.shipping.street2 && <p>{order.shipping.street2}</p>}
                      <p>{[order.shipping.city, order.shipping.state, order.shipping.postalCode].filter(Boolean).join(', ')}</p>
                      {order.shipping.country && <p>{order.shipping.country}</p>}
                      {order.shipping.phone && (
                        <p className="mt-1 flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" /> {order.shipping.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Steadfast Status Block */}
              {(order.steadfastConsignmentId || order.steadfastTrackingCode) && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-violet-700 uppercase mb-3 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Steadfast Courier
                  </h3>
                  <div className="space-y-2">
                    {order.steadfastStatus && (
                      <div className="flex items-center gap-2">
                        <SteadfastStatusBadge status={order.steadfastStatus} trackingCode={order.steadfastTrackingCode} />
                      </div>
                    )}
                    {order.steadfastTrackingCode && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 text-xs">Tracking:</span>
                        <span className="font-mono font-semibold text-gray-900">{order.steadfastTrackingCode}</span>
                        <CopyButton text={order.steadfastTrackingCode} />
                        <a
                          href={`/track?code=${order.steadfastTrackingCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-600 hover:text-violet-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    {order.steadfastConsignmentId && (
                      <p className="text-xs text-gray-500">
                        Consignment ID: <span className="font-mono">{order.steadfastConsignmentId}</span>
                      </p>
                    )}
                    {order.steadfastSentAt && (
                      <p className="text-xs text-gray-400">Dispatched: {formatDateTime(order.steadfastSentAt)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Totals */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal ?? order.total)}</span>
                  </div>
                  {(order.shippingCost ?? 0) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{formatPrice(order.shippingCost!)}</span>
                    </div>
                  )}
                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                      <span>-{formatPrice(order.discountAmount!)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Payment</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Update Status</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm hover:border-violet-300 transition-colors"
                  >
                    <StatusBadge status={newStatus} />
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setNewStatus(opt.value as Order['status']); setShowStatusDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <StatusBadge status={opt.value} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Tracking number (optional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleStatusSave}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Status
                </button>
              </div>

              {/* Admin Note */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Admin Note
                </h3>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={3}
                  placeholder="Internal note (not visible to customer)…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleNoteSave}
                  disabled={savingNote}
                  className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 font-medium disabled:opacity-60"
                >
                  {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Note
                </button>
              </div>

              {/* Customer Note */}
              {order.customerNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-amber-700 uppercase mb-2">Customer Note</h3>
                  <p className="text-sm text-amber-900">{order.customerNote}</p>
                </div>
              )}
            </>
          )}

          {/* ── Items Tab ─────────────────────────────────────────── */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    {item.variant && (
                      <p className="text-xs text-violet-600">{item.variant.name}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(item.total)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-sm">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          )}

          {/* ── Payments Tab ──────────────────────────────────────── */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {order.payments?.length ? order.payments.map((p) => (
                <div key={p.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{PAYMENT_METHOD_LABELS[p.method] || p.method}</span>
                    <PaymentBadge status={p.status} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(p.amount)}</p>
                  {p.transactionId && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">TXN: {p.transactionId}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(p.createdAt)}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payment records yet</p>
                </div>
              )}
            </div>
          )}

          {/* ── Timeline Tab ──────────────────────────────────────── */}
          {activeTab === 'timeline' && (
            <div className="space-y-1">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-violet-600" />
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4 pt-1">
                    <p className="text-sm font-medium text-gray-900">{event.status}</p>
                    {event.note && <p className="text-xs text-gray-500">{event.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { hasPermission } = useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ pending: 0, processing: 0, shipped: 0, totalRevenue: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Steadfast state ────────────────────────────────────────────────────────
  const [shipPanelOrder, setShipPanelOrder] = useState<Order | null>(null);
  const [shipPanelOpen, setShipPanelOpen] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch list ─────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (page = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sortBy });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
      if (dateRange) params.set('dateRange', dateRange);

      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || { pending: 0, processing: 0, shipped: 0, totalRevenue: 0 });
      setPagination(data.pagination || { page, limit: 20, total: 0, pages: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, paymentFilter, dateRange, sortBy]);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.ORDERS_VIEW)) return;
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchOrders(1), search ? 400 : 0);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [fetchOrders, hasPermission, search]);

  // ── Fetch single order detail ──────────────────────────────────────────────

  const openOrderDetail = async (order: Order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const res = await fetch(`/api/admin/orders/${order.dbId || order.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        setSelectedOrder({
          id: o.orderNumber,
          dbId: o.id,
          customer: {
            name: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Unknown',
            email: o.user?.email || '',
            phone: o.user?.phone || '',
          },
          items: (o.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: Number(i.price),
            total: Number(i.total),
            image: i.product?.images?.[0]?.url,
            variant: i.variant ? { name: i.variant.name, attributes: i.variant.attributes } : undefined,
          })),
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          shippingCost: Number(o.shippingCost),
          taxAmount: Number(o.taxAmount),
          discountAmount: Number(o.discountAmount),
          couponCode: o.couponCode,
          couponDiscount: o.couponDiscount ? Number(o.couponDiscount) : undefined,
          status: o.status?.toLowerCase() as Order['status'],
          paymentMethod: o.paymentMethod || 'cod',
          paymentStatus: o.paymentStatus?.toLowerCase() as Order['paymentStatus'],
          payments: (o.payments || []).map((p: any) => ({
            id: p.id,
            method: p.method,
            status: p.status?.toLowerCase(),
            amount: Number(p.amount),
            transactionId: p.transactionId,
            createdAt: p.createdAt,
          })),
          shipping: o.shippingAddress ? {
            name: `${o.shippingAddress.firstName || ''} ${o.shippingAddress.lastName || ''}`.trim(),
            street1: o.shippingAddress.street1,
            street2: o.shippingAddress.street2,
            city: o.shippingAddress.city,
            state: o.shippingAddress.state,
            postalCode: o.shippingAddress.postalCode,
            country: o.shippingAddress.country,
            phone: o.shippingAddress.phone,
          } : {},
          shippingMethod: o.shippingMethod,
          tracking: o.trackingNumber,
          customerNote: o.customerNote,
          adminNote: o.adminNote,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          paidAt: o.paidAt,
          shippedAt: o.shippedAt,
          deliveredAt: o.deliveredAt,
          cancelledAt: o.cancelledAt,
          steadfastConsignmentId: o.steadfastConsignmentId,
          steadfastTrackingCode: o.steadfastTrackingCode,
          steadfastStatus: o.steadfastStatus,
          steadfastSentAt: o.steadfastSentAt,
        });
      }
    } catch { /* keep list data */ } finally {
      setDetailLoading(false);
    }
  };

  // ── Status / Note update ───────────────────────────────────────────────────

  const handleStatusUpdate = async (orderNumber: string, status: string, tracking?: string) => {
    const res = await fetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber: tracking }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => o.id === orderNumber
        ? { ...o, status: data.order.status, tracking: data.order.tracking }
        : o));
      setSelectedOrder((prev) => prev?.id === orderNumber
        ? { ...prev, status: data.order.status, tracking: data.order.tracking }
        : prev);
    }
  };

  const handleNoteUpdate = async (orderNumber: string, adminNote: string) => {
    const res = await fetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote }),
    });
    if (res.ok) {
      setSelectedOrder((prev) => prev?.id === orderNumber ? { ...prev, adminNote } : prev);
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.dbId || o.id)));
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ['Order #', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Payment Status', 'Payment Method', 'City', 'Tracking', 'Steadfast Status', 'Steadfast Tracking'],
      ...orders.map((o) => [
        o.id,
        formatDate(o.createdAt),
        o.customer.name,
        o.customer.email,
        o.customer.phone,
        o.items.reduce((s, i) => s + i.quantity, 0),
        o.total,
        o.status,
        o.paymentStatus,
        PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod,
        o.shipping?.city || '',
        o.tracking || '',
        o.steadfastStatus || '',
        o.steadfastTrackingCode || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!hasPermission(PERMISSIONS.ORDERS_VIEW)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
        <p className="text-gray-500 font-medium">No permission to view orders.</p>
      </div>
    );
  }

  const activeFilters = [statusFilter, paymentFilter, dateRange].filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {pagination.total > 0 ? `${pagination.total.toLocaleString()} orders total` : 'Manage and track all orders'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page, true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4 max-w-[1600px] mx-auto">

        {/* ── Stats Bar ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', filter: 'pending' },
            { label: 'Processing', value: stats.processing, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-50', filter: 'processing' },
            { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50', filter: 'shipped' },
            { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', filter: '' },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => stat.filter && setStatusFilter(statusFilter === stat.filter ? '' : stat.filter)}
              className={`bg-white border rounded-xl p-4 text-left hover:shadow-md transition-all ${
                stat.filter && statusFilter === stat.filter
                  ? 'border-violet-400 ring-2 ring-violet-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Search & Filters ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-colors ${
              showFilters || activeFilters > 0
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white border border-gray-100 rounded-xl">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="created">Newest First</option>
              <option value="updated">Recently Updated</option>
              <option value="total_high">Highest Total</option>
              <option value="total_low">Lowest Total</option>
              <option value="customer">Customer A–Z</option>
            </select>
            {activeFilters > 0 && (
              <div className="col-span-full flex justify-end">
                <button
                  onClick={() => { setStatusFilter(''); setPaymentFilter(''); setDateRange(''); setSortBy('created'); }}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Bulk Action Bar ───────────────────────────────────────── */}
        {selectedIds.size > 0 && (
          <div className="bg-violet-600 text-white rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Steadfast Bulk Dispatch */}
              <SteadfastBulkDispatch
                selectedIds={selectedIds}
                onComplete={() => {
                  setSelectedIds(new Set());
                  fetchOrders(pagination.page, true);
                }}
              />
              <button
                onClick={exportCSV}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Export Selected
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Orders Table ──────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-300" />
              <p className="text-sm">Loading orders…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">Failed to load orders</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button onClick={() => fetchOrders(1)} className="text-sm text-violet-600 hover:underline">Try again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <ShoppingBag className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === orders.length && orders.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Courier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`group hover:bg-gray-50/50 transition-colors ${
                        selectedIds.has(order.dbId || order.id) ? 'bg-violet-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.dbId || order.id)}
                          onChange={() => toggleSelect(order.dbId || order.id)}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>

                      {/* Order # */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono font-semibold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                          <CopyButton text={order.id} />
                        </div>
                        {order.tracking && (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            🚚 {order.tracking.slice(0, 12)}
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{order.customer.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{order.customer.email}</p>
                        {order.shipping?.city && (
                          <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />{order.shipping.city}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-sm text-gray-700 truncate max-w-[160px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Courier (Steadfast) */}
                      <td className="px-4 py-3.5">
                        <SteadfastStatusBadge
                          status={order.steadfastStatus}
                          trackingCode={order.steadfastTrackingCode}
                        />
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View detail */}
                          <button
                            onClick={() => openOrderDetail(order)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {/* Steadfast Dispatch / Track button */}
                          <button
                            onClick={() => {
                              setShipPanelOrder(order);
                              setShipPanelOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                              order.steadfastConsignmentId
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {order.steadfastConsignmentId ? (
                              <>
                                <Truck className="w-3.5 h-3.5" />
                                Track
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Ship
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchOrders(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => fetchOrders(page)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                      page === pagination.page
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => fetchOrders(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Order Detail Drawer ───────────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onNoteUpdate={handleNoteUpdate}
        />
      )}

      {/* ── Steadfast Ship Panel ──────────────────────────────────── */}
      <SteadfastShipPanel
        order={shipPanelOrder ? {
          id: shipPanelOrder.id,
          dbId: shipPanelOrder.dbId || shipPanelOrder.id,
          customer: shipPanelOrder.customer,
          total: shipPanelOrder.total,
          paymentMethod: shipPanelOrder.paymentMethod,
          paymentStatus: shipPanelOrder.paymentStatus,
          status: shipPanelOrder.status,
          shipping: shipPanelOrder.shipping ? {
            name: shipPanelOrder.shipping.name || shipPanelOrder.customer.name,
            address: [shipPanelOrder.shipping.street1, shipPanelOrder.shipping.street2].filter(Boolean).join(', '),
            city: shipPanelOrder.shipping.city || '',
            phone: shipPanelOrder.shipping.phone || shipPanelOrder.customer.phone,
          } : undefined,
          steadfastConsignmentId: shipPanelOrder.steadfastConsignmentId || undefined,
          steadfastTrackingCode: shipPanelOrder.steadfastTrackingCode || undefined,
          steadfastStatus: shipPanelOrder.steadfastStatus || undefined,
          steadfastSentAt: shipPanelOrder.steadfastSentAt || undefined,
        } : null}
        isOpen={shipPanelOpen}
        onClose={() => setShipPanelOpen(false)}
        onDispatched={(orderNumber, trackingCode) => {
          // Update the order in list to show dispatched state
          setOrders((prev) => prev.map((o) =>
            o.id === orderNumber
              ? { ...o, steadfastTrackingCode: trackingCode, steadfastStatus: 'pending', status: 'shipped' }
              : o
          ));
          fetchOrders(pagination.page, true);
        }}
      />
    </div>
  );
}

// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
// import { formatPrice } from '@/utils/currency';
// import {
//   Search, Filter, Eye, Truck, RefreshCw, Download, X, ChevronDown,
//   ChevronLeft, ChevronRight, Package, Clock, CheckCircle, XCircle,
//   AlertCircle, CreditCard, MapPin, User, Phone, Mail, Copy,
//   ExternalLink, Printer, MessageSquare, ArrowUpDown, Calendar,
//   TrendingUp, ShoppingBag, DollarSign, MoreHorizontal, Edit3,
//   Check, Loader2, ChevronUp, Hash, Layers, Star
// } from 'lucide-react';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface OrderItem {
//   id: string;
//   name: string;
//   sku: string;
//   quantity: number;
//   price: number;
//   total: number;
//   image?: string;
//   variant?: {
//     name: string;
//     attributes?: Record<string, string>;
//   };
// }

// interface Payment {
//   id: string;
//   method: string;
//   status: string;
//   amount: number;
//   transactionId?: string;
//   createdAt: string;
// }

// interface ShippingAddress {
//   name?: string;
//   street1?: string;
//   street2?: string;
//   city?: string;
//   state?: string;
//   postalCode?: string;
//   country?: string;
//   phone?: string;
// }

// interface TimelineEvent {
//   timestamp: string;
//   status: string;
//   note?: string;
//   actor?: string;
// }

// interface Order {
//   id: string;        // orderNumber
//   dbId?: string;
//   customer: { name: string; email: string; phone: string };
//   items: OrderItem[];
//   total: number;
//   subtotal?: number;
//   shippingCost?: number;
//   taxAmount?: number;
//   discountAmount?: number;
//   couponCode?: string;
//   couponDiscount?: number;
//   status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
//   paymentMethod: string;
//   paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
//   payments?: Payment[];
//   shipping: ShippingAddress;
//   shippingMethod?: string;
//   tracking?: string;
//   customerNote?: string;
//   adminNote?: string;
//   timeline?: TimelineEvent[];
//   createdAt: string;
//   updatedAt: string;
//   paidAt?: string;
//   shippedAt?: string;
//   deliveredAt?: string;
//   cancelledAt?: string;
// }

// interface Stats {
//   pending: number;
//   processing: number;
//   shipped: number;
//   totalRevenue: number;
// }

// interface Pagination {
//   page: number;
//   limit: number;
//   total: number;
//   pages: number;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const STATUS_CONFIG = {
//   pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400',   icon: Clock },
//   confirmed:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400',    icon: CheckCircle },
//   processing: { label: 'Processing', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-400',  icon: Layers },
//   shipped:    { label: 'Shipped',    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',        dot: 'bg-cyan-400',    icon: Truck },
//   completed:  { label: 'Delivered',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', icon: CheckCircle },
//   cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-400',     icon: XCircle },
//   refunded:   { label: 'Refunded',   color: 'bg-slate-50 text-slate-600 border-slate-200',    dot: 'bg-slate-400',   icon: AlertCircle },
// } as const;

// const PAYMENT_STATUS_CONFIG = {
//   pending:  { label: 'Pending',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
//   paid:     { label: 'Paid',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
//   failed:   { label: 'Failed',   color: 'bg-red-50 text-red-700 border-red-200' },
//   refunded: { label: 'Refunded', color: 'bg-slate-50 text-slate-600 border-slate-200' },
// } as const;

// const PAYMENT_METHOD_LABELS: Record<string, string> = {
//   cash_on_delivery: 'Cash on Delivery',
//   cod: 'Cash on Delivery',
//   bkash: 'bKash',
//   nagad: 'Nagad',
//   rocket: 'Rocket',
//   card: 'Card',
//   sslcommerz: 'SSLCommerz',
// };

// // ─── Utility helpers ──────────────────────────────────────────────────────────

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

// const formatDateTime = (iso: string) =>
//   new Date(iso).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// const timeAgo = (iso: string) => {
//   const diff = Date.now() - new Date(iso).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// };

// const copyToClipboard = (text: string) => {
//   navigator.clipboard.writeText(text).catch(() => {});
// };

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: string }) {
//   const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
//   if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//       {cfg.label}
//     </span>
//   );
// }

// function PaymentBadge({ status }: { status: string }) {
//   const cfg = PAYMENT_STATUS_CONFIG[status as keyof typeof PAYMENT_STATUS_CONFIG];
//   if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.color}`}>
//       {cfg.label}
//     </span>
//   );
// }

// function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);
//   const handle = () => {
//     copyToClipboard(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };
//   return (
//     <button onClick={handle} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
//       {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
//     </button>
//   );
// }

// // ─── Order Detail Drawer ──────────────────────────────────────────────────────

// function OrderDetailDrawer({
//   order,
//   onClose,
//   onStatusUpdate,
//   onNoteUpdate,
// }: {
//   order: Order;
//   onClose: () => void;
//   onStatusUpdate: (id: string, status: string, tracking?: string) => Promise<void>;
//   onNoteUpdate: (id: string, note: string) => Promise<void>;
// }) {
//   const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'payments' | 'timeline'>('overview');
//   const [updating, setUpdating] = useState(false);
//   const [newStatus, setNewStatus] = useState(order.status);
//   const [trackingInput, setTrackingInput] = useState(order.tracking || '');
//   const [noteInput, setNoteInput] = useState(order.adminNote || '');
//   const [savingNote, setSavingNote] = useState(false);
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);

//   const statusOptions = Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }));

//   const handleStatusSave = async () => {
//     setUpdating(true);
//     try {
//       await onStatusUpdate(order.id, newStatus, trackingInput || undefined);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleNoteSave = async () => {
//     setSavingNote(true);
//     try {
//       await onNoteUpdate(order.id, noteInput);
//     } finally {
//       setSavingNote(false);
//     }
//   };

//   const buildTimeline = (): TimelineEvent[] => {
//     const t: TimelineEvent[] = [{ timestamp: order.createdAt, status: 'Order Placed', note: 'Customer submitted order', actor: 'Customer' }];
//     if (order.paidAt) t.push({ timestamp: order.paidAt, status: 'Payment Received', note: `Paid via ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}`, actor: 'System' });
//     if (order.shippedAt) t.push({ timestamp: order.shippedAt, status: 'Shipped', note: order.tracking ? `Tracking: ${order.tracking}` : 'Order dispatched', actor: 'Warehouse' });
//     if (order.deliveredAt) t.push({ timestamp: order.deliveredAt, status: 'Delivered', note: 'Order delivered successfully', actor: 'Courier' });
//     if (order.cancelledAt) t.push({ timestamp: order.cancelledAt, status: 'Cancelled', note: 'Order cancelled', actor: 'System' });
//     return t.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
//   };

//   const timeline = order.timeline?.length ? order.timeline : buildTimeline();

//   return (
//     <div className="fixed inset-0 z-50 flex">
//       {/* Backdrop */}
//       <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

//       {/* Drawer */}
//       <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-slideIn">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Order</span>
//               <span className="font-bold text-gray-900 font-mono">#{order.id}</span>
//               <CopyButton text={order.id} />
//             </div>
//             <div className="flex items-center gap-2 mt-0.5">
//               <StatusBadge status={order.status} />
//               <PaymentBadge status={order.paymentStatus} />
//               <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => window.print()}
//               className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
//               title="Print"
//             >
//               <Printer className="w-4 h-4" />
//             </button>
//             <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b px-6 bg-white">
//           {(['overview', 'items', 'payments', 'timeline'] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${
//                 activeTab === tab
//                   ? 'border-violet-600 text-violet-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto">

//           {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
//           {activeTab === 'overview' && (
//             <div className="p-6 space-y-5">

//               {/* Customer Card */}
//               <div className="rounded-xl border border-gray-100 overflow-hidden">
//                 <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
//                   <User className="w-4 h-4 text-gray-400" />
//                   <span className="text-sm font-semibold text-gray-700">Customer</span>
//                 </div>
//                 <div className="p-4 space-y-2">
//                   <p className="font-semibold text-gray-900">{order.customer.name}</p>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Mail className="w-3.5 h-3.5" />
//                     <a href={`mailto:${order.customer.email}`} className="hover:text-violet-600 transition-colors">{order.customer.email}</a>
//                     <CopyButton text={order.customer.email} />
//                   </div>
//                   {order.customer.phone && (
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <Phone className="w-3.5 h-3.5" />
//                       <a href={`tel:${order.customer.phone}`} className="hover:text-violet-600 transition-colors">{order.customer.phone}</a>
//                       <CopyButton text={order.customer.phone} />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Shipping */}
//               <div className="rounded-xl border border-gray-100 overflow-hidden">
//                 <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
//                   <MapPin className="w-4 h-4 text-gray-400" />
//                   <span className="text-sm font-semibold text-gray-700">Shipping Address</span>
//                   {order.shippingMethod && (
//                     <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{order.shippingMethod}</span>
//                   )}
//                 </div>
//                 <div className="p-4 text-sm text-gray-700 space-y-0.5">
//                   {order.shipping.name && <p className="font-medium">{order.shipping.name}</p>}
//                   {order.shipping.street1 && <p>{order.shipping.street1}</p>}
//                   {order.shipping.street2 && <p>{order.shipping.street2}</p>}
//                   <p>{[order.shipping.city, order.shipping.state, order.shipping.postalCode].filter(Boolean).join(', ')}</p>
//                   {order.shipping.country && <p className="text-gray-500">{order.shipping.country}</p>}
//                   {order.shipping.phone && (
//                     <div className="flex items-center gap-1.5 mt-1 text-gray-600">
//                       <Phone className="w-3.5 h-3.5" />
//                       {order.shipping.phone}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Order Summary */}
//               <div className="rounded-xl border border-gray-100 overflow-hidden">
//                 <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
//                   <DollarSign className="w-4 h-4 text-gray-400" />
//                   <span className="text-sm font-semibold text-gray-700">Order Summary</span>
//                 </div>
//                 <div className="p-4 space-y-2 text-sm">
//                   <div className="flex justify-between text-gray-600">
//                     <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
//                     <span>{formatPrice(order.subtotal ?? order.total)}</span>
//                   </div>
//                   {(order.shippingCost ?? 0) > 0 && (
//                     <div className="flex justify-between text-gray-600">
//                       <span>Shipping</span>
//                       <span>{formatPrice(order.shippingCost!)}</span>
//                     </div>
//                   )}
//                   {(order.taxAmount ?? 0) > 0 && (
//                     <div className="flex justify-between text-gray-600">
//                       <span>Tax</span>
//                       <span>{formatPrice(order.taxAmount!)}</span>
//                     </div>
//                   )}
//                   {(order.discountAmount ?? 0) > 0 && (
//                     <div className="flex justify-between text-emerald-600">
//                       <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
//                       <span>−{formatPrice(order.discountAmount!)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between font-bold text-gray-900 pt-2 border-t mt-2 text-base">
//                     <span>Total</span>
//                     <span>{formatPrice(order.total)}</span>
//                   </div>
//                   <div className="flex justify-between text-gray-500 text-xs pt-1">
//                     <span>Payment Method</span>
//                     <span className="font-medium text-gray-700">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Tracking */}
//               {(order.status === 'shipped' || order.tracking) && (
//                 <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Truck className="w-4 h-4 text-cyan-600" />
//                     <span className="text-sm font-semibold text-cyan-800">Tracking Number</span>
//                   </div>
//                   {order.tracking ? (
//                     <div className="flex items-center gap-2">
//                       <span className="font-mono text-cyan-700 font-medium">{order.tracking}</span>
//                       <CopyButton text={order.tracking} />
//                     </div>
//                   ) : (
//                     <span className="text-xs text-cyan-600">No tracking number yet</span>
//                   )}
//                 </div>
//               )}

//               {/* Notes */}
//               {order.customerNote && (
//                 <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
//                   <div className="flex items-center gap-2 mb-1">
//                     <MessageSquare className="w-4 h-4 text-amber-600" />
//                     <span className="text-sm font-semibold text-amber-800">Customer Note</span>
//                   </div>
//                   <p className="text-sm text-amber-700">{order.customerNote}</p>
//                 </div>
//               )}

//               {/* Admin Note */}
//               <div className="rounded-xl border border-gray-100 overflow-hidden">
//                 <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
//                   <Edit3 className="w-4 h-4 text-gray-400" />
//                   <span className="text-sm font-semibold text-gray-700">Admin Note</span>
//                 </div>
//                 <div className="p-4">
//                   <textarea
//                     value={noteInput}
//                     onChange={(e) => setNoteInput(e.target.value)}
//                     rows={3}
//                     placeholder="Add internal note..."
//                     className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-gray-400"
//                   />
//                   <div className="flex justify-end mt-2">
//                     <button
//                       onClick={handleNoteSave}
//                       disabled={savingNote}
//                       className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
//                     >
//                       {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
//                       Save Note
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── ITEMS TAB ────────────────────────────────────────── */}
//           {activeTab === 'items' && (
//             <div className="p-6">
//               <div className="space-y-3">
//                 {order.items.map((item) => (
//                   <div key={item.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
//                     {item.image ? (
//                       <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
//                     ) : (
//                       <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center">
//                         <Package className="w-5 h-5 text-gray-400" />
//                       </div>
//                     )}
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
//                       {item.variant && (
//                         <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
//                       )}
//                       <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku}</p>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.total)}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 pt-4 border-t space-y-1">
//                 {order.subtotal !== undefined && (
//                   <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
//                 )}
//                 {(order.shippingCost ?? 0) > 0 && (
//                   <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{formatPrice(order.shippingCost!)}</span></div>
//                 )}
//                 {(order.discountAmount ?? 0) > 0 && (
//                   <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>−{formatPrice(order.discountAmount!)}</span></div>
//                 )}
//                 <div className="flex justify-between font-bold text-gray-900 pt-2 border-t text-base">
//                   <span>Total</span><span>{formatPrice(order.total)}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── PAYMENTS TAB ─────────────────────────────────────── */}
//           {activeTab === 'payments' && (
//             <div className="p-6">
//               {order.payments && order.payments.length > 0 ? (
//                 <div className="space-y-3">
//                   {order.payments.map((p) => (
//                     <div key={p.id} className="border border-gray-100 rounded-xl p-4">
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="flex items-center gap-2">
//                           <CreditCard className="w-4 h-4 text-gray-400" />
//                           <span className="font-medium text-gray-900 text-sm">{PAYMENT_METHOD_LABELS[p.method] || p.method}</span>
//                         </div>
//                         <PaymentBadge status={p.status} />
//                       </div>
//                       <div className="space-y-1.5 text-sm">
//                         <div className="flex justify-between">
//                           <span className="text-gray-500">Amount</span>
//                           <span className="font-semibold">{formatPrice(p.amount)}</span>
//                         </div>
//                         {p.transactionId && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-500">Transaction ID</span>
//                             <div className="flex items-center gap-1">
//                               <span className="font-mono text-xs text-gray-700">{p.transactionId}</span>
//                               <CopyButton text={p.transactionId} />
//                             </div>
//                           </div>
//                         )}
//                         <div className="flex justify-between">
//                           <span className="text-gray-500">Date</span>
//                           <span className="text-gray-700">{formatDateTime(p.createdAt)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-400">
//                   <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
//                   <p className="text-sm">No payment records found</p>
//                   <p className="text-xs mt-1">Payment via: {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── TIMELINE TAB ─────────────────────────────────────── */}
//           {activeTab === 'timeline' && (
//             <div className="p-6">
//               <div className="relative">
//                 <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
//                 <div className="space-y-4">
//                   {timeline.map((event, i) => {
//                     const isLast = i === timeline.length - 1;
//                     return (
//                       <div key={i} className="relative flex gap-4 pl-10">
//                         <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isLast ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-white'}`}>
//                           <span className={`w-2 h-2 rounded-full ${isLast ? 'bg-violet-400' : 'bg-gray-300'}`} />
//                         </div>
//                         <div className="flex-1 pb-4">
//                           <div className="flex items-center justify-between">
//                             <p className="font-semibold text-sm text-gray-900">{event.status}</p>
//                             <span className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</span>
//                           </div>
//                           {event.note && <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>}
//                           {event.actor && <p className="text-xs text-gray-400 mt-0.5">by {event.actor}</p>}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── Footer: Status Update ─────────────────────────────── */}
//         <div className="border-t bg-gray-50 p-4">
//           <div className="flex items-center gap-3">
//             <div className="flex-1 relative">
//               <select
//                 value={newStatus}
//                 onChange={(e) => setNewStatus(e.target.value as Order['status'])}
//                 className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//               >
//                 {statusOptions.map((o) => (
//                   <option key={o.value} value={o.value}>{o.label}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//             {(newStatus === 'shipped' || order.status === 'shipped') && (
//               <input
//                 value={trackingInput}
//                 onChange={(e) => setTrackingInput(e.target.value)}
//                 placeholder="Tracking number"
//                 className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//               />
//             )}
//             <button
//               onClick={handleStatusSave}
//               disabled={updating || newStatus === order.status}
//               className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//             >
//               {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
//               Update
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function OrdersPage() {
//   const { hasPermission } = useAdminAuth();

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState<Stats>({ pending: 0, processing: 0, shipped: 0, totalRevenue: 0 });
//   const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });

//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [paymentFilter, setPaymentFilter] = useState('');
//   const [dateRange, setDateRange] = useState('');
//   const [sortBy, setSortBy] = useState('created');
//   const [showFilters, setShowFilters] = useState(false);

//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [detailLoading, setDetailLoading] = useState(false);

//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // ── Fetch list ─────────────────────────────────────────────────────────────

//   const fetchOrders = useCallback(async (page = 1, isRefresh = false) => {
//     if (isRefresh) setRefreshing(true); else setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({ page: String(page), limit: '20', sortBy });
//       if (search) params.set('search', search);
//       if (statusFilter) params.set('status', statusFilter);
//       if (paymentFilter) params.set('paymentStatus', paymentFilter);
//       if (dateRange) params.set('dateRange', dateRange);

//       const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
//       if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch orders');
//       const data = await res.json();
//       setOrders(data.orders || []);
//       setStats(data.stats || { pending: 0, processing: 0, shipped: 0, totalRevenue: 0 });
//       setPagination(data.pagination || { page, limit: 20, total: 0, pages: 0 });
//     } catch (e) {
//       setError(e instanceof Error ? e.message : 'Error loading orders');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [search, statusFilter, paymentFilter, dateRange, sortBy]);

//   useEffect(() => {
//     if (!hasPermission(PERMISSIONS.ORDERS_VIEW)) return;
//     if (searchRef.current) clearTimeout(searchRef.current);
//     searchRef.current = setTimeout(() => fetchOrders(1), search ? 400 : 0);
//     return () => { if (searchRef.current) clearTimeout(searchRef.current); };
//   }, [fetchOrders, hasPermission, search]);

//   // ── Fetch single order detail ──────────────────────────────────────────────

//   const openOrderDetail = async (order: Order) => {
//     setDetailLoading(true);
//     setSelectedOrder(order); // show immediately with list data
//     try {
//       const res = await fetch(`/api/admin/orders/${order.dbId || order.id}`, { credentials: 'include' });
//       if (res.ok) {
//         const data = await res.json();
//         const o = data.order;
//         // Map API response to our Order type
//         setSelectedOrder({
//           id: o.orderNumber,
//           dbId: o.id,
//           customer: {
//             name: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Unknown',
//             email: o.user?.email || '',
//             phone: o.user?.phone || '',
//           },
//           items: (o.items || []).map((i: any) => ({
//             id: i.id,
//             name: i.name,
//             sku: i.sku,
//             quantity: i.quantity,
//             price: Number(i.price),
//             total: Number(i.total),
//             image: i.product?.images?.[0]?.url,
//             variant: i.variant ? { name: i.variant.name, attributes: i.variant.attributes } : undefined,
//           })),
//           total: Number(o.total),
//           subtotal: Number(o.subtotal),
//           shippingCost: Number(o.shippingCost),
//           taxAmount: Number(o.taxAmount),
//           discountAmount: Number(o.discountAmount),
//           couponCode: o.couponCode,
//           couponDiscount: o.couponDiscount ? Number(o.couponDiscount) : undefined,
//           status: o.status?.toLowerCase() as Order['status'],
//           paymentMethod: o.paymentMethod || 'cod',
//           paymentStatus: o.paymentStatus?.toLowerCase() as Order['paymentStatus'],
//           payments: (o.payments || []).map((p: any) => ({
//             id: p.id,
//             method: p.method,
//             status: p.status?.toLowerCase(),
//             amount: Number(p.amount),
//             transactionId: p.transactionId,
//             createdAt: p.createdAt,
//           })),
//           shipping: o.shippingAddress ? {
//             name: o.shippingAddress.fullName || o.shippingAddress.name,
//             street1: o.shippingAddress.street1 || o.shippingAddress.addressLine1,
//             street2: o.shippingAddress.street2 || o.shippingAddress.addressLine2,
//             city: o.shippingAddress.city,
//             state: o.shippingAddress.state || o.shippingAddress.division,
//             postalCode: o.shippingAddress.postalCode,
//             country: o.shippingAddress.country,
//             phone: o.shippingAddress.phone,
//           } : order.shipping,
//           shippingMethod: o.shippingMethod,
//           tracking: o.trackingNumber,
//           customerNote: o.customerNote,
//           adminNote: o.adminNote,
//           createdAt: o.createdAt,
//           updatedAt: o.updatedAt,
//           paidAt: o.paidAt,
//           shippedAt: o.shippedAt,
//           deliveredAt: o.deliveredAt,
//           cancelledAt: o.cancelledAt,
//         });
//       }
//     } catch {}
//     finally { setDetailLoading(false); }
//   };

//   // ── Status update ──────────────────────────────────────────────────────────

//   const handleStatusUpdate = async (orderId: string, status: string, tracking?: string) => {
//     const target = orders.find((o) => o.id === orderId);
//     const dbId = target?.dbId || orderId;
//     const res = await fetch(`/api/admin/orders/${dbId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ status, ...(tracking ? { trackingNumber: tracking } : {}) }),
//     });
//     if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
//     const data = await res.json();
//     const updatedStatus = data.order.status as Order['status'];
//     setOrders((prev) => prev.map((o) =>
//       o.id === orderId ? { ...o, status: updatedStatus, tracking: data.order.tracking || o.tracking } : o
//     ));
//     setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, status: updatedStatus, tracking: data.order.tracking || prev.tracking } : prev);
//   };

//   const handleNoteUpdate = async (orderId: string, adminNote: string) => {
//     const target = orders.find((o) => o.id === orderId);
//     const dbId = target?.dbId || orderId;
//     const res = await fetch(`/api/admin/orders/${dbId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ adminNote }),
//     });
//     if (!res.ok) throw new Error((await res.json()).error || 'Failed to save note');
//     setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, adminNote } : prev);
//   };

//   // ── Bulk actions ───────────────────────────────────────────────────────────

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.size === orders.length) {
//       setSelectedIds(new Set());
//     } else {
//       setSelectedIds(new Set(orders.map((o) => o.id)));
//     }
//   };

//   // ── Export ─────────────────────────────────────────────────────────────────

//   const exportCSV = () => {
//     const rows = [
//       ['Order #', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Payment Status', 'Payment Method', 'City', 'Tracking'],
//       ...orders.map((o) => [
//         o.id,
//         formatDate(o.createdAt),
//         o.customer.name,
//         o.customer.email,
//         o.customer.phone,
//         o.items.reduce((s, i) => s + i.quantity, 0),
//         o.total,
//         o.status,
//         o.paymentStatus,
//         PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod,
//         o.shipping.city || '',
//         o.tracking || '',
//       ]),
//     ];
//     const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
//     a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
//     a.click();
//   };

//   // ── Guard ──────────────────────────────────────────────────────────────────

//   if (!hasPermission(PERMISSIONS.ORDERS_VIEW)) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-center">
//         <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
//         <p className="text-gray-500 font-medium">No permission to view orders.</p>
//       </div>
//     );
//   }

//   const activeFilters = [statusFilter, paymentFilter, dateRange].filter(Boolean).length;

//   // ─────────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="min-h-screen bg-[#F7F8FA]">

//       {/* ── Top Header ────────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
//         <div className="px-6 py-4 flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900 tracking-tight">Orders</h1>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {pagination.total > 0 ? `${pagination.total.toLocaleString()} orders total` : 'Manage and track all orders'}
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => fetchOrders(pagination.page, true)}
//               disabled={refreshing}
//               className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </button>
//             <button
//               onClick={exportCSV}
//               className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <Download className="w-3.5 h-3.5" />
//               Export
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="px-6 py-5 space-y-4 max-w-[1600px] mx-auto">

//         {/* ── Stats Bar ────────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//           {[
//             { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', filter: 'pending' },
//             { label: 'Processing', value: stats.processing, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-50', filter: 'processing' },
//             { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50', filter: 'shipped' },
//             { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', filter: '' },
//           ].map((stat) => (
//             <button
//               key={stat.label}
//               onClick={() => stat.filter && setStatusFilter(statusFilter === stat.filter ? '' : stat.filter)}
//               className={`bg-white border rounded-xl p-4 text-left hover:shadow-md transition-all ${
//                 stat.filter && statusFilter === stat.filter ? 'border-violet-300 ring-1 ring-violet-200' : 'border-gray-100'
//               }`}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
//                 <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
//                   <stat.icon className={`w-4 h-4 ${stat.color}`} />
//                 </div>
//               </div>
//               <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//             </button>
//           ))}
//         </div>

//         {/* ── Search & Filter Row ───────────────────────────────────── */}
//         <div className="flex items-center gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by order #, customer name, or email..."
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//             />
//           </div>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
//               showFilters || activeFilters > 0
//                 ? 'border-violet-300 bg-violet-50 text-violet-700'
//                 : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//             }`}
//           >
//             <Filter className="w-4 h-4" />
//             Filters
//             {activeFilters > 0 && (
//               <span className="bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
//             )}
//           </button>
//         </div>

//         {/* ── Filter Panel ─────────────────────────────────────────── */}
//         {showFilters && (
//           <div className="bg-white border border-gray-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
//             {/* Status */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Order Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//               >
//                 <option value="">All Statuses</option>
//                 {Object.entries(STATUS_CONFIG).map(([v, c]) => (
//                   <option key={v} value={v}>{c.label}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Payment */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Payment Status</label>
//               <select
//                 value={paymentFilter}
//                 onChange={(e) => setPaymentFilter(e.target.value)}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//               >
//                 <option value="">All</option>
//                 {Object.entries(PAYMENT_STATUS_CONFIG).map(([v, c]) => (
//                   <option key={v} value={v}>{c.label}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Date Range */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date Range</label>
//               <select
//                 value={dateRange}
//                 onChange={(e) => setDateRange(e.target.value)}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//               >
//                 <option value="">All Time</option>
//                 <option value="today">Today</option>
//                 <option value="7d">Last 7 Days</option>
//                 <option value="30d">Last 30 Days</option>
//                 <option value="90d">Last 90 Days</option>
//               </select>
//             </div>
//             {/* Sort */}
//             <div>
//               <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//               >
//                 <option value="created">Newest First</option>
//                 <option value="updated">Last Updated</option>
//                 <option value="total_high">Highest Total</option>
//                 <option value="total_low">Lowest Total</option>
//                 <option value="customer">Customer A–Z</option>
//               </select>
//             </div>
//             {activeFilters > 0 && (
//               <div className="col-span-full flex justify-end">
//                 <button
//                   onClick={() => { setStatusFilter(''); setPaymentFilter(''); setDateRange(''); setSortBy('created'); }}
//                   className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
//                 >
//                   <X className="w-3 h-3" /> Clear filters
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Bulk Action Bar ───────────────────────────────────────── */}
//         {selectedIds.size > 0 && (
//           <div className="bg-violet-600 text-white rounded-xl px-4 py-3 flex items-center gap-3">
//             <span className="text-sm font-medium">{selectedIds.size} selected</span>
//             <div className="flex items-center gap-2 ml-auto">
//               <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
//                 Mark as Processing
//               </button>
//               <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
//                 Export Selected
//               </button>
//               <button onClick={() => setSelectedIds(new Set())} className="text-white/70 hover:text-white">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── Orders Table ──────────────────────────────────────────── */}
//         <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-24 text-gray-400">
//               <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-300" />
//               <p className="text-sm">Loading orders…</p>
//             </div>
//           ) : error ? (
//             <div className="flex flex-col items-center justify-center py-24 text-center px-6">
//               <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
//               <p className="text-gray-600 font-medium mb-1">Failed to load orders</p>
//               <p className="text-gray-400 text-sm mb-4">{error}</p>
//               <button onClick={() => fetchOrders(1)} className="text-sm text-violet-600 hover:underline">Try again</button>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-24 text-center px-6">
//               <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
//               <p className="text-gray-500 font-medium">No orders found</p>
//               <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[900px]">
//                 <thead>
//                   <tr className="border-b border-gray-100">
//                     <th className="px-4 py-3 text-left w-10">
//                       <input
//                         type="checkbox"
//                         checked={selectedIds.size === orders.length && orders.length > 0}
//                         onChange={toggleSelectAll}
//                         className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
//                       />
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Items</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Payment</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
//                     <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {orders.map((order) => {
//                     const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
//                     return (
//                       <tr
//                         key={order.id}
//                         className={`group hover:bg-gray-50/70 transition-colors ${selectedIds.has(order.id) ? 'bg-violet-50/40' : ''}`}
//                       >
//                         <td className="px-4 py-3.5">
//                           <input
//                             type="checkbox"
//                             checked={selectedIds.has(order.id)}
//                             onChange={() => toggleSelect(order.id)}
//                             className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
//                           />
//                         </td>

//                         {/* Order # */}
//                         <td className="px-4 py-3.5">
//                           <div className="flex items-center gap-1.5">
//                             <span className="font-mono text-sm font-semibold text-gray-900">#{order.id}</span>
//                             <CopyButton text={order.id} />
//                           </div>
//                           {order.tracking && (
//                             <div className="text-xs text-cyan-600 font-mono mt-0.5 flex items-center gap-1">
//                               <Truck className="w-3 h-3" />
//                               {order.tracking}
//                             </div>
//                           )}
//                         </td>

//                         {/* Customer */}
//                         <td className="px-4 py-3.5">
//                           <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{order.customer.name}</p>
//                           <p className="text-xs text-gray-400 truncate max-w-[160px]">{order.customer.email}</p>
//                           {order.customer.phone && (
//                             <p className="text-xs text-gray-400">{order.customer.phone}</p>
//                           )}
//                         </td>

//                         {/* Items */}
//                         <td className="px-4 py-3.5 hidden md:table-cell">
//                           <div className="flex items-center gap-1.5">
//                             <Package className="w-3.5 h-3.5 text-gray-300" />
//                             <span className="text-sm text-gray-600">
//                               {order.items.reduce((s, i) => s + i.quantity, 0)} items
//                             </span>
//                           </div>
//                           <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">
//                             {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
//                           </p>
//                         </td>

//                         {/* Total */}
//                         <td className="px-4 py-3.5">
//                           <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
//                           <p className="text-xs text-gray-400 capitalize">
//                             {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
//                           </p>
//                         </td>

//                         {/* Status */}
//                         <td className="px-4 py-3.5">
//                           <StatusBadge status={order.status} />
//                         </td>

//                         {/* Payment */}
//                         <td className="px-4 py-3.5 hidden lg:table-cell">
//                           <PaymentBadge status={order.paymentStatus} />
//                         </td>

//                         {/* Date */}
//                         <td className="px-4 py-3.5 hidden lg:table-cell">
//                           <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
//                           <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-4 py-3.5 text-right">
//                           <button
//                             onClick={() => openOrderDetail(order)}
//                             className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors group-hover:border-violet-200"
//                           >
//                             <Eye className="w-3.5 h-3.5" />
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* ── Pagination ────────────────────────────────────────────── */}
//         {pagination.pages > 1 && (
//           <div className="flex items-center justify-between py-2">
//             <p className="text-sm text-gray-500">
//               Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => fetchOrders(pagination.page - 1)}
//                 disabled={pagination.page <= 1}
//                 className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
//                 const p = pagination.pages <= 7 ? i + 1 :
//                   pagination.page <= 4 ? i + 1 :
//                   pagination.page >= pagination.pages - 3 ? pagination.pages - 6 + i :
//                   pagination.page - 3 + i;
//                 return (
//                   <button
//                     key={p}
//                     onClick={() => fetchOrders(p)}
//                     className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
//                       p === pagination.page
//                         ? 'bg-violet-600 text-white'
//                         : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {p}
//                   </button>
//                 );
//               })}
//               <button
//                 onClick={() => fetchOrders(pagination.page + 1)}
//                 disabled={pagination.page >= pagination.pages}
//                 className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Order Detail Drawer ───────────────────────────────────── */}
//       {selectedOrder && (
//         <OrderDetailDrawer
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onStatusUpdate={handleStatusUpdate}
//           onNoteUpdate={handleNoteUpdate}
//         />
//       )}

//       {/* ── CSS for animation ─────────────────────────────────────── */}
//       <style jsx global>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//         }
//       `}</style>
//     </div>
//   );
// }
