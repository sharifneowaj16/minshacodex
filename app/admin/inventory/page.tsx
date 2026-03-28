'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  AlertTriangle,
  TrendingDown,
  Package,
  PackageX,
  Plus,
  Minus,
  Edit,
  BarChart,
  Download,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  isActive: boolean;
  updatedAt: string;
}

interface InventoryStats {
  totalValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface AdjustModalState {
  item: InventoryItem | null;
  action: 'add' | 'remove' | 'set' | 'reorder' | null;
  amount: string;
}

export default function InventoryPage() {
  const { hasPermission } = useAdminAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalValue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('stock');

  const [modal, setModal] = useState<AdjustModalState>({
    item: null,
    action: null,
    amount: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      params.set('sort', sortBy);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventory(data.inventory);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, statusFilter, categoryFilter, sortBy]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustStock = async () => {
    if (!modal.item || !modal.action) return;
    setSaving(true);
    setSaveError(null);

    try {
      const body: Record<string, string | number> = {};
      if (modal.action === 'reorder') {
        body.reorderLevel = parseInt(modal.amount);
      } else {
        body.action = modal.action;
        if (modal.action === 'set') {
          body.quantity = parseInt(modal.amount);
        } else {
          body.amount = parseInt(modal.amount);
        }
      }

      const res = await fetch(`/api/inventory/${modal.item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update stock');
      }

      const updated = await res.json();

      // Update local state immediately without full refetch
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id !== modal.item!.id) return item;
          const newStock =
            modal.action === 'reorder' ? item.currentStock : updated.currentStock;
          const newReorder =
            modal.action === 'reorder' ? updated.reorderLevel : item.reorderLevel;
          const newStatus =
            newStock === 0
              ? 'out_of_stock'
              : newStock <= newReorder
              ? 'low_stock'
              : newStock > newReorder * 10
              ? 'overstocked'
              : 'in_stock';
          const newValue = newStock * item.unitPrice;
          return {
            ...item,
            currentStock: newStock,
            reorderLevel: newReorder,
            totalValue: newValue,
            status: newStatus as InventoryItem['status'],
            maxStock: Math.max(newReorder * 10, newStock),
          };
        })
      );

      // Recalculate stats
      setStats((prev) => {
        const updatedInventory = inventory.map((item) => {
          if (item.id !== modal.item!.id) return item;
          const newStock =
            modal.action === 'reorder' ? item.currentStock : updated.currentStock;
          const newReorder =
            modal.action === 'reorder' ? updated.reorderLevel : item.reorderLevel;
          const newStatus =
            newStock === 0
              ? 'out_of_stock'
              : newStock <= newReorder
              ? 'low_stock'
              : newStock > newReorder * 10
              ? 'overstocked'
              : 'in_stock';
          return { ...item, currentStock: newStock, reorderLevel: newReorder, status: newStatus as InventoryItem['status'], totalValue: newStock * item.unitPrice };
        });
        return {
          ...prev,
          totalValue: updatedInventory.reduce((s, i) => s + i.totalValue, 0),
          lowStockCount: updatedInventory.filter((i) => i.status === 'low_stock').length,
          outOfStockCount: updatedInventory.filter((i) => i.status === 'out_of_stock').length,
        };
      });

      setModal({ item: null, action: null, amount: '' });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Stock', 'Reorder Level', 'Unit Price (BDT)', 'Total Value (BDT)', 'Status'];
    const rows = inventory.map((item) => [
      item.productName,
      item.sku,
      item.category,
      item.currentStock,
      item.reorderLevel,
      Math.round(convertUSDtoBDT(item.unitPrice)),
      Math.round(convertUSDtoBDT(item.totalValue)),
      item.status.replace('_', ' '),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockPercentage = (item: InventoryItem) =>
    item.maxStock > 0 ? Math.min((item.currentStock / item.maxStock) * 100, 100) : 0;

  const getModalTitle = () => {
    switch (modal.action) {
      case 'add': return `Add Stock — ${modal.item?.productName}`;
      case 'remove': return `Remove Stock — ${modal.item?.productName}`;
      case 'set': return `Set Stock — ${modal.item?.productName}`;
      case 'reorder': return `Set Reorder Level — ${modal.item?.productName}`;
      default: return '';
    }
  };

  if (!hasPermission(PERMISSIONS.PRODUCTS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don&apos;t have permission to view inventory.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Real-time stock levels from database</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={loading || inventory.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => fetchInventory(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-5 h-5 mr-2', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? '...' : formatPrice(convertUSDtoBDT(stats.totalValue))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {loading ? '...' : stats.lowStockCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {loading ? '...' : stats.outOfStockCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <PackageX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
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
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Make Up">Make Up</option>
            <option value="Skin care">Skin care</option>
            <option value="Hair care">Hair care</option>
            <option value="Perfume">Perfume</option>
            <option value="Nails">Nails</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="stock">Stock Level</option>
            <option value="value">Total Value</option>
            <option value="name">Name</option>
            <option value="lowStock">Low Stock Priority</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => fetchInventory()} className="ml-auto text-red-600 hover:text-red-800 underline text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.currentStock} / {item.maxStock}
                          </span>
                          {item.status === 'low_stock' && (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={clsx(
                              'h-2 rounded-full',
                              item.status === 'out_of_stock' ? 'bg-red-500' :
                              item.status === 'low_stock' ? 'bg-yellow-500' :
                              item.status === 'overstocked' ? 'bg-blue-500' :
                              'bg-green-500'
                            )}
                            style={{ width: `${getStockPercentage(item)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Reorder at: {item.reorderLevel}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatPrice(convertUSDtoBDT(item.unitPrice))}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(convertUSDtoBDT(item.totalValue))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(item.status)
                      )}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setModal({ item, action: 'add', amount: '' })}
                          className="text-green-600 hover:text-green-800"
                          title="Add Stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModal({ item, action: 'remove', amount: '' })}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Stock"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModal({ item, action: 'set', amount: String(item.currentStock) })}
                          className="text-blue-600 hover:text-blue-800"
                          title="Set Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && inventory.length === 0 && !error && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {modal.item && modal.action && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h3>
              <button
                onClick={() => { setModal({ item: null, action: null, amount: '' }); setSaveError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Current Stock</div>
                <div className="text-2xl font-bold text-gray-900">{modal.item.currentStock}</div>
                <div className="text-xs text-gray-500">Reorder level: {modal.item.reorderLevel}</div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modal.action === 'add' && 'Quantity to add'}
                {modal.action === 'remove' && 'Quantity to remove'}
                {modal.action === 'set' && 'New stock quantity'}
                {modal.action === 'reorder' && 'New reorder level'}
              </label>
              <input
                type="number"
                min="0"
                value={modal.amount}
                onChange={(e) => setModal((prev) => ({ ...prev, amount: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAdjustStock()}
                placeholder="Enter quantity..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                autoFocus
              />

              {modal.action !== 'reorder' && modal.amount && !isNaN(parseInt(modal.amount)) && (
                <div className="mt-2 text-sm text-gray-600">
                  {modal.action === 'add' && (
                    <span>New stock: <strong>{modal.item.currentStock + parseInt(modal.amount)}</strong></span>
                  )}
                  {modal.action === 'remove' && (
                    <span>New stock: <strong>{Math.max(0, modal.item.currentStock - parseInt(modal.amount))}</strong></span>
                  )}
                  {modal.action === 'set' && (
                    <span>Setting stock to: <strong>{parseInt(modal.amount)}</strong></span>
                  )}
                </div>
              )}

              {saveError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => { setModal({ item: null, action: null, amount: '' }); setSaveError(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={saving || !modal.amount || isNaN(parseInt(modal.amount))}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
