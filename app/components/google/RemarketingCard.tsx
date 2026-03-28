'use client';

import { useState, useEffect } from 'react';
import type { RemarketingData } from '@/types/google';
import { generateMockRemarketingData, GOOGLE_COLORS } from '@/types/google';
import {
  RefreshCw,
  Users,
  BarChart,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  ShoppingCart,
  Eye,
  MousePointer2
} from 'lucide-react';

interface RemarketingCardProps {
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  className?: string;
}

export default function RemarketingCard({
  dateRange = '28days',
  onDateRangeChange,
  className = ''
}: RemarketingCardProps) {
  const [data, setData] = useState<RemarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audiences' | 'campaigns' | 'pixels'>('overview');
  const [selectedAudience, setSelectedAudience] = useState<RemarketingData['audiences'][number] | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<RemarketingData['campaigns'][number] | null>(null);
  const [showCreateAudience, setShowCreateAudience] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newAudience, setNewAudience] = useState<{ name?: string; type?: string; description?: string; rules?: string }>({});
  const [newCampaign, setNewCampaign] = useState<{ name?: string; type?: string; budget?: number }>({});

  useEffect(() => {
    loadRemarketingData();
  }, [dateRange]);

  const loadRemarketingData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockRemarketingData();
      setData(mockData);
    } catch (err) {
      setError('Failed to load Remarketing data');
      console.error('Error loading Remarketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudience = async () => {
    if (!newAudience.name?.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating new audience:', newAudience);
      setNewAudience({});
      setShowCreateAudience(false);
      // In real app, this would create the audience
      alert('Audience created successfully!');
    } catch (err) {
      console.error('Error creating audience:', err);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name?.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating new campaign:', newCampaign);
      setNewCampaign({});
      setShowCreateCampaign(false);
      // In real app, this would create the campaign
      alert('Remarketing campaign created successfully!');
    } catch (err) {
      console.error('Error creating campaign:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
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
            <span className="text-3xl">🔥</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Remarketing</h2>
              <p className="text-sm text-gray-600">Retargeting campaigns and audience management</p>
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

        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">Total Users</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.performance.totalUsers.toLocaleString()}
            </div>
            {getChangeIndicator(data.performance.userChange)}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Impressions</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.performance.impressions.toLocaleString()}
            </div>
            {getChangeIndicator(data.performance.impressionChange)}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MousePointer2 className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-600">Clicks</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.performance.clicks.toLocaleString()}
            </div>
            {getChangeIndicator(data.performance.clickChange)}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-gray-600">Conversions</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.performance.conversions.toLocaleString()}
            </div>
            {getChangeIndicator(data.performance.conversionChange)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'audiences', name: 'Audiences', icon: Users },
            { id: 'campaigns', name: 'Campaigns', icon: RefreshCw },
            { id: 'pixels', name: 'Pixels', icon: Eye }
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

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Campaign Performance */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Campaign Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Shopping Remarketing</h4>
                    <span className="text-green-600 text-sm font-medium">+24.5%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ROAS</p>
                      <p className="font-bold text-gray-900">4.2x</p>
                    </div>
                    <div>
                      <p className="text-gray-600">CTR</p>
                      <p className="font-bold text-gray-900">2.8%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Display Remarketing</h4>
                    <span className="text-green-600 text-sm font-medium">+18.3%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ROAS</p>
                      <p className="font-bold text-gray-900">2.8x</p>
                    </div>
                    <div>
                      <p className="text-gray-600">CTR</p>
                      <p className="font-bold text-gray-900">1.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Funnel */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Audience Funnel</h3>
              <div className="space-y-3">
                {data.audienceFunnel.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    <div className="w-32">
                      <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                      <p className="text-xs text-gray-500">{stage.count.toLocaleString()} users</p>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'campaign' ? 'bg-blue-100' :
                      activity.type === 'audience' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'campaign' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'audience' && <Users className="h-4 w-4 text-green-600" />}
                      {activity.type === 'conversion' && <ShoppingCart className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audiences Tab */}
        {activeTab === 'audiences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Custom Audiences</h3>
              <button
                onClick={() => setShowCreateAudience(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Audience
              </button>
            </div>

            {/* Create Audience Form */}
            {showCreateAudience && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Create New Audience</h4>
                <div className="space-y-3">
                  <select
                    value={newAudience.type || 'website'}
                    onChange={(e) => setNewAudience({ ...newAudience, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="website">Website Visitors</option>
                    <option value="purchase">Past Purchasers</option>
                    <option value="cart">Abandoned Cart</option>
                    <option value="page">Page Visitors</option>
                    <option value="custom">Custom Combination</option>
                  </select>

                  <input
                    type="text"
                    value={newAudience.name || ''}
                    onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
                    placeholder="Audience name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <textarea
                    value={newAudience.rules || ''}
                    onChange={(e) => setNewAudience({ ...newAudience, rules: e.target.value })}
                    placeholder="Audience rules (e.g., visited product pages in last 30 days)"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateAudience}
                      disabled={!newAudience.name?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Create Audience
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateAudience(false);
                        setNewAudience({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audiences List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.audiences.map((audience) => (
                <div key={audience.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{audience.name}</h4>
                      <p className="text-sm text-gray-600">{audience.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audience.status)}`}>
                      {audience.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Size</p>
                      <p className="font-bold text-gray-900">{audience.size.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Used in</p>
                      <p className="font-bold text-gray-900">{audience.campaignsUsed} campaigns</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">{audience.rules}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAudience(audience)}
                      className="p-1 text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Remarketing Campaigns</h3>
              <button
                onClick={() => setShowCreateCampaign(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </button>
            </div>

            {/* Create Campaign Form */}
            {showCreateCampaign && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Create New Campaign</h4>
                <div className="space-y-3">
                  <select
                    value={newCampaign.type || 'display'}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="display">Display Network</option>
                    <option value="search">Search Network</option>
                    <option value="shopping">Shopping</option>
                    <option value="video">YouTube</option>
                    <option value="discovery">Discovery</option>
                  </select>

                  <input
                    type="text"
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Campaign name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <input
                    type="number"
                    value={newCampaign.budget || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) })}
                    placeholder="Daily budget"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCampaign}
                      disabled={!newCampaign.name?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Create Campaign
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateCampaign(false);
                        setNewCampaign({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audiences</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{campaign.type}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">${campaign.budget.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{campaign.roas}x</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{campaign.audiences.length}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-600 hover:text-gray-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                          <button className="p-1 text-gray-600 hover:text-gray-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pixels Tab */}
        {activeTab === 'pixels' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tracking Pixels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.pixels.map((pixel) => (
                  <div key={pixel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{pixel.name}</h4>
                        <p className="text-sm text-gray-600">{pixel.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pixel.status)}`}>
                        {pixel.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mb-3">
                      <p>Platform: {pixel.platform}</p>
                      <p>Created: {pixel.createdAt}</p>
                      <p>Events: {pixel.events} tracked</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-gray-600 mb-1">Pixel ID:</p>
                      <code className="text-xs font-mono">{pixel.pixelId}</code>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Installation Instructions</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Meta Pixel (Facebook/Instagram)</h5>
                  <p className="text-gray-600">Add to all pages for website tracking and retargeting</p>
                  <code className="block bg-gray-900 text-gray-100 p-2 rounded text-xs mt-1">
                    {'<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s){...}(window,\n  document,\'script\',\'https://connect.facebook.net/en_US/fbevents.js\');\nfbq(\'init\', \'YOUR_PIXEL_ID\');\nfbq(\'track\', \'PageView\');\n</script>'}
                  </code>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Google Ads Remarketing Tag</h5>
                  <p className="text-gray-600">Add for Google Display Network retargeting</p>
                  <code className="block bg-gray-900 text-gray-100 p-2 rounded text-xs mt-1">
                    {'<!-- Google Ads Remarketing -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>\n<script>\nwindow.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag(\'js\', new Date());\ngtag(\'config\', \'AW-CONVERSION_ID\');\n</script>'}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
