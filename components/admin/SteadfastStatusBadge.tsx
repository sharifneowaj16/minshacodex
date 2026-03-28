'use client';

/**
 * components/admin/SteadfastStatusBadge.tsx
 *
 * Compact status badge for the orders table row.
 * Shows Steadfast delivery status with color coding.
 */

import { Truck, Package, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface SteadfastStatusBadgeProps {
  status?: string | null;
  trackingCode?: string | null;
  className?: string;
}

const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: <Clock className="w-3 h-3" />,
  },
  hold: {
    label: 'On Hold',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  in_review: {
    label: 'In Review',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    icon: <Package className="w-3 h-3" />,
  },
  partial_delivered: {
    label: 'Partial',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function SteadfastStatusBadge({
  status,
  trackingCode,
  className = '',
}: SteadfastStatusBadgeProps) {
  if (!status && !trackingCode) return null;

  if (!status && trackingCode) {
    // Has tracking code but no status yet — show as dispatched
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 ${className}`}
        title={trackingCode}
      >
        <Truck className="w-3 h-3" />
        Dispatched
      </span>
    );
  }

  const cfg = status ? STATUS_MAP[status] : null;

  if (!cfg) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 ${className}`}
      >
        <Package className="w-3 h-3" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg} ${cfg.text} ${className}`}
      title={trackingCode ?? undefined}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
