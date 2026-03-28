'use client';

import { useState, useEffect } from 'react';
import GoogleHubDashboard from '@/app/components/google/GoogleHubDashboard';
import SearchConsoleCard from '@/app/components/google/SearchConsoleCard';
import MerchantCenterCard from '@/app/components/google/MerchantCenterCard';
import GoogleAdsManager from '@/app/components/google/GoogleAdsManager';
import AnalyticsDashboard from '@/app/components/google/AnalyticsDashboard';
import BusinessProfileCard from '@/app/components/google/BusinessProfileCard';
import TagManagerCard from '@/app/components/google/TagManagerCard';
import RemarketingCard from '@/app/components/google/RemarketingCard';
import {
  BarChart,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Globe,
  ShoppingCart,
  DollarSign,
  Users,
  MapPin,
  Tag,
  RefreshCw,
  FileText,
  Settings,
  Bell,
  Plus,
  Eye,
  Trash2,
  Edit,
  X,
  Store,
  Speaker,
  BarChart3,
  Share
} from 'lucide-react';

interface GoogleService {
  id: string;
  name: string;
  platform: string;
  icon: React.ComponentType<any> | string;
  connected: boolean;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error' | 'warning';
  metrics?: {
    traffic?: number;
    conversions?: number;
    revenue?: number;
    clicks?: number;
    impressions?: number;
  };
  error?: string;
  warning?: string;
}

