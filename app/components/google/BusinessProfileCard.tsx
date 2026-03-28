'use client';

import { useState, useEffect } from 'react';
import type { BusinessProfileData, GooglePost, GoogleReview } from '@/types/google';
import { generateMockBusinessProfileData, GOOGLE_COLORS } from '@/types/google';
import {
  MapPin,
  Star,
  Phone,
  Clock,
  BarChart,
  Users,
  Image,
  Edit,
  Plus,
  Trash2,
  Heart,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  MessageCircle,
  Edit3,
  Eye,
  MousePointer2
} from 'lucide-react';
import { Star as StarIconSolid } from 'lucide-react';

interface BusinessProfileCardProps {
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  className?: string;
}

export default function BusinessProfileCard({
  dateRange = '28days',
  onDateRangeChange,
  className = ''
}: BusinessProfileCardProps) {
  const [data, setData] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'reviews' | 'posts' | 'photos'>('overview');
  const [selectedReview, setSelectedReview] = useState<GoogleReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newPost, setNewPost] = useState<Partial<GooglePost>>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  useEffect(() => {
    loadBusinessProfileData();
  }, [dateRange]);

  const loadBusinessProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = generateMockBusinessProfileData();
      setData(mockData);
    } catch (err) {
      setError('Failed to load Business Profile data');
      console.error('Error loading Business Profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Replying to review ${reviewId}: ${replyText}`);
      setReplyText('');
      setSelectedReview(null);
      // In real app, this would update the review with the reply
      alert('Reply posted successfully!');
    } catch (err) {
      console.error('Error replying to review:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content?.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating new post:', newPost);
      setNewPost({});
      setShowCreatePost(false);
      // In real app, this would create the post
      alert('Post published successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
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

  const filteredReviews = data?.reviews.filter(review => {
    if (reviewFilter === 'positive') return review.rating >= 4;
    if (reviewFilter === 'negative') return review.rating <= 2;
    if (reviewFilter === 'neutral') return review.rating === 3;
    return true;
  }) || [];

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
            <span className="text-3xl">🏪</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google Business Profile</h2>
              <p className="text-sm text-gray-600">Local business listing and customer engagement</p>
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

        {/* Business Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{data.businessInfo.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{data.businessInfo.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{data.businessInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{data.businessInfo.hours}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                {getStarRating(Math.round(data.businessInfo.rating))}
              </div>
              <p className="text-lg font-bold text-gray-900">{data.businessInfo.rating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">{data.businessInfo.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'insights', name: 'Insights', icon: Users },
            { id: 'reviews', name: 'Reviews', icon: MessageCircle },
            { id: 'posts', name: 'Posts', icon: Edit3 },
            { id: 'photos', name: 'Photos', icon: Image }
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
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.insights.views.toLocaleString()}
                </div>
                {getChangeIndicator(data.insights.viewChange)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.insights.clicks.toLocaleString()}
                </div>
                {getChangeIndicator(data.insights.clickChange)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Calls</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.insights.calls.toLocaleString()}
                </div>
                {getChangeIndicator(data.insights.callChange)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Directions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.insights.directions.toLocaleString()}
                </div>
                {getChangeIndicator(data.insights.directionChange)}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Customer Activity</h3>
              <div className="space-y-2">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'review' && <Star className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'question' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'photo' && <Image className="h-4 w-4 text-blue-600" />}
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

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Actions</h3>
                <div className="space-y-3">
                  {Object.entries(data.insights.customerActions).map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 capitalize">{action.replace('_', ' ')}</span>
                      <span className="text-lg font-bold text-gray-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Queries */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Top Search Queries</h3>
                <div className="space-y-3">
                  {data.insights.searchQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{query.query}</p>
                        <p className="text-xs text-gray-500">{query.count} times searched</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{query.views}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Reviews' },
                  { value: 'positive', label: 'Positive' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'negative', label: 'Negative' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setReviewFilter(filter.value as any)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      reviewFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Average Rating:</span>
                <div className="flex items-center gap-1">
                  {getStarRating(Math.round(data.businessInfo.rating))}
                  <span className="ml-1 font-bold text-gray-900">{data.businessInfo.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{review.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{review.name}</h4>
                          <div className="flex items-center gap-1">
                            {getStarRating(review.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {review.reply && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Replied</span>
                      )}
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-2">{review.comment}</p>

                  {review.reply && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-900">Business Reply</span>
                        <span className="text-xs text-blue-700">{review.reply.date}</span>
                      </div>
                      <p className="text-sm text-blue-800">{review.reply.text}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {selectedReview?.id === review.id && (
                    <div className="mt-3 border-t pt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReviewReply(review.id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Google Posts</h3>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
            </div>

            {/* Create Post Form */}
            {showCreatePost && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Create New Post</h4>
                <div className="space-y-3">
                  <select
                    value={newPost.type || 'update'}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="update">Update</option>
                    <option value="offer">Offer</option>
                    <option value="event">Event</option>
                  </select>

                  <input
                    type="text"
                    value={newPost.title || ''}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Post title"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <textarea
                    value={newPost.content || ''}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="What's new with your business?"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={4}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.content?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Publish Post
                    </button>
                    <button
                      onClick={() => {
                        setShowCreatePost(false);
                        setNewPost({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {data.posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full uppercase">
                        {post.type}
                      </span>
                      <h4 className="font-medium text-gray-900 mt-2">{post.title}</h4>
                    </div>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>

                  <p className="text-gray-700 mb-2">{post.content}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes} likes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Business Photos</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Plus className="h-4 w-4" />
                Add Photos
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Business photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  {photo.caption && (
                    <p className="mt-1 text-xs text-gray-600">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Upload photos to showcase your business</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Choose photos to upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
