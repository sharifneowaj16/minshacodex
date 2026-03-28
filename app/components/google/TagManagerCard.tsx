'use client';

import { useState, useEffect } from 'react';
import type { TagManagerData, GoogleTag } from '@/types/google';
import { generateMockTagManagerData, GOOGLE_COLORS } from '@/types/google';
import {
  Tag,
  Code,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit,
  Clipboard,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  FileText,
  BarChart,
  Layers
} from 'lucide-react';

interface TagManagerCardProps {
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  className?: string;
}

export default function TagManagerCard({
  dateRange = '28days',
  onDateRangeChange,
  className = ''
}: TagManagerCardProps) {
  const [data, setData] = useState<TagManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tags' | 'triggers' | 'variables' | 'preview'>('overview');
  const [selectedTag, setSelectedTag] = useState<GoogleTag | null>(null);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTag, setNewTag] = useState<Partial<GoogleTag>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    loadTagManagerData();
  }, [dateRange]);

  const loadTagManagerData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockTagManagerData();
      setData(mockData);
    } catch (err) {
      setError('Failed to load Tag Manager data');
      console.error('Error loading Tag Manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name?.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating new tag:', newTag);
      setNewTag({});
      setShowCreateTag(false);
      // In real app, this would create the tag
      alert('Tag created successfully!');
    } catch (err) {
      console.error('Error creating tag:', err);
    }
  };

  const handleCopySnippet = async () => {
    if (!data?.container?.snippet) return;

    try {
      await navigator.clipboard.writeText(data.container.snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.error('Error copying snippet:', err);
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
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
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
            <span className="text-3xl">🏷️</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Tag Manager</h2>
              <p className="text-sm text-gray-600">Tag management and deployment system</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                previewMode
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {previewMode ? (
                <>
                  <Pause className="h-4 w-4" />
                  Exit Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview Mode
                </>
              )}
            </button>

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
        </div>

        {/* Container Info */}
        {data.container && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{data.container.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Container ID: {data.container.id}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Version {data.container.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-600" />
                    Last published {data.container.lastPublish.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Clipboard className="h-4 w-4" />
                {copiedSnippet ? 'Copied!' : 'Copy Snippet'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'tags', name: 'Tags', icon: Tag },
            { id: 'triggers', name: 'Triggers', icon: Layers },
            { id: 'variables', name: 'Variables', icon: FileText },
            { id: 'preview', name: 'Preview', icon: Eye }
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
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Tags</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.container.totalTags}
                </div>
                {getChangeIndicator(data.performance.tagFireChange)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Active Tags</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.container.activeTags}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((data.container.activeTags / data.container.totalTags) * 100).toFixed(1)}% of total
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Tags Fired</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.performance.totalTagsFired.toLocaleString()}
                </div>
                {getChangeIndicator(data.performance.tagFireChange)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Errors</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.performance.errors}
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Changes</h3>
              <div className="space-y-2">
                {data.recentActivity.map((change, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      change.action === 'deleted' ? 'bg-red-100' :
                      change.action === 'created' ? 'bg-green-100' :
                      change.action === 'updated' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {change.action === 'deleted' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {change.action === 'created' && <Plus className="h-4 w-4 text-green-600" />}
                      {change.action === 'updated' && <Edit className="h-4 w-4 text-blue-600" />}
                      {change.action === 'published' && <Play className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{change.description}</p>
                      <p className="text-xs text-gray-500">{change.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Tags</h3>
              <button
                onClick={() => setShowCreateTag(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Tag
              </button>
            </div>

            {/* Create Tag Form */}
            {showCreateTag && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Create New Tag</h4>
                <div className="space-y-3">
                  <select
                    value={newTag.type || 'custom'}
                    onChange={(e) => setNewTag({ ...newTag, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="custom">Custom HTML</option>
                    <option value="google-analytics">Google Analytics</option>
                    <option value="google-ads">Google Ads Conversion</option>
                    <option value="facebook-pixel">Meta Pixel</option>
                    <option value="linkedin-insight">LinkedIn Insight Tag</option>
                  </select>

                  <input
                    type="text"
                    value={newTag.name || ''}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="Tag name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <textarea
                    value={newTag.code || ''}
                    onChange={(e) => setNewTag({ ...newTag, code: e.target.value })}
                    placeholder="Tag code or HTML"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={4}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTag.name?.trim() || !newTag.code?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Create Tag
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateTag(false);
                        setNewTag({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tags List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firing</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Fired</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{tag.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tag.type}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tag.status)}`}>
                          {tag.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tag.impressions.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tag.lastFired?.toLocaleDateString() || 'Never'}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTag(tag)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
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

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Triggers</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Plus className="h-4 w-4" />
                Create Trigger
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.triggers.map((trigger) => (
                <div key={trigger.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{trigger.name}</h4>
                      <p className="text-sm text-gray-600">{trigger.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trigger.status)}`}>
                      {trigger.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <p>Fires on: {trigger.conditions}</p>
                    <p>Trigger count: {trigger.triggerCount}</p>
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
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Variables</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Plus className="h-4 w-4" />
                Create Variable
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.variables.map((variable) => (
                <div key={variable.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{variable.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(variable.status)}`}>
                      {variable.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">Type: {variable.type}</p>
                  {variable.value && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                      {variable.value}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
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
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              {previewMode ? (
                <div>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Mode Active</h3>
                  <p className="text-gray-600 mb-4">Your changes are being tested in preview mode</p>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Exit Preview Mode
                  </button>
                </div>
              ) : (
                <div>
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Mode</h3>
                  <p className="text-gray-600 mb-4">Test your tag configurations before publishing</p>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Enable Preview Mode
                  </button>
                </div>
              )}
            </div>

            {/* Installation Guide */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Installation Guide</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">1. Install GTM Script</p>
                  <p className="text-xs text-gray-600">Add this code to the &lt;head&gt; of your website:</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono mt-1">
                    {data.container?.snippet && (
                      <pre>{data.container.snippet.substring(0, 200)}...</pre>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">2. Verify Installation</p>
                  <p className="text-xs text-gray-600">Use the Tag Assistant extension to verify</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">3. Preview and Debug</p>
                  <p className="text-xs text-gray-600">Test your tags before publishing</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
