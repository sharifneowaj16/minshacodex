'use client';

import { useState, useEffect } from 'react';
import type { GA4Metrics } from '@/types/google';
import { generateMockGA4Data, GOOGLE_COLORS } from '@/types/google';
import { formatPrice } from '@/utils/currency';
import {
  BarChart,
  User,
  Eye,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingDown,
  Smartphone,
  Monitor,
  Table,
  Globe,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Tag,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<GA4Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7days');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'acquisition' | 'engagement' | 'monetization' | 'audience'>('overview');
  const [realTimeData, setRealTimeData] = useState<{
    users: number;
    activePages: Array<{ path: string; title: string; users: number; }>;
    trafficSources: Array<{ source: string; medium: string; users: number; }>;
    conversions: Array<{ eventName: string; count: number; }>;
  } | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (data?.realTime) {
        setRealTimeData({
          users: Math.max(0, data.realTime.users + Math.floor(Math.random() * 5) - 2), // Simulate random changes but ensure non-negative
          activePages: data.realTime.activePages,
          trafficSources: data.realTime.trafficSources,
          conversions: data.realTime.conversions
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.realTime]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockGA4Data();
      setData(mockData);
      setRealTimeData(mockData.realTime);
    } catch (err) {
      setError('Failed to load Analytics data');
      console.error('Error loading Analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span>+{Math.abs(change).toFixed(1)}%</span>
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </span>
      );
    }
    return null;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Table className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google':
      case 'organic':
        return <Globe className="h-4 w-4" />;
      case 'facebook':
      case 'instagram':
      case 'social':
        return <User className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const exportReport = () => {
    // Simulate report export
    const reportData = {
      dateRange,
      generatedAt: new Date(),
      data: data
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange}.json`;
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

  if (!data) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Analytics 4</h2>
              <p className="text-sm text-gray-600">GA4-{data.topSources[0]?.source || 'unknown'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="28days">Last 28 days</option>
              <option value="90days">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>

            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          {(['overview', 'acquisition', 'engagement', 'monetization', 'audience'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Real-time Widget */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Real-time Users</h3>
              <p className="text-sm text-blue-700">Currently active on your site</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-blue-900">
                {realTimeData?.users || data.realTime.users}
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
              </div>
            </div>
          </div>

          {realTimeData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-blue-700 mb-2">Top Pages</p>
                <div className="space-y-1">
                  {realTimeData.activePages.slice(0, 3).map((page, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-gray-900 truncate">{page.title}</p>
                      <p className="text-xs text-gray-500">{page.users} users</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-blue-700 mb-2">Traffic Sources</p>
                <div className="space-y-1">
                  {realTimeData.trafficSources.slice(0, 3).map((source, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      {getSourceIcon(source.source)}
                      <span className="text-gray-900 truncate">{source.source}</span>
                      <span className="text-xs text-gray-500">{source.users}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-blue-700 mb-2">Conversions</p>
                <div className="space-y-1">
                  {realTimeData.conversions.slice(0, 3).map((conversion, index) => (
                    <div key={index} className="text-sm flex items-center justify-between">
                      <span className="text-gray-900">{conversion.eventName}</span>
                      <span className="text-xs text-green-600 font-medium">{conversion.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Users</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.users.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12.3% vs previous</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Page Views</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.pageviews.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+8.7% vs previous</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Conversions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions}</p>
                  <p className="text-sm text-purple-600">CR: {data.conversionRate.toFixed(1)}%</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(data.revenue)}</p>
                  <p className="text-sm text-green-600">AOV: {formatPrice(data.revenue / data.conversions)}</p>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Top Pages</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topPages.slice(0, 10).map((page, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                            <p className="text-xs text-gray-500">{page.path}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{page.pageviews.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{page.uniquePageviews.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{page.avgTimeOnPage.toFixed(0)}s</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{page.exitRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.topProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{product.itemName}</p>
                        <p className="text-xs text-gray-500">ID: {product.itemId}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'acquisition' && (
          <div className="space-y-6">
            {/* Traffic Sources Chart */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Traffic Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Traffic Breakdown</h4>
                  <div className="space-y-3">
                    {data.topSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(source.source)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {source.source} / {source.medium}
                            </p>
                            <p className="text-xs text-gray-500">{source.users.toLocaleString()} users ({source.percentage}%)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {source.revenue ? formatPrice(source.revenue) : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Placeholder for Pie Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Source Distribution</h4>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>Pie Chart Component</p>
                    <p className="text-xs">Install recharts library</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'engagement' && (
          <div className="space-y-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Engagement Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600">Engagement Rate</p>
                    <p className="text-xl font-bold text-gray-900">{data.engagementRate.toFixed(1)}%</p>
                    <p className="text-xs text-green-600">+2.3% vs previous period</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Session Duration</p>
                    <p className="text-xl font-bold text-gray-900">{Math.floor(data.avgSessionDuration / 60)}m {data.avgSessionDuration % 60}s</p>
                    <p className="text-xs text-green-600">+45s vs previous period</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pages per Session</p>
                    <p className="text-xl font-bold text-gray-900">{data.pagesPerSession.toFixed(1)}</p>
                    <p className="text-xs text-red-600">-0.2 vs previous period</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Bounce Rate</p>
                    <p className="text-xl font-bold text-gray-900">{data.bounceRate.toFixed(1)}%</p>
                    <p className="text-xs text-green-600">-5.2% vs previous period</p>
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Device Breakdown</h4>
                <div className="space-y-4">
                  {data.devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{device.device}</p>
                          <p className="text-xs text-gray-500">{device.sessions.toLocaleString()} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{device.bounceRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'monetization' && (
          <div className="space-y-6">
            {/* Revenue Overview */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Total Revenue</h4>
                  <p className="text-3xl font-bold text-gray-900">{formatPrice(data.revenue)}</p>
                  <p className="text-sm text-green-600">+23.4% vs previous period</p>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs text-green-700">
                      <strong>Average Order Value:</strong> {formatPrice(data.revenue / data.conversions)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Conversion Funnel</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sessions</span>
                      <span className="text-sm font-medium text-gray-900">{data.sessions.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(data.pageviews / data.sessions) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Page Views</span>
                      <span className="text-sm font-medium text-gray-900">{data.pageviews.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(data.engagementRate / 100) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversions</span>
                      <span className="text-sm font-medium text-gray-900">{data.conversions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Events */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Top Events</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.events.map((event, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{event.eventName}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{event.eventCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{event.conversionEvents}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {event.revenue ? formatPrice(event.revenue) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'audience' && (
          <div className="space-y-6">
            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age Groups */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Age Groups</h4>
                <div className="space-y-3">
                  {data.demographics.ageGroups.map((ageGroup, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{ageGroup.age}</span>
                        <span className="text-xs text-gray-500">({ageGroup.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${ageGroup.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Gender</h4>
                <div className="space-y-3">
                  {data.demographics.gender.map((gender, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">
                          {gender.gender.charAt(0).toUpperCase() + gender.gender.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">({gender.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${gender.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.locations.slice(0, 10).map((location, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{location.city}, {location.country}</p>
                            <p className="text-xs text-gray-500">{location.region}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{location.users.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{location.sessions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {location.revenue ? formatPrice(location.revenue) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
