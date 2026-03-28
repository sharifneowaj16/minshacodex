'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/currency';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  applicableTo: 'all' | 'specific_products' | 'specific_categories';
}

export default function CouponsPage() {
  const { hasPermission } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME10',
      description: 'Welcome discount for new customers',
      type: 'percentage',
      value: 10,
      minPurchase: 50,
      usageLimit: 100,
      usageCount: 45,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      applicableTo: 'all',
    },
    {
      id: '2',
      code: 'SAVE20',
      description: 'Save 20% on all skincare',
      type: 'percentage',
      value: 20,
      minPurchase: 100,
      maxDiscount: 50,
      usageLimit: 50,
      usageCount: 28,
      startDate: '2024-01-01',
      endDate: '2024-02-28',
      status: 'active',
      applicableTo: 'specific_categories',
    },
    {
      id: '3',
      code: 'FLAT500',
      description: 'Flat BDT 500 off on orders above BDT 2000',
      type: 'fixed',
      value: 500,
      minPurchase: 2000,
      usageLimit: 200,
      usageCount: 156,
      startDate: '2023-12-01',
      endDate: '2024-01-15',
      status: 'expired',
      applicableTo: 'all',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage coupons.</p>
      </div>
    );
  }

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(c => c.id !== couponId));
    }
  };

  const getStatusColor = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-600">Create and manage promotional discount codes</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.length}</p>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {coupons.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Coupons</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {coupons.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">{coupon.description}</p>
              </div>
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2',
                getStatusColor(coupon.status)
              )}>
                {coupon.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-gray-900 flex items-center">
                  {coupon.type === 'percentage' ? (
                    <>
                      <Percent className="w-4 h-4 mr-1" />
                      {coupon.value}% off
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatPrice(coupon.value)} off
                    </>
                  )}
                </span>
              </div>

              {coupon.minPurchase && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Purchase:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(coupon.minPurchase)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium text-gray-900">
                  {coupon.usageCount} / {coupon.usageLimit || 'Unlimited'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-medium text-gray-900">
                  {new Date(coupon.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {coupon.applicableTo === 'all' ? 'All Products' :
                 coupon.applicableTo === 'specific_products' ? 'Specific Products' :
                 'Specific Categories'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No coupons found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
