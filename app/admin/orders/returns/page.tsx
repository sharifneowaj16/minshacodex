'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  MessageCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface ReturnRequest {
  id: string;
  dbId?: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  refundAmount: number;
  requestDate: string;
  images?: string[];
  notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  totalRefundAmount: number;
}

export default function ReturnsPage() {
  const { hasPermission } = useAdminAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, totalRefundAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/orders/returns?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch returns');
      }

      const data = await res.json();
      setReturns(data.returns || []);
      setStats(data.stats || { total: 0, pending: 0, approved: 0, totalRefundAmount: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (hasPermission(PERMISSIONS.ORDERS_REFUND)) {
      fetchReturns();
    }
  }, [fetchReturns, hasPermission]);

  if (!hasPermission(PERMISSIONS.ORDERS_REFUND)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don&apos;t have permission to manage returns.</p>
      </div>
    );
  }

  const getStatusColor = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (returnId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, adminNote }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update return');
      }

      const data = await res.json();

      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === returnId
            ? { ...ret, status: data.return.status as ReturnRequest['status'], notes: data.return.adminNote }
            : ret
        )
      );

      // Refresh stats
      fetchReturns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update return');
    }
  };

  const handleApprove = (returnId: string) => {
    handleUpdateStatus(returnId, 'approved');
  };

  const handleReject = (returnId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      handleUpdateStatus(returnId, 'rejected', reason);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns &amp; Refunds</h1>
          <p className="text-gray-600">Manage customer return requests and refunds</p>
        </div>
        <button
          onClick={fetchReturns}
          disabled={loading}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <RefreshCw className={clsx('w-5 h-5 mr-2', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(stats.totalRefundAmount))}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by return ID, order ID, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchReturns} className="mt-2 text-sm text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            <span className="ml-3 text-gray-500">Loading returns...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((returnRequest) => (
                  <tr key={returnRequest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{returnRequest.id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(returnRequest.requestDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{returnRequest.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{returnRequest.customer.name}</div>
                      <div className="text-xs text-gray-500">{returnRequest.customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{returnRequest.items.length} item(s)</div>
                      {returnRequest.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-500">{item.name}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{returnRequest.reason}</div>
                      {returnRequest.notes && (
                        <div className="text-xs text-blue-600 italic mt-1">{returnRequest.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(convertUSDtoBDT(returnRequest.refundAmount))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(returnRequest.status)
                      )}>
                        {returnRequest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-800" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {returnRequest.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(returnRequest.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(returnRequest.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-blue-600 hover:text-blue-800" title="Message Customer">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {returns.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No return requests found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
