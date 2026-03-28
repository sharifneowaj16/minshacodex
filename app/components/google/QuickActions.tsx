'use client';

import { useState } from 'react';
import type { GoogleService } from '@/types/google';
import { GOOGLE_SERVICE_CONFIGS, GOOGLE_COLORS } from '@/types/google';

import {
  Plus,
  BarChart,
  Settings,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

interface QuickActionsProps {
  services: GoogleService[];
  onConnectService: (serviceId: string) => Promise<void>;
  onSyncAll: () => Promise<void>;
  className?: string;
}

export default function QuickActions({
  services,
  onConnectService,
  onSyncAll,
  className = ''
}: QuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const connectedServices = services.filter(s => s.connected);
  const disconnectedServices = services.filter(s => !s.connected);
  const warningServices = services.filter(s => s.status === 'warning');
  const errorServices = services.filter(s => s.status === 'error');

  const handleConnectService = async (serviceId: string) => {
    setIsLoading(true);
    try {
      await onConnectService(serviceId);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Create Campaign</p>
              <p className="text-sm text-gray-600">Start new ad campaign</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Check performance metrics</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-sm text-gray-600">Generate reports</p>
            </div>
          </button>

          <button
            onClick={onSyncAll}
            disabled={isLoading}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className={`h-5 w-5 text-yellow-600 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Sync All</p>
              <p className="text-sm text-gray-600">Update all services</p>
            </div>
          </button>
        </div>
      </div>

      {/* Alerts & Issues */}
      {(warningServices.length > 0 || errorServices.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Issues</h3>

          <div className="space-y-3">
            {/* Error Services */}
            {errorServices.map((service) => (
              <div key={service.id} className={`p-3 border rounded-lg flex items-start gap-3 ${getAlertColor('error')}`}>
                {getAlertIcon('error')}
                <div className="flex-1">
                  <p className="font-medium">{service.name} has errors</p>
                  <p className="text-sm mt-1">
                    {service.errors?.length ? service.errors[0] : 'Please check your service configuration'}
                  </p>
                  <button className="text-sm underline mt-2">Fix Issues</button>
                </div>
              </div>
            ))}

            {/* Warning Services */}
            {warningServices.map((service) => (
              <div key={service.id} className={`p-3 border rounded-lg flex items-start gap-3 ${getAlertColor('warning')}`}>
                {getAlertIcon('warning')}
                <div className="flex-1">
                  <p className="font-medium">{service.name} needs attention</p>
                  <div className="text-sm mt-1">
                    {service.id === 'merchant-center' && (
                      <span>{service.metrics?.pendingProducts || 0} products pending review</span>
                    )}
                    {service.id === 'search-console' && (
                      <span>{(service.metrics as Record<string, unknown>)?.coverageIssues ? ((service.metrics as Record<string, unknown>).coverageIssues as Record<string, number>).errors : 0} coverage issues</span>
                    )}
                  </div>
                  <button className="text-sm underline mt-2">Review Issues</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {connectedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>

          <div className="space-y-4">

            {/* Budget Optimization */}
            {connectedServices.some(s => s.id === 'google-ads') && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Optimize Ad Budget</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Shopping ads are performing well. Increase the budget to capture more sales.
                    </p>
                    <button className="text-sm font-medium text-green-600 hover:text-green-700 mt-2">
                      View Recommendations →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Opportunities */}
            {connectedServices.some(s => s.id === 'search-console') && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">SEO Opportunities Found</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your "beauty products" queries are trending. Create content around these keywords.
                    </p>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2">
                      Explore Keywords →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Listing */}
            {connectedServices.some(s => s.id === 'merchant-center') && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Product Listing Tips</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Add product attributes like GTIN and detailed descriptions to improve visibility.
                    </p>
                    <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700 mt-2">
                      Improve Listings →
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Service Setup */}
      {disconnectedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Up Additional Services</h3>

          <div className="space-y-3">
            {disconnectedServices.map((service) => {
              const config = GOOGLE_SERVICE_CONFIGS[service.id as keyof typeof GOOGLE_SERVICE_CONFIGS];
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">{config?.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectService(service.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Need Help Getting Started?</p>
                <p className="text-sm text-blue-700 mt-1">
                  Check our step-by-step guides for setting up each Google service.
                </p>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 underline">
                  View Setup Guides →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Summary */}
      {connectedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Services Summary</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {connectedServices.map((service) => {
              const config = GOOGLE_SERVICE_CONFIGS[service.id as keyof typeof GOOGLE_SERVICE_CONFIGS];
              return (
                <div key={service.id} className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mx-auto mb-2"
                    style={{ backgroundColor: `${config?.color}20` }}
                  >
                    {service.icon}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {service.name.split(' ')[1]}
                  </p>
                  <p className="text-xs text-gray-500">{getStatusText(service.status)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {connectedServices.length} of {services.length} services connected
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Manage All Services →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return 'Active';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Inactive';
    }
  }
}
