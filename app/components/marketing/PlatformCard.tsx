'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Platform } from '@/types/social';
import { PLATFORM_CONFIGS } from '@/types/social';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  BarChart,
  Edit,
  Calendar,
  Eye,
  Heart,
  Share,
  MessageSquare
} from 'lucide-react';
import { formatNumber } from '@/utils/formatting'; // Number formatting utility
import { getPlatformIcon } from '@/utils/socialIcons';

interface PlatformCardProps {
  platform: Platform;
  onConnect: () => void;
  onDisconnect: () => void;
  onQuickPost: () => void;
  className?: string;
}

export default function PlatformCard({ platform, onConnect, onDisconnect, onQuickPost, className = '' }: PlatformCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const config = PLATFORM_CONFIGS[platform.id as keyof typeof PLATFORM_CONFIGS];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
          >
            {getPlatformIcon(platform.icon)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
            <p className="text-sm text-gray-500">
              {platform.connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          platform.connected
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {platform.connected ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Stats */}
      {platform.connected && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Eye className="h-4 w-4" />
              Followers
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(platform.followers)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <BarChart className="h-4 w-4" />
              Engagement
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {platform.engagement}%
            </p>
          </div>
        </div>
      )}

      {/* Last Post */}
      {platform.connected && platform.lastPost && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Clock className="h-4 w-4" />
            Last Post
          </div>
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {platform.lastPost.content}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(platform.lastPost.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {formatNumber(platform.lastPost.comments)}
            </span>
            {platform.lastPost.shares && (
              <span className="flex items-center gap-1">
                <Share className="h-3 w-3" />
                {formatNumber(platform.lastPost.shares)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {config && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Plus className="h-4 w-4" />
            Features
          </div>
          <div className="flex flex-wrap gap-1">
            {config.features?.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {config.features && config.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{config.features.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {platform.connected ? (
          <>
            <button
              onClick={onQuickPost}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
              Quick Post
            </button>
            <button
              onClick={onDisconnect}
              className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-300"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isConnecting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Connect
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
