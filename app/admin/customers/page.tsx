'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  FileText,
  UserPlus,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  role: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyPoints: number;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  } | null;
  marketing: {
    emailConsent: boolean;
    smsConsent: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface CustomerFilters {
  search: string;
  status: string;
  sortBy: string;
}

export default function CustomersPage() {
  const { hasPermission } = useAdminAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, totalCount: 0, totalPages: 1,
  });
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0, activeCustomers: 0, suspendedCustomers: 0,
    totalOrders: 0, totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: '',
    sortBy: 'createdAt',
  });

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Fetch customers from API ───────────────────────────────────────────────
  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy: filters.sortBy,
        sortOrder: 'desc',
      });
      if (filters.search)  params.set('search', filters.search);
      if (filters.status)  params.set('status', filters.status);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch customers');
      }
      const data = await res.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  // ─── Status update ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async (customerId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      // Optimistic UI update
      setCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, status: newStatus as Customer['status'] } : c)
      );
    } catch (err) {
      alert('Failed to update customer status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':    return 'bg-green-100 text-green-700';
      case 'inactive':  return 'bg-gray-100 text-gray-600';
      case 'suspended': return 'bg-yellow-100 text-yellow-700';
      case 'banned':    return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-minsah-dark">Customers</h1>
          <p className="text-minsah-secondary mt-1">
            {pagination.totalCount} total customers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchCustomers(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {hasPermission(PERMISSIONS.CUSTOMERS_EDIT) && (
            <button className="flex items-center gap-2 px-4 py-2 bg-minsah-primary text-white rounded-lg text-sm hover:bg-minsah-dark transition">
              <UserPlus size={16} />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-minsah-accent">
          <p className="text-sm text-minsah-secondary">Total Customers</p>
          <p className="text-2xl font-bold text-minsah-dark">{stats.totalCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-minsah-accent">
          <p className="text-sm text-minsah-secondary">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-minsah-accent">
          <p className="text-sm text-minsah-secondary">Suspended</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.suspendedCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-minsah-accent">
          <p className="text-sm text-minsah-secondary">Total Revenue</p>
          <p className="text-2xl font-bold text-minsah-primary">
            {formatPrice(convertUSDtoBDT(stats.totalRevenue))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-minsah-accent mb-6 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-minsah-primary"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-minsah-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-minsah-primary"
          >
            <option value="createdAt">Join Date</option>
            <option value="lastLoginAt">Last Login</option>
            <option value="loyaltyPoints">Loyalty Points</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Bulk actions */}
      {selectedCustomers.length > 0 && hasPermission(PERMISSIONS.CUSTOMERS_EDIT) && (
        <div className="bg-minsah-accent border border-minsah-primary rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-minsah-dark">
            {selectedCustomers.length} customer(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                selectedCustomers.forEach(id => handleStatusUpdate(id, 'suspended'));
                setSelectedCustomers([]);
              }}
              className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => {
                selectedCustomers.forEach(id => handleStatusUpdate(id, 'active'));
                setSelectedCustomers([]);
              }}
              className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
            >
              Activate Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-minsah-accent overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-minsah-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 text-minsah-secondary">
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-minsah-accent border-b border-minsah-secondary/20">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === customers.length && customers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-minsah-dark">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-minsah-dark">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-minsah-dark">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-minsah-dark">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold text-minsah-dark">Total Spent</th>
                  <th className="px-4 py-3 text-right font-semibold text-minsah-dark">Points</th>
                  <th className="px-4 py-3 text-left font-semibold text-minsah-dark">Joined</th>
                  <th className="px-4 py-3 text-center font-semibold text-minsah-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-minsah-accent/30 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded"
                      />
                    </td>

                    {/* Customer Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-minsah-accent flex items-center justify-center text-minsah-primary font-bold text-sm flex-shrink-0">
                          {customer.avatar ? (
                            <img
                              src={customer.avatar}
                              alt={customer.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            customer.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-minsah-dark">{customer.name}</p>
                          {customer.address?.city && (
                            <p className="text-xs text-minsah-secondary">
                              {customer.address.city}, {customer.address.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-minsah-secondary">
                          <Mail size={12} />
                          <span className="text-xs truncate max-w-[160px]">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-minsah-secondary">
                            <Phone size={12} />
                            <span className="text-xs">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {hasPermission(PERMISSIONS.CUSTOMERS_EDIT) ? (
                        <select
                          value={customer.status}
                          onChange={(e) => handleStatusUpdate(customer.id, e.target.value)}
                          className={clsx(
                            'text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none',
                            getStatusColor(customer.status)
                          )}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      ) : (
                        <span className={clsx(
                          'text-xs px-2 py-1 rounded-full font-medium capitalize',
                          getStatusColor(customer.status)
                        )}>
                          {customer.status}
                        </span>
                      )}
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3 text-right font-medium text-minsah-dark">
                      {customer.totalOrders}
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-minsah-primary">
                        {formatPrice(convertUSDtoBDT(customer.totalSpent))}
                      </span>
                    </td>

                    {/* Loyalty Points */}
                    <td className="px-4 py-3 text-right text-minsah-secondary text-xs">
                      {customer.loyaltyPoints.toLocaleString()} pts
                    </td>

                    {/* Join Date */}
                    <td className="px-4 py-3 text-xs text-minsah-secondary">
                      {new Date(customer.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-minsah-accent rounded-lg transition"
                          title="View Profile"
                        >
                          <Eye size={15} className="text-minsah-secondary" />
                        </button>
                        {hasPermission(PERMISSIONS.CUSTOMERS_EDIT) && (
                          <button
                            className="p-1.5 hover:bg-minsah-accent rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={15} className="text-minsah-secondary" />
                          </button>
                        )}
                        <button
                          className="p-1.5 hover:bg-minsah-accent rounded-lg transition"
                          title="Orders"
                        >
                          <FileText size={15} className="text-minsah-secondary" />
                        </button>
                        {hasPermission(PERMISSIONS.CUSTOMERS_DELETE) && (
                          <button
                            className="p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-minsah-secondary">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} customers
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchCustomers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-minsah-accent transition"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = Math.max(1, pagination.page - 2) + i;
              if (p > pagination.totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => fetchCustomers(p)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-lg transition',
                    p === pagination.page
                      ? 'bg-minsah-primary text-white'
                      : 'border border-gray-200 hover:bg-minsah-accent'
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => fetchCustomers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-minsah-accent transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
