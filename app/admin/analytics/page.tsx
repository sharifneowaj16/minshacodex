'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  BarChart,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RefreshCw,
  Filter,
  Calendar,
  Minus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/currency';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    chartData: Array<{ date: string; value: number }>;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
    chartData: Array<{ date: string; value: number }>;
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
    chartData: Array<{ date: string; value: number }>;
  };
  conversionRate: {
    current: number;
    previous: number;
    growth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  topCategories: Array<{
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  customerAnalytics: {
    new: number;
    returning: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
  };
  salesByRegion: Array<{
    region: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
}

const dateRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

export default function AnalyticsPage() {
  const { hasPermission } = useAdminAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: {
      current: 45678,
      previous: 38945,
      growth: 17.3,
      chartData: [],
    },
    orders: {
      current: 523,
      previous: 445,
      growth: 17.5,
      chartData: [],
    },
    customers: {
      current: 89,
      previous: 76,
      growth: 17.1,
      chartData: [],
    },
    conversionRate: {
      current: 3.2,
      previous: 2.8,
      growth: 14.3,
    },
    topProducts: [
      { id: '1', name: 'Luxury Foundation Pro', sales: 145, revenue: 6668.55, growth: 12.5 },
      { id: '2', name: 'Organic Face Serum', sales: 98, revenue: 8819.02, growth: 8.3 },
      { id: '3', name: 'Premium Perfume Set', sales: 76, revenue: 11931.24, growth: 25.6 },
      { id: '4', name: 'Hair Care Bundle', sales: 62, revenue: 4215.38, growth: -5.2 },
      { id: '5', name: 'Professional Nail Kit', sales: 45, revenue: 1574.55, growth: 18.9 },
    ],
    topCategories: [
      { name: 'Skin care', sales: 234, revenue: 45678, percentage: 35.2 },
      { name: 'Make Up', sales: 189, revenue: 34567, percentage: 28.5 },
      { name: 'Perfume', sales: 145, revenue: 28934, percentage: 21.8 },
      { name: 'Hair care', sales: 98, revenue: 12456, percentage: 14.5 },
    ],
    customerAnalytics: {
      new: 89,
      returning: 434,
      averageOrderValue: 87.34,
      customerLifetimeValue: 456.78,
    },
    salesByRegion: [
      { region: 'New York', sales: 156, revenue: 28934, percentage: 22.3 },
      { region: 'California', sales: 134, revenue: 24567, percentage: 19.1 },
      { region: 'Texas', sales: 98, revenue: 17890, percentage: 13.8 },
      { region: 'Florida', sales: 87, revenue: 15432, percentage: 11.9 },
      { region: 'Other', sales: 156, revenue: 27865, percentage: 32.9 },
    ],
  });

  if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view analytics.</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const generateChartData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 2000) + 500,
      });
    }

    return data;
  };

  useEffect(() => {
    setAnalyticsData(prev => ({
      ...prev,
      revenue: { ...prev.revenue, chartData: generateChartData() },
      orders: { ...prev.orders, chartData: generateChartData() },
      customers: { ...prev.customers, chartData: generateChartData() },
    }));
  }, [dateRange]);

  const MetricCard = ({
  title,
  value,
  previous,
  growth,
  icon: Icon,
  color,
  format = 'number'
}: {
  title: string;
  value: string | number;
  previous?: number;
  growth: number;
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'currency' | 'percentage';
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {format === 'currency' && typeof value === 'number' ? formatPrice(value) : typeof value === 'number' ? value.toLocaleString() : value}
            {format === 'percentage' && '%'}
          </p>
          <div className="flex items-center mt-2">
            {growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <BarChart className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={clsx(
              'text-sm font-medium',
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SimpleLineChart = ({ data, height = 200 }: {
  data: Array<{ date: string; value: number }>;
  height?: number;
}) => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polyline
            fill="none"
            stroke="rgb(147, 51, 234)"
            strokeWidth="2"
            points={points}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#gradient)"
            points={`0,100 ${points} 100,100`}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-5 h-5 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue"
          value={analyticsData.revenue.current}
          growth={analyticsData.revenue.growth}
          icon={DollarSign}
          color="bg-green-500"
          format="currency"
        />
        <MetricCard
          title="Orders"
          value={analyticsData.orders.current}
          growth={analyticsData.orders.growth}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <MetricCard
          title="Customers"
          value={analyticsData.customers.current}
          growth={analyticsData.customers.growth}
          icon={Users}
          color="bg-purple-500"
        />
        <MetricCard
          title="Conversion Rate"
          value={analyticsData.conversionRate.current}
          growth={analyticsData.conversionRate.growth}
          icon={TrendingUp}
          color="bg-orange-500"
          format="percentage"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <SimpleLineChart data={analyticsData.revenue.chartData} />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Period Total</span>
            <span className="font-semibold text-gray-900">
              {formatPrice(analyticsData.revenue.current)}
            </span>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <SimpleLineChart data={analyticsData.orders.chartData} />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Period Total</span>
            <span className="font-semibold text-gray-900">
              {analyticsData.orders.current.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{product.sales} sold</span>
                    <Minus className="w-3 h-3 text-gray-400 rotate-90" />
                    <span className="text-xs text-gray-900">{formatPrice(product.revenue)}</span>
                  </div>
                </div>
                <div className={clsx(
                  'text-xs font-medium',
                  product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {product.growth >= 0 ? '+' : ''}{product.growth}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories by Revenue</h3>
          <div className="space-y-3">
            {analyticsData.topCategories.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-600">{formatPrice(category.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{category.sales} sales</span>
                  <span className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">New Customers</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.customerAnalytics.new}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Returning Customers</span>
                <span className="text-sm font-semibold text-gray-900">{analyticsData.customerAnalytics.returning}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(analyticsData.customerAnalytics.averageOrderValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(analyticsData.customerAnalytics.customerLifetimeValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Region */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.salesByRegion.map((region, index) => (
            <div key={region.region} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{region.region}</span>
                <span className="text-xs text-gray-500">{region.percentage.toFixed(1)}%</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{formatPrice(region.revenue)}</div>
              <div className="text-xs text-gray-600">{region.sales} orders</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
