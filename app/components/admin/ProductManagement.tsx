'use client';

import { useState, useEffect } from 'react';
import type { AdminProduct, AdminCategory } from '@/types/admin';
import { generateMockProducts } from '@/types/admin';
import { formatPrice } from '@/utils/currency';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Grid3x3,
  Image,
  Tag,
  DollarSign,
  Archive,
  CheckCircle,
  X,
  ChevronDown,
  FileDown,
  PlusSquare
} from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockProducts = generateMockProducts();
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.id === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.inventory.quantity - b.inventory.quantity;
        case 'sales':
          return b.sales - a.sales;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkEdit = () => {
    setShowBulkActions(true);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedProducts.length} products?`)) {
      // Simulate API call
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      setShowBulkActions(false);
    }
  };

  const handleExportCSV = () => {
    // CSV export logic
    const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Sales', 'Status'];
    const csvData = filteredProducts.map(product => [
      product.id,
      product.name,
      product.sku,
      product.price.toString(),
      product.inventory.quantity.toString(),
      product.sales.toString(),
      product.status
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  };

  const getStockStatus = (product: AdminProduct) => {
    const { quantity, lowStockThreshold } = product.inventory;
    if (quantity === 0) return { color: 'text-red-600 bg-red-100', text: 'Out of Stock' };
    if (quantity <= lowStockThreshold) return { color: 'text-yellow-600 bg-yellow-100', text: 'Low Stock' };
    return { color: 'text-green-600 bg-green-100', text: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your beauty product inventory</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Products</span>
            <PlusSquare className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">In Stock</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {products.filter(p => p.inventory.quantity > 0).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {products.filter(p => p.inventory.quantity <= p.inventory.lowStockThreshold && p.inventory.quantity > 0).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Out of Stock</span>
            <X className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {products.filter(p => p.inventory.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="CAT-1">Skincare</option>
            <option value="CAT-2">Makeup</option>
            <option value="CAT-3">Hair Care</option>
            <option value="CAT-4">Body Care</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="sales">Sort by Sales</option>
            <option value="created">Sort by Date</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} products selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedProducts.length === filteredProducts.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Bulk Edit
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const isSelected = selectedProducts.includes(product.id);

          return viewMode === 'grid' ? (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectProduct(product.id)}
                  className="absolute top-2 left-2 z-10 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Image className="h-12 w-12 text-gray-400" />
                </div>
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.comparePrice && (
                      <p className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Stock:</span>
                    <span className="ml-1 font-medium">{product.inventory.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sales:</span>
                    <span className="ml-1 font-medium">{product.sales}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectProduct(product.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku} • {product.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-1 font-medium">{formatPrice(product.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <span className="ml-1 font-medium">{product.inventory.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sales:</span>
                      <span className="ml-1 font-medium">{product.sales}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{product.rating} ({product.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <PlusSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Products</h3>
            <p className="text-gray-600 mb-4">
              Upload a CSV file with your product data. Download the template below for the required format.
            </p>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2">
                <FileDown className="h-4 w-4" />
                Download CSV Template
              </button>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                <input type="file" accept=".csv" className="hidden" />
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Choose File
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkUpload(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Upload Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.sku}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (BDT ৳)</label>
                <input
                  type="number"
                  defaultValue={editingProduct?.price}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (BDT ৳)</label>
                <input
                  type="number"
                  defaultValue={editingProduct?.comparePrice}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Skincare</option>
                  <option>Makeup</option>
                  <option>Hair Care</option>
                  <option>Body Care</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  defaultValue={editingProduct?.inventory.quantity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  defaultValue={editingProduct?.inventory.lowStockThreshold}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  defaultValue={editingProduct?.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
