'use client';

import { useState, useEffect } from 'react';
import type { SearchConsoleData } from '@/types/google';
import { generateMockSearchConsoleData, GOOGLE_COLORS } from '@/types/google';
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';

interface SearchConsoleCardProps {
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  className?: string;
}

export default function SearchConsoleCard({
  dateRange = '28days',
  onDateRangeChange,
  className = ''
}: SearchConsoleCardProps) {
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectionUrl, setInspectionUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    loadSearchConsoleData();
  }, [dateRange]);

  const loadSearchConsoleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockSearchConsoleData();
      setData(mockData);
    } catch (err) {
      setError('Failed to load Search Console data');
      console.error('Error loading Search Console data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlInspection = async () => {
    if (!inspectionUrl.trim()) return;

    setIsInspecting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, this would trigger URL inspection
      console.log('Inspecting URL:', inspectionUrl);
      alert(`URL Inspection for: ${inspectionUrl}\nStatus: Indexed\nLast crawl: 2 days ago\nGoogle selected canonical: ${inspectionUrl}`);
    } catch (err) {
      console.error('Error inspecting URL:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const getChangeIndicator = (change?: number) => {
    if (!change) return null;

    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span>{Math.abs(change)}%</span>
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span>{Math.abs(change)}%</span>
        </span>
      );
    }

    return <span className="text-gray-500">0%</span>;
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

          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Search Console</h2>
              <p className="text-sm text-gray-600">Search performance and visibility</p>
            </div>
          </div>

          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="28days">Last 28 days</option>
            <option value="90days">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Clicks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.clicks.toLocaleString()}
            </div>
            {getChangeIndicator(data.topQueries[0]?.change)}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Impressions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.impressions.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">CTR</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.ctr.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">Avg Position</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.position.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* URL Inspection Tool */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">URL Inspection Tool</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={inspectionUrl}
                onChange={(e) => setInspectionUrl(e.target.value)}
                placeholder="Enter URL to inspect (e.g., https://minsah-beauty.com/products/lipstick)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={handleUrlInspection}
              disabled={!inspectionUrl.trim() || isInspecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isInspecting ? 'Inspecting...' : 'Inspect URL'}
            </button>
          </div>
        </div>

        {/* Top Queries */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Performing Queries</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topQueries.map((query, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{query.query}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{query.clicks.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{query.impressions.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{query.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{query.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pages */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Performing Pages</h3>
          <div className="space-y-2">
            {data.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                  <p className="text-xs text-gray-500 truncate">{page.url}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-gray-700 font-medium">{page.clicks.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-medium">{page.ctr.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Issues */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Coverage Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{data.coverageIssues.errors}</p>
              <p className="text-xs text-red-700">Pages with errors</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Warnings</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{data.coverageIssues.warnings}</p>
              <p className="text-xs text-yellow-700">Pages with warnings</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Valid</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{data.coverageIssues.valid.toLocaleString()}</p>
              <p className="text-xs text-green-700">Valid pages</p>
            </div>
          </div>

          {data.coverageIssues.errors > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Action Required:</strong> {data.coverageIssues.errors} pages have indexing errors that need to be fixed.
              </p>
              <button className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline">
                View Details →
              </button>
            </div>
          )}
        </div>

        {/* Core Web Vitals */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Largest Contentful Paint (LCP)</h4>
              <p className="text-lg font-bold text-gray-900">{data.coreWebVitals.lcp.toFixed(1)}s</p>
              <p className="text-xs text-gray-500">Mobile: {data.coreWebVitals.mobile.lcp.toFixed(1)}s</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">First Input Delay (FID)</h4>
              <p className="text-lg font-bold text-gray-900">{data.coreWebVitals.fid}ms</p>
              <p className="text-xs text-gray-500">Mobile: {data.coreWebVitals.mobile.fid}ms</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Cumulative Layout Shift (CLS)</h4>
              <p className="text-lg font-bold text-gray-900">{data.coreWebVitals.cls}</p>
              <p className="text-xs text-gray-500">Mobile: {data.coreWebVitals.mobile.cls}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
