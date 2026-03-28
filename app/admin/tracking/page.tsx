'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Activity,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  MousePointer,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Facebook,
  Instagram,
  Mail,
  Search,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

export default function TrackingAnalyticsPage() {
  const { hasPermission } = useAdminAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data - Replace with real data from API
  const analytics = {
    realtime: {
      activeUsers: 45,
      pageViews: 234,
      events: 567,
      conversions: 12,
    },
    overview: {
      sessions: 12456,
      users: 8934,
      pageviews: 45678,
      bounceRate: 42.3,
      avgSessionDuration: 245, // seconds
      conversions: 456,
      conversionRate: 3.66,
      revenue: 145678,
      avgOrderValue: 319.43,
    },
    traffic: {
      sources: [
        { source: 'Google', sessions: 4567, users: 3456, conversions: 234, revenue: 78456, percentage: 36.7 },
        { source: 'Facebook', sessions: 3456, users: 2345, conversions: 156, revenue: 45678, percentage: 27.7 },
        { source: 'Direct', sessions: 2345, users: 1876, conversions: 45, revenue: 12345, percentage: 18.8 },
        { source: 'Instagram', sessions: 1234, users: 987, conversions: 12, revenue: 5678, percentage: 9.9 },
        { source: 'TikTok', sessions: 854, users: 654, conversions: 9, revenue: 3456, percentage: 6.9 },
      ],
      mediums: [
        { medium: 'organic', sessions: 5678, users: 4321, conversions: 267, revenue: 89456 },
        { medium: 'cpc', sessions: 3456, users: 2345, conversions: 134, revenue: 45678 },
        { medium: 'social', sessions: 2123, users: 1654, conversions: 45, revenue: 8901 },
        { medium: 'email', sessions: 1199, users: 1023, conversions: 10, revenue: 2543 },
      ],
      campaigns: [
        { campaign: 'summer-sale-2024', sessions: 2345, users: 1876, conversions: 156, revenue: 56789, cost: 12000, roas: 4.73 },
        { campaign: 'black-friday', sessions: 1876, users: 1456, conversions: 89, revenue: 34567, cost: 8000, roas: 4.32 },
        { campaign: 'new-arrivals', sessions: 1234, users: 987, conversions: 45, revenue: 15678, cost: 5000, roas: 3.14 },
      ],
    },
    devices: [
      { type: 'mobile', sessions: 6234, percentage: 50.1, conversions: 234, revenue: 67890 },
      { type: 'desktop', sessions: 4567, percentage: 36.7, conversions: 189, revenue: 56789 },
      { type: 'tablet', sessions: 1655, percentage: 13.3, conversions: 33, revenue: 20999 },
    ],
    topPages: [
      { page: '/shop', views: 12345, uniqueViews: 8901, avgTime: 234, exitRate: 34.5 },
      { page: '/', views: 9876, uniqueViews: 7654, avgTime: 123, exitRate: 45.6 },
      { page: '/products/luxury-foundation', views: 5678, uniqueViews: 4321, avgTime: 345, exitRate: 23.4 },
      { page: '/cart', views: 3456, uniqueViews: 2345, avgTime: 156, exitRate: 67.8 },
      { page: '/checkout', views: 2345, uniqueViews: 1876, avgTime: 289, exitRate: 45.6 },
    ],
    topProducts: [
      { id: '1', name: 'Luxury Foundation Pro', views: 5678, addToCarts: 456, purchases: 234, conversionRate: 4.12, revenue: 67890 },
      { id: '2', name: 'Organic Face Serum', views: 4567, addToCarts: 378, purchases: 189, conversionRate: 4.14, revenue: 56789 },
      { id: '3', name: 'Premium Perfume Set', views: 3456, addToCarts: 234, purchases: 123, conversionRate: 3.56, revenue: 45678 },
    ],
    funnel: [
      { step: 'Page View', users: 12456, dropoff: 0 },
      { step: 'Product View', users: 8934, dropoff: 28.3 },
      { step: 'Add to Cart', users: 2345, dropoff: 73.7 },
      { step: 'Checkout', users: 876, dropoff: 62.6 },
      { step: 'Purchase', users: 456, dropoff: 47.9 },
    ],
    platforms: {
      facebook: { enabled: true, events: 12345, conversions: 234, revenue: 67890, roas: 4.5 },
      google: { enabled: true, events: 15678, conversions: 345, revenue: 89012, roas: 5.2 },
      tiktok: { enabled: true, events: 5678, conversions: 89, revenue: 23456, roas: 3.8 },
      snapchat: { enabled: false, events: 0, conversions: 0, revenue: 0, roas: 0 },
      pinterest: { enabled: false, events: 0, conversions: 0, revenue: 0, roas: 0 },
    },
  };

  if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view tracking analytics.</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking & Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive tracking across all platforms</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <RefreshCw className={clsx('w-5 h-5 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Realtime Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Activity className="w-6 h-6 mr-2 animate-pulse" />
            Live Right Now
          </h2>
          <span className="text-sm opacity-90">Updates every 5 seconds</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90">Active Users</p>
            <p className="text-3xl font-bold">{analytics.realtime.activeUsers}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Page Views</p>
            <p className="text-3xl font-bold">{analytics.realtime.pageViews}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Events</p>
            <p className="text-3xl font-bold">{analytics.realtime.events}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Conversions</p>
            <p className="text-3xl font-bold">{analytics.realtime.conversions}</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(analytics.overview.revenue))}
              </p>
              <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {analytics.overview.conversions.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {analytics.overview.conversionRate}% conversion rate
              </p>
            </div>
            <ShoppingCart className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {analytics.overview.users.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {analytics.overview.sessions.toLocaleString()} sessions
              </p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(analytics.overview.avgOrderValue))}
              </p>
              <p className="text-xs text-green-600 mt-1">+8.3% vs last period</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Traffic Sources & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {analytics.traffic.sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.sessions.toLocaleString()} sessions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {source.conversions} conversions &bull; {formatPrice(convertUSDtoBDT(source.revenue))}
                    </span>
                    <span className="text-xs font-medium text-gray-600">{source.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Campaigns</h3>
          <div className="space-y-4">
            {analytics.traffic.campaigns.map((campaign, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{campaign.campaign}</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    ROAS: {campaign.roas.toFixed(2)}x
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-medium text-gray-900">{formatPrice(convertUSDtoBDT(campaign.revenue))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversions</p>
                    <p className="font-medium text-gray-900">{campaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cost</p>
                    <p className="font-medium text-gray-900">{formatPrice(convertUSDtoBDT(campaign.cost))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices & Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {analytics.devices.map((device, index) => {
              const Icon = device.type === 'mobile' ? Smartphone : device.type === 'desktop' ? Monitor : Tablet;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{device.type}</p>
                      <p className="text-xs text-gray-500">
                        {device.conversions} conversions &bull; {formatPrice(convertUSDtoBDT(device.revenue))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{device.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{device.sessions.toLocaleString()} sessions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {Object.entries(analytics.platforms).map(([platform, data]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'w-3 h-3 rounded-full',
                    data.enabled ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
                </div>
                {data.enabled ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(convertUSDtoBDT(data.revenue))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.conversions} conv &bull; {data.roas.toFixed(1)}x ROAS
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Not configured</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-2">
          {analytics.funnel.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{step.step}</span>
                <span className="text-sm text-gray-600">{step.users.toLocaleString()} users</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-8 rounded-full flex items-center justify-end pr-3"
                  style={{ width: `${(step.users / analytics.funnel[0].users) * 100}%` }}
                >
                  {step.dropoff > 0 && (
                    <span className="text-xs font-medium text-white">
                      -{step.dropoff.toFixed(1)}% dropoff
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products & Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="text-sm font-bold text-purple-600">
                    {formatPrice(convertUSDtoBDT(product.revenue))}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-500">Views</p>
                    <p className="font-medium">{product.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Add to Cart</p>
                    <p className="font-medium">{product.addToCarts}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Purchases</p>
                    <p className="font-medium">{product.purchases}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conv Rate</p>
                    <p className="font-medium">{product.conversionRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {analytics.topPages.map((page, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{page.page}</span>
                  <span className="text-sm text-gray-600">{page.views.toLocaleString()} views</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-500">Unique Views</p>
                    <p className="font-medium">{page.uniqueViews.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Time</p>
                    <p className="font-medium">{page.avgTime}s</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Exit Rate</p>
                    <p className="font-medium">{page.exitRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
