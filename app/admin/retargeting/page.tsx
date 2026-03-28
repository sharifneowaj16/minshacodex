'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Target,
  Users,
  ShoppingCart,
  Eye,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Facebook,
  Instagram,
  Twitter,
  Search,
  Filter,
  Download,
} from 'lucide-react';

export default function RetargetingAudiencesPage() {
  const { hasPermission } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock retargeting audiences - Replace with real API data
  const audiences = [
    {
      id: '1',
      name: 'Cart Abandoners - Last 7 Days',
      description: 'Users who added items to cart but didn\'t purchase',
      platform: 'facebook',
      size: 3456,
      status: 'active',
      criteria: {
        events: ['AddToCart'],
        excludeEvents: ['Purchase'],
        timeWindow: 7,
      },
      performance: {
        impressions: 45678,
        clicks: 1234,
        conversions: 89,
        cost: 456.78,
        revenue: 2345.67,
        roas: 5.13,
      },
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20',
    },
    {
      id: '2',
      name: 'Product Viewers - No Cart',
      description: 'Viewed products but didn\'t add to cart in last 14 days',
      platform: 'google',
      size: 5678,
      status: 'active',
      criteria: {
        events: ['ViewContent'],
        excludeEvents: ['AddToCart'],
        timeWindow: 14,
      },
      performance: {
        impressions: 67890,
        clicks: 2345,
        conversions: 123,
        cost: 678.90,
        revenue: 3456.78,
        roas: 5.09,
      },
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-20',
    },
    {
      id: '3',
      name: 'Past Purchasers - 30 Days',
      description: 'Customers who purchased in last 30 days',
      platform: 'all',
      size: 1234,
      status: 'active',
      criteria: {
        events: ['Purchase'],
        timeWindow: 30,
      },
      performance: {
        impressions: 23456,
        clicks: 890,
        conversions: 67,
        cost: 345.67,
        revenue: 2234.56,
        roas: 6.47,
      },
      createdAt: '2024-01-05',
      lastUpdated: '2024-01-20',
    },
    {
      id: '4',
      name: 'High Intent Shoppers',
      description: '3+ sessions, 10+ page views in last 30 days',
      platform: 'tiktok',
      size: 2345,
      status: 'active',
      criteria: {
        minSessions: 3,
        minPageViews: 10,
        timeWindow: 30,
      },
      performance: {
        impressions: 34567,
        clicks: 1234,
        conversions: 78,
        cost: 567.89,
        revenue: 1876.54,
        roas: 3.30,
      },
      createdAt: '2024-01-12',
      lastUpdated: '2024-01-20',
    },
    {
      id: '5',
      name: 'Win-Back Customers',
      description: 'Last purchase over 90 days ago',
      platform: 'facebook',
      size: 987,
      status: 'paused',
      criteria: {
        events: ['Purchase'],
        daysSinceEvent: 90,
      },
      performance: {
        impressions: 12345,
        clicks: 456,
        conversions: 23,
        cost: 234.56,
        revenue: 1234.56,
        roas: 5.26,
      },
      createdAt: '2024-01-01',
      lastUpdated: '2024-01-18',
    },
  ];

  if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view retargeting audiences.</p>
      </div>
    );
  }

  const filteredAudiences = audiences.filter(audience => {
    const matchesSearch = audience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audience.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || audience.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || audience.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'google':
        return <Search className="w-4 h-4" />;
      case 'tiktok':
        return <Target className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'google':
        return 'bg-red-100 text-red-800';
      case 'tiktok':
        return 'bg-pink-100 text-pink-800';
      case 'instagram':
        return 'bg-purple-100 text-purple-800';
      case 'twitter':
        return 'bg-sky-100 text-sky-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAudienceSize = audiences.reduce((sum, aud) => sum + aud.size, 0);
  const activeAudiences = audiences.filter(aud => aud.status === 'active').length;
  const totalImpressions = audiences.reduce((sum, aud) => sum + aud.performance.impressions, 0);
  const avgROAS = audiences.reduce((sum, aud) => sum + aud.performance.roas, 0) / audiences.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retargeting Audiences</h1>
          <p className="text-gray-600">Build and manage custom audiences for retargeting campaigns</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-5 h-5 mr-2" />
          Create Audience
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audiences</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{audiences.length}</p>
              <p className="text-xs text-gray-600 mt-1">{activeAudiences} active</p>
            </div>
            <Target className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalAudienceSize.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">unique users</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+23.4% this month</p>
            </div>
            <Eye className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg ROAS</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{avgROAS.toFixed(2)}x</p>
              <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search audiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Audiences List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAudiences.map((audience) => (
                <tr key={audience.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{audience.name}</p>
                      <p className="text-xs text-gray-500">{audience.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(audience.platform)}`}>
                      {getPlatformIcon(audience.platform)}
                      <span className="ml-1 capitalize">{audience.platform}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{audience.size.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center text-gray-600">
                        <Eye className="w-3 h-3 mr-1" />
                        {audience.performance.impressions.toLocaleString()} impressions
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {audience.performance.conversions} conversions
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      audience.performance.roas >= 4 ? 'text-green-600' :
                      audience.performance.roas >= 2 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {audience.performance.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      audience.status === 'active' ? 'bg-green-100 text-green-800' :
                      audience.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {audience.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      {audience.status === 'active' ? (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAudiences.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No audiences found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterPlatform !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first retargeting audience to get started'}
          </p>
          {!searchQuery && filterPlatform === 'all' && filterStatus === 'all' && (
            <button className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Audience
            </button>
          )}
        </div>
      )}
    </div>
  );
}
