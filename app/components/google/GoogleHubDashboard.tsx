'use client';

import { useState, useEffect } from 'react';
import type { GoogleService } from '@/types/google';
import { generateMockGoogleServices, GOOGLE_SERVICE_CONFIGS, GOOGLE_COLORS } from '@/types/google';
import { formatPrice } from '@/utils/currency';
import IntegrationStatus from './IntegrationStatus';
import QuickActions from './QuickActions';
import {
  Home,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Eye,
  ThumbsUp,
  DollarSign,
  Search,
  ShoppingBag,
  BarChart,
  Banknote
} from 'lucide-react';

interface GoogleHubDashboardProps {
  className?: string;
}

export default function GoogleHubDashboard({ className = '' }: GoogleHubDashboardProps) {
  const [services, setServices] = useState<GoogleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date>(new Date());

  useEffect(() => {
    loadGoogleServices();
  }, []);

  const loadGoogleServices = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockServices = generateMockGoogleServices();
      setServices(mockServices);
      setLastGlobalSync(new Date());
    } catch (err) {
      setError('Failed to load Google services. Please try again.');
      console.error('Error loading Google services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectService = async (serviceId: string) => {
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      setServices(prev =>
        prev.map(service =>
          service.id === serviceId
            ? {
                ...service,
                connected: true,
                status: 'active',
                lastSync: new Date(),
                setupCompleted: true
              }
            : service
        )
      );

      console.log(`Connected to ${serviceId}`);
    } catch (err) {
      setError(`Failed to connect to ${serviceId}. Please try again.`);
      console.error('Error connecting service:', err);
    }
  };

  const handleDisconnectService = async (serviceId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setServices(prev =>
        prev.map(service =>
          service.id === serviceId
            ? {
                ...service,
                connected: false,
                status: 'inactive',
                errors: ['Service disconnected']
              }
            : service
        )
      );

      console.log(`Disconnected from ${serviceId}`);
    } catch (err) {
      setError(`Failed to disconnect from ${serviceId}. Please try again.`);
      console.error('Error disconnecting service:', err);
    }
  };

  const handleSyncService = async (serviceId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setServices(prev =>
        prev.map(service =>
          service.id === serviceId
            ? { ...service, lastSync: new Date() }
            : service
        )
      );

      console.log(`Synced ${serviceId}`);
    } catch (err) {
      setError(`Failed to sync ${serviceId}. Please try again.`);
      console.error('Error syncing service:', err);
    }
  };

  const handleSyncAll = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastGlobalSync(new Date());

      setServices(prev =>
        prev.map(service => ({
          ...service,
          lastSync: new Date()
        }))
      );

      console.log('All services synced successfully');
    } catch (err) {
      setError('Failed to sync all services. Please try again.');
      console.error('Error syncing all services:', err);
    }
  };

  const getStatusIcon = (status: GoogleService['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: GoogleService['status']) => {
    switch (status) {
      case 'active':
        return 'Connected';
      case 'warning':
        return 'Needs Attention';
      case 'error':
        return 'Error';
      default:
        return 'Not Connected';
    }
  };

  const getStatusColor = (status: GoogleService['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Quick stats from connected services
  const quickStats = {
    searchConsole: services.find(s => s.id === 'search-console'),
    merchantCenter: services.find(s => s.id === 'merchant-center'),
    analytics: services.find(s => s.id === 'analytics'),
    googleAds: services.find(s => s.id === 'google-ads')
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Services</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadGoogleServices}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Integration Hub</h1>
            <p className="text-gray-600">Manage all your Google services in one place</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last sync: {formatLastSync(lastGlobalSync)}</span>
            </div>

            <button
              onClick={handleSyncAll}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Sync All
            </button>

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats (Today)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Search Console */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOOGLE_COLORS.primary}20` }}>
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Search Console</p>
                  <p className="text-sm text-gray-600">GSC</p>
                </div>
              </div>
              {quickStats.searchConsole?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {quickStats.searchConsole?.connected && quickStats.searchConsole.metrics ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {quickStats.searchConsole.metrics.clicks.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Clicks</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">12.3%</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-2xl font-bold">-</div>
                <p className="text-sm">Clicks</p>
                <p className="text-xs text-gray-400 mt-2">Not connected</p>
              </div>
            )}
          </div>

          {/* Merchant Center */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOOGLE_COLORS.warning}20` }}>
                  <ShoppingBag className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Merchant Center</p>
                  <p className="text-sm text-gray-600">GMC</p>
                </div>
              </div>
              {quickStats.merchantCenter?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {quickStats.merchantCenter?.connected && quickStats.merchantCenter.metrics ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {quickStats.merchantCenter.metrics.totalProducts || 0}
                </div>
                <p className="text-sm text-gray-600">Products</p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {quickStats.merchantCenter.metrics.approvedProducts || 0} active
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-2xl font-bold">-</div>
                <p className="text-sm">Products</p>
                <p className="text-xs text-gray-400 mt-2">Not connected</p>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOOGLE_COLORS.orange}20` }}>
                  <BarChart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Analytics 4</p>
                  <p className="text-sm text-gray-600">GA4</p>
                </div>
              </div>
              {quickStats.analytics?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {quickStats.analytics?.connected && quickStats.analytics.metrics ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {quickStats.analytics.metrics.realTimeUsers || 0}
                </div>
                <p className="text-sm text-gray-600">Users Online</p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">Real-time</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-2xl font-bold">-</div>
                <p className="text-sm">Users</p>
                <p className="text-xs text-gray-400 mt-2">Not connected</p>
              </div>
            )}
          </div>

          {/* Google Ads */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOOGLE_COLORS.success}20` }}>
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Google Ads</p>
                  <p className="text-sm text-gray-600">Ads</p>
                </div>
              </div>
              {quickStats.googleAds?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {quickStats.googleAds?.connected && quickStats.googleAds.metrics ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(Number(quickStats.googleAds.metrics.totalSpend) || 0)}
                </div>
                <p className="text-sm text-gray-600">Spend</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    ROAS {quickStats.googleAds.metrics.avgROAS}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-2xl font-bold">-</div>
                <p className="text-sm">Spend</p>
                <p className="text-xs text-gray-400 mt-2">Not connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Integration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {services.map((service) => (
                  <IntegrationStatus
                    key={service.id}
                    service={service}
                    onConnect={() => handleConnectService(service.id)}
                    onDisconnect={() => handleDisconnectService(service.id)}
                    onSync={() => handleSyncService(service.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <QuickActions
              services={services}
              onConnectService={handleConnectService}
              onSyncAll={handleSyncAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