export default function GoogleServicesIntegration() {
  const [googleServices, setGoogleServices] = useState<GoogleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'merchant' | 'ads' | 'analytics' | 'business' | 'tagmanager' | 'remarketing'>('overview');
  const [dateRange, setDateRange] = useState('28days');
  const [selectedService, setSelectedService] = useState<GoogleService | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    loadGoogleServices();
  }, []);

  const loadGoogleServices = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockServices = generateMockGoogleServices();
      setGoogleServices(mockServices);
    } catch (error) {
      console.error('Error loading Google services:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockGoogleServices = (): GoogleService[] => {
    return [
      {
        id: 'search-console',
        name: 'Google Search Console',
        platform: 'search',
        icon: '🔍',
        connected: true,
        lastSync: new Date(),
        status: 'active',
        metrics: {
          traffic: 45678,
          clicks: 2345,
          impressions: 156789,
        },
      },
      {
        id: 'merchant-center',
        name: 'Google Merchant Center',
        platform: 'merchant',
        icon: Store,
        connected: true,
        lastSync: new Date(),
        status: 'active',
        metrics: {
          clicks: 567,
          impressions: 23456,
          revenue: 12345.67,
        },
      },
      {
        id: 'google-ads',
        name: 'Google Ads',
        platform: 'ads',
        icon: Speaker,
        connected: true,
        lastSync: new Date(),
        status: 'active',
        metrics: {
          clicks: 3456,
          impressions: 234567,
          conversions: 123,
          revenue: 23456.78,
        },
      },
      {
        id: 'analytics',
        name: 'Google Analytics 4',
        platform: 'analytics',
        icon: BarChart3,
        connected: true,
        lastSync: new Date(),
        status: 'active',
        metrics: {
          traffic: 67890,
          conversions: 234,
          revenue: 34567.89,
        },
      },
      {
        id: 'business-profile',
        name: 'Google Business Profile',
        platform: 'business',
        icon: MapPin,
        connected: true,
        lastSync: new Date(),
        status: 'warning',
        warning: '3 reviews need response',
        metrics: {
          traffic: 12345,
          clicks: 234,
        },
      },
      {
        id: 'tag-manager',
        name: 'Google Tag Manager',
        platform: 'tagmanager',
        icon: Tag,
        connected: true,
        lastSync: new Date(),
        status: 'active',
      },
      {
        id: 'remarketing',
        name: 'Google Remarketing',
        platform: 'remarketing',
        icon: Share,
        connected: true,
        lastSync: new Date(),
        status: 'active',
        metrics: {
          clicks: 1234,
          conversions: 45,
          revenue: 8901.23,
        },
      },
    ];
  };

  const handleServiceSync = async (serviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoogleServices(prev => prev.map(service =>
        service.id === serviceId
          ? { ...service, lastSync: new Date(), status: 'active', error: undefined }
          : service
      ));
      alert('Service synced successfully!');
    } catch (error) {
      console.error('Error syncing service:', error);
      setGoogleServices(prev => prev.map(service =>
        service.id === serviceId
          ? { ...service, status: 'error', error: 'Failed to sync service' }
          : service
      ));
    }
  };

  const handleServiceDisconnect = async (serviceId: string) => {
    if (confirm('Are you sure you want to disconnect this Google service?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGoogleServices(prev => prev.map(service =>
          service.id === serviceId
            ? { ...service, connected: false, status: 'inactive', metrics: undefined }
            : service
        ));
        alert('Service disconnected successfully!');
      } catch (error) {
        console.error('Error disconnecting service:', error);
      }
    }
  };

  const handleServiceReconnect = async (serviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoogleServices(prev => prev.map(service =>
        service.id === serviceId
          ? { ...service, connected: true, status: 'active', lastSync: new Date(), error: undefined }
          : service
      ));
      alert('Service reconnected successfully!');
    } catch (error) {
      console.error('Error reconnecting service:', error);
    }
  };

  const getOverallStatus = () => {
    const connectedServices = googleServices.filter(s => s.connected).length;
    const activeServices = googleServices.filter(s => s.status === 'active').length;
    const errorServices = googleServices.filter(s => s.status === 'error').length;
    const warningServices = googleServices.filter(s => s.status === 'warning').length;

    return {
      connected: connectedServices,
      active: activeServices,
      errors: errorServices,
      warnings: warningServices,
      total: googleServices.length,
    };
  };

  const getTotalMetrics = () => {
    return {
      traffic: googleServices.reduce((sum, s) => sum + (s.metrics?.traffic || 0), 0),
      clicks: googleServices.reduce((sum, s) => sum + (s.metrics?.clicks || 0), 0),
      conversions: googleServices.reduce((sum, s) => sum + (s.metrics?.conversions || 0), 0),
      revenue: googleServices.reduce((sum, s) => sum + (s.metrics?.revenue || 0), 0),
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function to render icons (both string emojis and React components)
  const renderIcon = (icon: React.ComponentType<any> | string, className: string = "h-6 w-6") => {
    if (typeof icon === 'string') {
      return <span className="text-2xl">{icon}</span>;
    } else {
      const IconComponent = icon as React.ComponentType<any>;
      return <IconComponent className={className} />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();
  const totalMetrics = getTotalMetrics();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Services Integration</h1>
          <p className="text-gray-600">Manage and monitor all Google marketing services</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'search', name: 'Search Console', icon: Globe },
            { id: 'merchant', name: 'Merchant Center', icon: ShoppingCart },
            { id: 'ads', name: 'Google Ads', icon: DollarSign },
            { id: 'analytics', name: 'Analytics', icon: Users },
            { id: 'business', name: 'Business Profile', icon: MapPin },
            { id: 'tagmanager', name: 'Tag Manager', icon: Tag },
            { id: 'remarketing', name: 'Remarketing', icon: RefreshCw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">Connected Services</span>
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{overallStatus.connected}/{overallStatus.total}</p>
              <p className="text-blue-100 text-xs mt-1">Active connections</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Total Traffic</span>
                <Globe className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalMetrics.traffic)}</p>
              <p className="text-green-100 text-xs mt-1">Visitors this period</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Total Conversions</span>
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{totalMetrics.conversions}</p>
              <p className="text-purple-100 text-xs mt-1">Conversions tracked</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100 text-sm font-medium">Total Revenue</span>
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalMetrics.revenue)}</p>
              <p className="text-orange-100 text-xs mt-1">From Google services</p>
            </div>
          </div>

          {/* Services Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Google Services Status</h3>
              <div className="flex items-center gap-2">
                {overallStatus.errors > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {overallStatus.errors} errors
                  </span>
                )}
                {overallStatus.warnings > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {overallStatus.warnings} warnings
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleServices.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderIcon(service.icon)}
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-500">{service.platform}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>

                  {service.metrics && (
                    <div className="space-y-1 mb-3 text-sm">
                      {service.metrics.traffic && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Traffic:</span>
                          <span className="font-medium">{formatNumber(service.metrics.traffic)}</span>
                        </div>
                      )}
                      {service.metrics.clicks && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clicks:</span>
                          <span className="font-medium">{formatNumber(service.metrics.clicks)}</span>
                        </div>
                      )}
                      {service.metrics.conversions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversions:</span>
                          <span className="font-medium">{service.metrics.conversions}</span>
                        </div>
                      )}
                      {service.metrics.revenue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">{formatCurrency(service.metrics.revenue)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {service.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                      <p className="text-xs text-red-700">{service.error}</p>
                    </div>
                  )}

                  {service.warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                      <p className="text-xs text-yellow-700">{service.warning}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Last sync: {service.lastSync ? new Date(service.lastSync).toLocaleString() : 'Never'}</span>
                    <span className={service.connected ? 'text-green-600' : 'text-gray-400'}>
                      {service.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleServiceSync(service.id)}
                      disabled={!service.connected}
                      className="flex-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowServiceModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Sync All Services</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-8 w-8 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Generate Report</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="h-8 w-8 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Setup Alerts</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="h-8 w-8 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Add New Service</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Service Tabs */}
      {activeTab === 'search' && <SearchConsoleCard dateRange={dateRange} onDateRangeChange={setDateRange} />}
      {activeTab === 'merchant' && <MerchantCenterCard />}
      {activeTab === 'ads' && <GoogleAdsManager />}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'business' && <BusinessProfileCard dateRange={dateRange} onDateRangeChange={setDateRange} />}
      {activeTab === 'tagmanager' && <TagManagerCard dateRange={dateRange} onDateRangeChange={setDateRange} />}
      {activeTab === 'remarketing' && <RemarketingCard dateRange={dateRange} onDateRangeChange={setDateRange} />}

      {/* Service Modal */}
      {showServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {renderIcon(selectedService.icon, "h-8 w-8")}
                  <div>
                    <p className="font-medium text-gray-900">{selectedService.name}</p>
                    <p className="text-sm text-gray-500">{selectedService.platform}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedService.status)}`}>
                      {selectedService.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connected:</span>
                    <span className={selectedService.connected ? 'text-green-600' : 'text-gray-400'}>
                      {selectedService.connected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Sync:</span>
                    <span>
                      {selectedService.lastSync ? new Date(selectedService.lastSync).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>

                {selectedService.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{selectedService.error}</p>
                  </div>
                )}

                {selectedService.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-700">{selectedService.warning}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedService.connected ? (
                  <>
                    <button
                      onClick={() => {
                        handleServiceSync(selectedService.id);
                        setShowServiceModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Sync Now
                    </button>
                    <button
                      onClick={() => {
                        handleServiceDisconnect(selectedService.id);
                        setShowServiceModal(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleServiceReconnect(selectedService.id);
                      setShowServiceModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
