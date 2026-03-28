'use client';

import { useState } from 'react';
import type { GoogleService } from '@/types/google';
import { GOOGLE_COLORS, GOOGLE_SERVICE_CONFIGS } from '@/types/google';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';

interface IntegrationStatusProps {
  service: GoogleService;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  className?: string;
}

export default function IntegrationStatus({
  service,
  onConnect,
  onDisconnect,
  onSync,
  className = ''
}: IntegrationStatusProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await onSync();
    } finally {
      setIsLoading(false);
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
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
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
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const getServiceDetails = () => {
    const config = GOOGLE_SERVICE_CONFIGS[service.id as keyof typeof GOOGLE_SERVICE_CONFIGS];
    if (!config) return null;

    let details = [];

    if (service.connected && service.metrics) {
      // Add service-specific metrics
      switch (service.id) {
        case 'search-console':
          details.push(
            `${service.metrics.clicks?.toLocaleString() || 0} clicks`,
            `${service.metrics.ctr || 0}% CTR`
          );
          break;
        case 'merchant-center':
          details.push(
            `${service.metrics.totalProducts || 0} products`,
            `${service.metrics.approvedProducts || 0} approved`
          );
          break;
        case 'google-ads':
          details.push(
            `${service.metrics.activeCampaigns || 0} active campaigns`,
            `৳${service.metrics.dailyBudget || 0}/day budget`
          );
          break;
        case 'analytics':
          details.push(
            `GA4-${service.metrics.propertyId || 'Unknown'}`,
            `${service.metrics.realTimeUsers || 0} users online`
          );
          break;
        case 'business-profile':
          details.push(
            `${service.metrics.rating}★ (${service.metrics.totalReviews || 0} reviews)`,
            `${service.metrics.postsThisMonth || 0} posts this month`
          );
          break;
        case 'tag-manager':
          details.push(
            `Container: ${service.metrics.containerId || 'Unknown'}`,
            `${service.metrics.publishedTags || 0} tags published`
          );
          break;
        case 'remarketing':
          details.push(
            `${service.metrics.totalAudiences || 0} audiences`,
            `${service.metrics.totalUsers?.toLocaleString() || 0} total users`
          );
          break;
      }
    }

    return details;
  };

  const serviceDetails = getServiceDetails();

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{service.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                {getStatusText(service.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {service.connected ? (
            <>
              <button
                onClick={handleSync}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Sync Now"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Service Details */}
      {service.connected && (
        <div className="space-y-2">
          {serviceDetails && serviceDetails.length > 0 && (
            <div className="text-sm text-gray-600">
              {serviceDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-gray-500">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}

          {service.errors && service.errors.length > 0 && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {service.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Last sync: {formatLastSync(service.lastSync)}</span>
            </div>

            <button className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
              <Info className="h-3 w-3" />
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Service Features */}
      {!service.connected && GOOGLE_SERVICE_CONFIGS[service.id as keyof typeof GOOGLE_SERVICE_CONFIGS]?.features && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            {GOOGLE_SERVICE_CONFIGS[service.id as keyof typeof GOOGLE_SERVICE_CONFIGS]?.features?.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
