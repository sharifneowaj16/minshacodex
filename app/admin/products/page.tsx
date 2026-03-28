'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/currency';

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  createdAt: string;
  featured: boolean;
}

interface ProductFilters {
  search: string;
  category: string;
  status: string;
  sortBy: string;
}

const categories = [
  'All Categories',
  'Make Up',
  'SPA',
  'Perfume',
  'Nails',
  'Skin care',
  'Hair care',
  'Combo',
];

const sortOptions = [
  { value: 'name',       label: 'Name' },
  { value: 'price_low',  label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'stock',      label: 'Stock Level' },
  { value: 'created',    label: 'Date Created' },
  { value: 'rating',     label: 'Rating' },
];

export default function ProductsPage() {
  const { hasPermission } = useAdminAuth();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search:   '',
    category: 'All Categories',
    status:   '',
    sortBy:   'created',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ activeOnly: 'false', limit: '100' });
      if (filters.category && filters.category !== 'All Categories') {
        params.set('category', filters.category);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  if (!hasPermission(PERMISSIONS.PRODUCTS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don&apos;t have permission to view products.</p>
      </div>
    );
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === 'All Categories' || product.category === filters.category;
      const matchesStatus = !filters.status || product.status === filters.status;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':       return a.name.localeCompare(b.name);
        case 'price_low':  return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'stock':      return b.stock - a.stock;
        case 'rating':     return b.rating - a.rating;
        case 'created':
        default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? filteredProducts.map((p) => p.id) : []);
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(checked
      ? [...selectedProducts, productId]
      : selectedProducts.filter((id) => id !== productId)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;
    for (const productId of selectedProducts) {
      await handleDeleteProduct(productId);
    }
    setSelectedProducts([]);
  };

  const getStatusColor = (status: ApiProduct['status']) => {
    switch (status) {
      case 'active':       return 'bg-green-100 text-green-800';
      case 'inactive':     return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default:             return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0)  return 'text-red-600';
    if (stock < 20)   return 'text-yellow-600';
    return 'text-green-600';
  };

  // Use slug for URL if available, fallback to id
  const productUrlKey = (product: ApiProduct) => product.slug || product.id;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
          <Link
            href="/admin/products/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {showFilters && <Layers className="w-4 h-4 ml-2 text-purple-600" />}
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              <button onClick={() => setSelectedProducts([])} className="text-blue-600 hover:text-blue-800">
                Clear selection
              </button>
              {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                            {product.featured && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{product.slug || product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                        {product.originalPrice != null && product.originalPrice > product.price && (
                          <span className="ml-2 text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                      {product.originalPrice != null && product.originalPrice > product.price && (
                        <div className="text-xs text-green-600">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx('text-sm font-medium', getStockColor(product.stock))}>
                        {product.stock} units
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(product.status))}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-900">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* View — slug-based */}
                        <Link
                          href={`/admin/products/${productUrlKey(product)}`}
                          className="text-purple-600 hover:text-purple-800"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {/* Edit — slug-based */}
                        {hasPermission(PERMISSIONS.PRODUCTS_EDIT) && (
                          <Link
                            href={`/admin/products/${productUrlKey(product)}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {/* Delete */}
                        {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                handleDeleteProduct(product.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
