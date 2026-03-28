'use client';

import { useState, useEffect } from 'react';
import type { Platform, ScheduledPost } from '@/types/social';
import { PLATFORM_CONFIGS, generateMockPlatforms, generateMockScheduledPosts } from '@/types/social';
import PlatformCard from './PlatformCard';
import PostScheduler from './PostScheduler';
import {
  BarChart,
  Calendar,
  Clock,
  Plus,
  Bell,
  Users,
  Sparkles,
  Settings
} from 'lucide-react';

interface SocialDashboardProps {
  className?: string;
}

export default function SocialDashboard({ className = '' }: SocialDashboardProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    // Load mock data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlatforms(generateMockPlatforms());
        setScheduledPosts(generateMockScheduledPosts());
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnectPlatform = async (platformId: string) => {
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPlatforms(prev =>
        prev.map(platform =>
          platform.id === platformId
            ? { ...platform, connected: true }
            : platform
        )
      );
      // Show success notification (in real app, use toast)
      console.log(`Connected to ${platformId}`);
    } catch (error) {
      console.error('Failed to connect platform:', error);
    }
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlatforms(prev =>
        prev.map(platform =>
          platform.id === platformId
            ? { ...platform, connected: false, followers: 0, lastPost: undefined }
            : platform
        )
      );
      console.log(`Disconnected from ${platformId}`);
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
    }
  };

  const handleSchedulePost = (postData: Partial<ScheduledPost>) => {
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platforms: postData.platforms || [],
      content: postData.content || '',
      media: postData.media || [],
      hashtags: postData.hashtags || [],
      mentions: postData.mentions || [],
      scheduledDate: postData.scheduledDate || new Date(),
      status: 'scheduled',
      engagement: undefined,
      createdAt: new Date(),
      platformSpecific: postData.platformSpecific
    };

    setScheduledPosts(prev => [...prev, newPost]);
    setShowScheduler(false);
    console.log('Post scheduled successfully!');
  };

  const totalFollowers = platforms.reduce((sum, platform) => sum + (platform.connected ? platform.followers : 0), 0);
  const connectedPlatforms = platforms.filter(platform => platform.connected).length;
  const totalScheduledPosts = scheduledPosts.filter(post => post.status === 'scheduled').length;
  const averageEngagement = platforms
    .filter(platform => platform.connected && platform.engagement > 0)
    .reduce((sum, platform, _, arr) => sum + (platform.engagement / arr.length), 0);

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
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
            <h1 className="text-2xl font-bold text-gray-900">Social Media Dashboard</h1>
            <p className="text-gray-600">Manage all your social media platforms in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300">
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowScheduler(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-5 w-5" />
              Create Post
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">{totalFollowers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Platforms</p>
                <p className="text-2xl font-bold text-gray-900">{connectedPlatforms}</p>
                <p className="text-sm text-gray-500">of {platforms.length} platforms</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Posts</p>
                <p className="text-2xl font-bold text-gray-900">{totalScheduledPosts}</p>
                <p className="text-sm text-gray-500">This week</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{averageEngagement.toFixed(1)}%</p>
                <p className="text-sm text-green-600">+2.3% improvement</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Platforms</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onConnect={() => handleConnectPlatform(platform.id)}
                onDisconnect={() => handleDisconnectPlatform(platform.id)}
                onQuickPost={() => {
                  setSelectedPlatforms([platform.id]);
                  setShowScheduler(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowScheduler(true)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Create New Post</p>
                <p className="text-sm text-gray-600">Schedule content for multiple platforms</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Calendar</p>
                <p className="text-sm text-gray-600">See all scheduled content</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View performance insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Post Scheduler Modal */}
      {showScheduler && (
        <PostScheduler
          onClose={() => {
            setShowScheduler(false);
            setSelectedPlatforms([]);
          }}
          onSchedule={handleSchedulePost}
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
        />
      )}
    </div>
  );
}
