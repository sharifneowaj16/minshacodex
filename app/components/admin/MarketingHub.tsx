'use client';

import { useState, useEffect } from 'react';
import type { SocialMediaPost, SocialMediaAccount, MarketingCampaign } from '@/types/admin';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  MessageCircle,
  Heart,
  Eye,
  RefreshCw,
  Share,
  Play,
  Image,
  Video,
  FileText,
  Flame,
  Users,
  BarChart,
  DollarSign,
  Megaphone,
  Mail,
  Smartphone,
  Globe,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function MarketingHub() {
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'campaigns' | 'calendar'>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showConnectAccount, setShowConnectAccount] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [newPost, setNewPost] = useState<Partial<SocialMediaPost>>({});
  const [newCampaign, setNewCampaign] = useState<Partial<MarketingCampaign>>({});

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockMarketingData();
      setSocialAccounts(mockData.socialAccounts);
      setPosts(mockData.posts);
      setCampaigns(mockData.campaigns);
    } catch (error) {
      console.error('Error loading marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMarketingData = () => {
    // Mock social media accounts
    const socialAccounts: SocialMediaAccount[] = [
      {
        id: 'fb-001',
        platform: 'facebook',
        accountName: 'Minsah Beauty',
        accountId: '123456789',
        pageId: '987654321',
        accessToken: 'mock-facebook-token',
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          followers: 45230,
          posts: 342,
          engagement: 4.2,
          reach: 156789,
        },
        settings: {
          autoPublish: true,
          defaultHashtags: ['#beauty', '#skincare', '#selfcare', '#minsahbeauty'],
          postingSchedule: [
            { day: 'Monday', time: '09:00' },
            { day: 'Wednesday', time: '14:00' },
            { day: 'Friday', time: '18:00' },
          ],
        },
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ig-001',
        platform: 'instagram',
        accountName: '@minsahbeauty',
        accountId: '234567890',
        accessToken: '',
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          followers: 78945,
          posts: 567,
          engagement: 6.8,
          reach: 234567,
        },
        settings: {
          autoPublish: true,
          defaultHashtags: ['#beautytips', '#glowup', '#skincare', '#naturalbeauty'],
          postingSchedule: [
            { day: 'Tuesday', time: '12:00' },
            { day: 'Thursday', time: '16:00' },
            { day: 'Saturday', time: '10:00' },
          ],
        },
        createdAt: '2023-01-20T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tt-001',
        platform: 'tiktok',
        accountName: '@minsahbeauty',
        accountId: '345678901',
        accessToken: '',
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          followers: 123456,
          posts: 89,
          engagement: 8.9,
          reach: 567890,
        },
        settings: {
          autoPublish: false,
          defaultHashtags: ['#beautytok', '#skincare', '#glowup', '#tiktokmademebuyit'],
          postingSchedule: [
            { day: 'Daily', time: '19:00' },
          ],
        },
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'yt-001',
        platform: 'youtube',
        accountName: 'Minsah Beauty',
        accountId: '456789012',
        accessToken: '',
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          followers: 34567,
          posts: 45,
          engagement: 3.4,
          reach: 123456,
        },
        settings: {
          autoPublish: true,
          defaultHashtags: ['#beautytutorial', '#skincare', '#review'],
          postingSchedule: [
            { day: 'Sunday', time: '10:00' },
            { day: 'Wednesday', time: '18:00' },
          ],
        },
        createdAt: '2023-01-25T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tw-001',
        platform: 'twitter',
        accountName: '@minsahbeauty',
        accountId: '567890123',
        accessToken: '',
        isConnected: false,
        metrics: {
          followers: 12345,
          posts: 234,
          engagement: 2.1,
          reach: 45678,
        },
        settings: {
          autoPublish: true,
          defaultHashtags: ['#beauty', '#skincare', '#tips'],
          postingSchedule: [
            { day: 'Daily', time: '08:00, 14:00, 20:00' },
          ],
        },
        createdAt: '2023-02-10T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'li-001',
        platform: 'linkedin',
        accountName: 'Minsah Beauty',
        accountId: '678901234',
        accessToken: '',
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          followers: 5678,
          posts: 89,
          engagement: 1.8,
          reach: 23456,
        },
        settings: {
          autoPublish: true,
          defaultHashtags: ['#beautyindustry', '#skincare', '#business'],
          postingSchedule: [
            { day: 'Monday', time: '10:00' },
            { day: 'Thursday', time: '15:00' },
          ],
        },
        createdAt: '2023-02-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    // Mock social media posts
    const posts: SocialMediaPost[] = [
      {
        id: 'post-001',
        platform: 'instagram',
        type: 'post',
        content: {
          text: '✨ Transform your skincare routine with our new Vitamin C Serum! Brighten, hydrate, and protect your skin naturally. #skincare #vitaminc #glowing',
          media: [
            {
              type: 'image',
              url: 'https://example.com/vitamin-c-serum.jpg',
              thumbnail: 'https://example.com/vitamin-c-serum-thumb.jpg',
            },
          ],
          hashtags: ['#skincare', '#vitaminc', '#glowing'],
          mentions: ['@beautyinfluencer'],
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: 1234,
          comments: 89,
          shares: 45,
          views: 8901,
          engagement: 5.2,
          reach: 23456,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'post-002',
        platform: 'tiktok',
        type: 'video',
        content: {
          text: 'Watch this amazing before & after transformation using our Rose Face Oil! 🌹 #skincaretok #beautytok #beforeandafter',
          media: [
            {
              type: 'video',
              url: 'https://example.com/rose-oil-tiktok.mp4',
              thumbnail: 'https://example.com/rose-oil-tiktok-thumb.jpg',
            },
          ],
          hashtags: ['#skincaretok', '#beautytok', '#beforeandafter'],
          mentions: [],
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: 5678,
          comments: 234,
          shares: 123,
          views: 123456,
          engagement: 12.3,
          reach: 234567,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'post-003',
        platform: 'facebook',
        type: 'post',
        content: {
          text: '💖 Special offer this week! Get 20% off on all our face masks. Perfect for a relaxing spa day at home. Link in bio! #special #offer #selfcare',
          media: [
            {
              type: 'image',
              url: 'https://example.com/face-masks-promo.jpg',
              thumbnail: 'https://example.com/face-masks-promo-thumb.jpg',
            },
          ],
          hashtags: ['#special', '#offer', '#selfcare'],
          mentions: [],
        },
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'post-004',
        platform: 'youtube',
        type: 'video',
        content: {
          text: 'Complete skincare routine for glowing skin ft. Minsah Beauty products! Watch until the end for a special surprise. #tutorial #skincare',
          media: [
            {
              type: 'video',
              url: 'https://example.com/skincare-routine-yt.mp4',
              thumbnail: 'https://example.com/skincare-routine-yt-thumb.jpg',
            },
          ],
          hashtags: ['#tutorial', '#skincare'],
          mentions: [],
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: 3456,
          comments: 123,
          shares: 67,
          views: 45678,
          engagement: 4.1,
          reach: 67890,
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'post-005',
        platform: 'instagram',
        type: 'reel',
        content: {
          text: 'Morning skincare routine you need to try! ✨ Layer these products for maximum glow. #morningroutine #skincare #beautytips',
          media: [
            {
              type: 'video',
              url: 'https://example.com/morning-routine-reel.mp4',
              thumbnail: 'https://example.com/morning-routine-reel-thumb.jpg',
            },
          ],
          hashtags: ['#morningroutine', '#skincare', '#beautytips'],
          mentions: [],
        },
        status: 'draft',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Mock marketing campaigns
    const campaigns: MarketingCampaign[] = [
      {
        id: 'camp-001',
        name: 'Summer Glow Campaign',
        type: 'social',
        status: 'active',
        budget: 5000,
        spent: 2300,
        duration: {
          start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        targetAudience: {
          segments: ['beauty-enthusiasts', 'skincare-routine'],
          criteria: {
            age: [18, 45],
            gender: ['female', 'other'],
            interests: ['skincare', 'beauty', 'wellness'],
            locations: ['US', 'CA', 'UK'],
          },
        },
        content: {
          subject: 'Get Your Summer Glow! ☀️',
          body: 'Discover our summer skincare collection with 25% off!',
          media: [
            {
              type: 'image',
              url: 'https://example.com/summer-campaign.jpg',
            },
          ],
          cta: {
            text: 'Shop Now',
            url: 'https://minsahbeauty.com/summer',
          },
        },
        metrics: {
          sent: 50000,
          delivered: 48500,
          opened: 12345,
          clicked: 2345,
          converted: 234,
          cost: 2300,
          roas: 3.4,
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'camp-002',
        name: 'Email Newsletter - Q3',
        type: 'email',
        status: 'active',
        budget: 2000,
        spent: 800,
        duration: {
          start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        targetAudience: {
          segments: ['newsletter-subscribers'],
          criteria: {
            age: [20, 55],
            interests: ['beauty', 'selfcare'],
            purchaseHistory: true,
          },
        },
        content: {
          subject: 'Your Monthly Beauty Update ✨',
          body: 'New products, tips, and exclusive offers inside!',
          cta: {
            text: 'Read More',
            url: 'https://minsahbeauty.com/newsletter',
          },
        },
        metrics: {
          sent: 25000,
          delivered: 24200,
          opened: 6789,
          clicked: 890,
          converted: 67,
          cost: 800,
          roas: 5.2,
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'camp-003',
        name: 'Holiday Gift Guide',
        type: 'social',
        status: 'draft',
        budget: 8000,
        spent: 0,
        duration: {
          start: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        targetAudience: {
          segments: ['holiday-shoppers', 'gift-buyers'],
          criteria: {
            age: [25, 60],
            interests: ['beauty', 'gifts', 'luxury'],
            locations: ['US', 'CA', 'UK', 'EU'],
          },
        },
        content: {
          subject: 'Perfect Beauty Gifts for Everyone! 🎁',
          body: 'Our curated holiday gift guide is here!',
          media: [
            {
              type: 'image',
              url: 'https://example.com/holiday-gifts.jpg',
            },
          ],
          cta: {
            text: 'Explore Gifts',
            url: 'https://minsahbeauty.com/holiday',
          },
        },
        metrics: {},
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return { socialAccounts, posts, campaigns };
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return (
        <div className="w-6 h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">f</div>
      );
      case 'instagram': return (
        <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded text-white flex items-center justify-center text-xs font-bold">ig</div>
      );
      case 'tiktok': return (
        <div className="w-6 h-6 bg-black rounded text-white flex items-center justify-center text-xs font-bold">tt</div>
      );
      case 'youtube': return (
        <div className="w-6 h-6 bg-red-600 rounded text-white flex items-center justify-center text-xs font-bold">yt</div>
      );
      case 'twitter': return (
        <div className="w-6 h-6 bg-sky-500 rounded text-white flex items-center justify-center text-xs font-bold">x</div>
      );
      case 'linkedin': return (
        <div className="w-6 h-6 bg-blue-700 rounded text-white flex items-center justify-center text-xs font-bold">li</div>
      );
      default: return <Globe className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleCreatePost = async () => {
    if (!newPost.content?.text || !newPost.platform) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const post: SocialMediaPost = {
        id: `post-${Date.now()}`,
        platform: newPost.platform as any,
        type: newPost.type as any,
        content: {
          text: newPost.content.text!,
          media: newPost.content?.media || [],
          hashtags: newPost.content?.hashtags || [],
          mentions: newPost.content?.mentions || [],
        },
        status: newPost.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: newPost.scheduledAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPosts(prev => [post, ...prev]);
      setNewPost({});
      setShowCreatePost(false);
      alert('Post created successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const campaign: MarketingCampaign = {
        id: `camp-${Date.now()}`,
        name: newCampaign.name,
        type: newCampaign.type as any,
        status: 'draft',
        budget: newCampaign.budget || 0,
        spent: 0,
        duration: {
          start: new Date().toISOString(),
          end: newCampaign.duration?.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        targetAudience: newCampaign.targetAudience || {
          segments: [],
          criteria: {},
        },
        content: newCampaign.content || {
          subject: '',
          body: '',
          media: [],
          cta: undefined,
        },
        metrics: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCampaigns(prev => [campaign, ...prev]);
      setNewCampaign({});
      setShowCreateCampaign(false);
      alert('Campaign created successfully!');
    } catch (err) {
      console.error('Error creating campaign:', err);
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
            {[...Array(10)].map((_, i) => (
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

  const totalFollowers = socialAccounts.reduce((sum, account) => sum + account.metrics.followers, 0);
  const totalEngagement = socialAccounts.length > 0
    ? socialAccounts.reduce((sum, account) => sum + account.metrics.engagement, 0) / socialAccounts.length
    : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent ?? 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Hub</h1>
          <p className="text-gray-600">Manage social media, campaigns, and marketing analytics</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'social' && (
            <>
              <button
                onClick={() => setShowConnectAccount(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Plus className="h-4 w-4" />
                Connect Account
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
            </>
          )}
          {activeTab === 'campaigns' && (
            <button
              onClick={() => setShowCreateCampaign(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'social', name: 'Social Media', icon: Globe },
            { id: 'campaigns', name: 'Campaigns', icon: Megaphone },
            { id: 'calendar', name: 'Calendar', icon: Calendar },
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">Total Followers</span>
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalFollowers)}</p>
              <p className="text-blue-100 text-xs mt-1">Across all platforms</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Avg Engagement</span>
                <Heart className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{totalEngagement.toFixed(1)}%</p>
              <p className="text-purple-100 text-xs mt-1">Average engagement rate</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Active Campaigns</span>
                <Megaphone className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{activeCampaigns}</p>
              <p className="text-green-100 text-xs mt-1">Currently running</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100 text-sm font-medium">Marketing Spend</span>
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="text-orange-100 text-xs mt-1">of {formatCurrency(totalBudget)} budget</p>
            </div>
          </div>

          {/* Social Media Accounts */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Social Media Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <h4 className="font-medium text-gray-900">{account.accountName}</h4>
                        <p className="text-sm text-gray-500">{account.platform}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      account.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-medium">{formatNumber(account.metrics.followers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engagement:</span>
                      <span className="font-medium">{account.metrics.engagement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reach:</span>
                      <span className="font-medium">{formatNumber(account.metrics.reach)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Posts →
              </button>
            </div>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {post.type === 'video' ? (
                      <Video className="h-6 w-6 text-gray-400" />
                    ) : post.type === 'reel' ? (
                      <Play className="h-6 w-6 text-gray-400" />
                    ) : (
                      <Image className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.content.text}</p>
                    {post.metrics?.engagement && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>❤️ {formatNumber(post.metrics.likes)}</span>
                        <span>💬 {formatNumber(post.metrics.comments)}</span>
                        <span>👁️ {formatNumber(post.metrics.views)}</span>
                        <span>📊 {post.metrics.engagement}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
              </select>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    {post.type === 'video' || post.type === 'reel' ? (
                      <Video className="h-12 w-12 text-gray-400" />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.content.text}</p>
                </div>

                {post.metrics && (
                  <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {formatNumber(post.metrics.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {formatNumber(post.metrics.comments)}
                      </span>
                    </div>
                    <span className="text-xs">{post.metrics.engagement}% engagement</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Budget</span>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Spent</span>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg ROAS</span>
                <BarChart className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0
                  ? (campaigns.reduce((sum, c) => sum + (c.metrics.roas || 0), 0) / campaigns.filter(c => c.metrics.roas).length).toFixed(1)
                  : '0'}x
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Conversions</span>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + (c.metrics.converted || 0), 0)}
              </p>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROAS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(campaign.duration.start).toLocaleDateString()} - {' '}
                            {campaign.duration.end ? new Date(campaign.duration.end).toLocaleDateString() : 'Ongoing'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(campaign.budget ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(campaign.spent ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{campaign.metrics.roas || 'N/A'}x</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{campaign.metrics.converted || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Calendar</h3>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Calendar</h3>
              <p className="text-gray-600 mb-4">Schedule and manage your social media content</p>
              <div className="bg-gray-100 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-gray-700 mb-2">📅 Upcoming Scheduled Posts:</p>
                <ul className="text-left text-sm space-y-1">
                  <li>• Facebook promo post - Tomorrow at 9:00 AM</li>
                  <li>• Instagram story - Friday at 2:00 PM</li>
                  <li>• TikTok video - Saturday at 10:00 AM</li>
                  <li>• YouTube tutorial - Sunday at 6:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Post</h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      value={newPost.platform}
                      onChange={(e) => setNewPost({ ...newPost, platform: e.target.value as SocialMediaPost['platform'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select platform</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                    <select
                      value={newPost.type}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value as SocialMediaPost['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="post">Post</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel</option>
                      <option value="video">Video</option>
                      <option value="pin">Pin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    rows={4}
                    value={newPost.content?.text || ''}
                    onChange={(e) => setNewPost({ ...newPost, content: { hashtags: [], mentions: [], ...newPost.content, text: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's on your mind?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledAt ? new Date(newPost.scheduledAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag and drop images or videos</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.platform || !newPost.content?.text}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Create Post
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
                <button
                  onClick={() => setShowCreateCampaign(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={newCampaign.name || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as MarketingCampaign['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="email">Email</option>
                      <option value="social">Social Media</option>
                      <option value="ads">Paid Ads</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <input
                      type="number"
                      value={newCampaign.budget || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newCampaign.duration?.end ? new Date(newCampaign.duration.end).toISOString().slice(0, 10) : ''}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        duration: { start: newCampaign.duration?.start ?? new Date().toISOString(), ...newCampaign.duration, end: new Date(e.target.value).toISOString() }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newCampaign.targetAudience?.segments?.[0] || ''}
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      targetAudience: { segments: [e.target.value], criteria: {} }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select audience segment</option>
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="vip">VIP Customers</option>
                    <option value="inactive">Inactive Customers</option>
                    <option value="beauty-enthusiasts">Beauty Enthusiasts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Content</label>
                  <textarea
                    rows={3}
                    value={newCampaign.content?.body || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: { ...newCampaign.content, body: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter campaign content"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name || !newCampaign.type}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Create Campaign
                </button>
                <button
                  onClick={() => setShowCreateCampaign(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Account Modal */}
      {showConnectAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Connect Social Account</h3>
                <button
                  onClick={() => setShowConnectAccount(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Choose a platform to connect to your marketing hub:</p>
              <div className="space-y-3">
                {[
                  { name: 'Facebook', color: 'bg-blue-600' },
                  { name: 'Instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
                  { name: 'TikTok', color: 'bg-black' },
                  { name: 'Twitter/X', color: 'bg-sky-500' },
                  { name: 'LinkedIn', color: 'bg-blue-700' },
                ].map((platform) => (
                  <button
                    key={platform.name}
                    className={`w-full px-4 py-3 ${platform.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Connect {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}