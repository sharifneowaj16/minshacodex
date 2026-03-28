'use client';

import { useState, useEffect } from 'react';
import type { MerchantProduct } from '@/types/google';
import { generateMockMerchantProducts, GOOGLE_COLORS } from '@/types/google';
import { formatPrice } from '@/utils/currency';
import {
  ShoppingCart,
  Plus,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  BarChart,
  TrendingUp,
  Clock,
  FileText,
  Box,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

interface MerchantCenterCardProps {
  className?: string;
}

export default function MerchantCenterCard({ className = '' }: MerchantCenterCardProps) {
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchantProduct | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productStats, setProductStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    disapproved: 0,
    expiring: 0
  });

  useEffect(() => {
    loadMerchantProducts();
  }, []);

  const loadMerchantProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProducts = generateMockMerchantProducts();
      setProducts(mockProducts);

      // Calculate stats
      const stats = {
        total: mockProducts.length,
        approved: mockProducts.filter(p => p.status === 'approved').length,
        pending: mockProducts.filter(p => p.status === 'pending').length,
        disapproved: mockProducts.filter(p => p.status === 'disapproved').length,
        expiring: 0 // Would calculate based on listing expiry
      };
      setProductStats(stats);
    } catch (err) {
      setError('Failed to load Merchant Center data');
      console.error('Error loading Merchant Center data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: MerchantProduct['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'disapproved':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MerchantProduct['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'disapproved':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: MerchantProduct['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Under Review';
      case 'disapproved':
        return 'Disapproved';
      default:
        return 'Unknown';
    }
  };

  const handleBulkUpload = async () => {
    // Simulate bulk upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Uploading CSV:', file.name);
        // Handle actual upload logic here
        alert(`Uploading ${file.name}...`);
      }
    };
    input.click();
  };

  const handleSyncFeed = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Feed synced successfully');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProduct(null);
    }
  };

  const handleExportProducts = () => {
    // Create CSV export
    const headers = ['ID', 'Title', 'Price', 'Status', 'Category', 'Availability'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.price,
        p.status,
        p.category,
        p.availability
      ]).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>

          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Merchant Center</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                minsah-beauty.com <CheckCircle className="w-4 h-4 text-green-500" /> Verified
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncFeed}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <Box className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Feed
          </button>
        </div>

        {/* Product Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">Approved</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-900">{productStats.approved}</p>
            <p className="text-xs text-green-700">Products live</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-700 font-medium">Pending</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{productStats.pending}</p>
            <p className="text-xs text-yellow-700">Under review</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-700 font-medium">Disapproved</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-900">{productStats.disapproved}</p>
            <p className="text-xs text-red-700">Needs attention</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700 font-medium">Total</span>
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{productStats.total}</p>
            <p className="text-xs text-blue-700">All products</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>

          <button
            onClick={handleBulkUpload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>

          <button
            onClick={handleExportProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Free Listings Status */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Free Listings Status</h3>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Enabled</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clicks (30 days)</p>
              <p className="text-xl font-bold text-gray-900">2,345</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 12.3% vs last month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Impressions (30 days)</p>
              <p className="text-xl font-bold text-gray-900">45,678</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 8.7% vs last month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Click-through Rate</p>
              <p className="text-xl font-bold text-gray-900">5.1%</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 0.3% vs last month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Product Feed</h3>
          <div className="text-sm text-gray-600">
            {products.length} products total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(product.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </div>
                    {product.issues && product.issues.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-red-600">
                          {product.issues.length} issue{product.issues.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{formatPrice(product.price)}</p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.availability === 'in stock'
                        ? 'bg-green-100 text-green-800'
                        : product.availability === 'out of stock'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.availability === 'in stock' ? 'In Stock' :
                       product.availability === 'out of stock' ? 'Out of Stock' : 'Preorder'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(product.lastUpdated).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issues Alert */}
        {productStats.disapproved > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />{productStats.disapproved} product{productStats.disapproved > 1 ? 's' : ''} need attention
                </p>
                <p className="text-sm text-red-700 mt-1">
                  These products have been disapproved and need to be fixed before they can appear in free listings.
                </p>
                <button className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline">
                  Fix Issues <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedProduct(null)}></div>

            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div>
                    <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {selectedProduct.imageUrl ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {selectedProduct.additionalImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {selectedProduct.additionalImages.slice(0, 4).map((img, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={img}
                              alt={`${selectedProduct.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedProduct.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProduct.status)}`}>
                        {getStatusText(selectedProduct.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(selectedProduct.originalPrice)}
                            </span>
                            <span className="text-sm text-green-600 font-medium">
                              Save {formatPrice(selectedProduct.originalPrice - selectedProduct.price)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Brand</p>
                      <p className="font-medium text-gray-900">{selectedProduct.brand}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-medium text-gray-900">{selectedProduct.category}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Availability</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProduct.availability === 'in stock'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.availability === 'in stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Issues */}
                    {selectedProduct.issues && selectedProduct.issues.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-2">
                          Issues that need to be fixed:
                        </p>
                        <ul className="space-y-1">
                          {selectedProduct.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-700">
                              • {issue.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      <p>Created: {new Date(selectedProduct.createdDate).toLocaleDateString()}</p>
                      <p>Last updated: {new Date(selectedProduct.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteProduct(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
