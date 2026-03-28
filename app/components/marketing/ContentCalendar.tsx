'use client';

import { useState, useEffect } from 'react';
import type { CalendarPost, ScheduledPost, Platform } from '@/types/social';
import { PLATFORM_CONFIGS, generateMockScheduledPosts } from '@/types/social';
import { getPlatformIcon } from '@/utils/socialIcons';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface ContentCalendarProps {
  className?: string;
}

export default function ContentCalendar({ className = '' }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterPlatforms, setFilterPlatforms] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const connectedPlatforms = Object.values(PLATFORM_CONFIGS);

  useEffect(() => {
    // Load mock data
    const loadPosts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setScheduledPosts(generateMockScheduledPosts());
      } catch (error) {
        console.error('Failed to load calendar data:', error);
      }
    };

    loadPosts();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const getPostsForDate = (date: Date) => {
    if (!date) return [];

    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      const isSameDate =
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear();

      if (!isSameDate) return false;

      // Apply platform filters
      if (filterPlatforms.length > 0 && !filterPlatforms.includes(post.platforms[0])) {
        return false;
      }

      // Apply status filters
      if (filterStatus.length > 0 && !filterStatus.includes(post.status)) {
        return false;
      }

      // Apply search query
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  const getPlatformColor = (platformId: string) => {
    return PLATFORM_CONFIGS[platformId as keyof typeof PLATFORM_CONFIGS]?.color || '#666';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const deletePost = (postId: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    setSelectedPost(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const filteredPosts = scheduledPosts.filter(post => {
    if (filterPlatforms.length > 0 && !filterPlatforms.some(p => post.platforms.includes(p))) {
      return false;
    }
    if (filterStatus.length > 0 && !filterStatus.includes(post.status)) {
      return false;
    }
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Calendar</h2>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filterPlatforms.length > 0 || filterStatus.length > 0) && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filterPlatforms.length + filterStatus.length}
                </span>
              )}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm">
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Platform Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="space-y-2">
                  {connectedPlatforms.map((platform) => (
                    <label key={platform.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterPlatforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterPlatforms(prev => [...prev, platform.id]);
                          } else {
                            setFilterPlatforms(prev => prev.filter(p => p !== platform.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">{getPlatformIcon(platform.icon)} {platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['scheduled', 'published', 'draft', 'failed'].map((status) => (
                    <label key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterStatus(prev => [...prev, status]);
                          } else {
                            setFilterStatus(prev => prev.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterPlatforms([]);
                    setFilterStatus([]);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-semibold text-gray-900">
            {formatMonthYear(currentDate)}
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {viewMode === 'month' && (
          <>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {getWeekDays().map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-24"></div>;
                }

                const posts = getPostsForDate(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`h-24 border rounded-lg p-2 cursor-pointer transition-all duration-300 ${
                      isTodayDate
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isTodayDate ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </span>
                      {posts.length > 0 && (
                        <span className="text-xs text-gray-500">{posts.length}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {posts.slice(0, 2).map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                          }}
                          className="flex items-center gap-1 text-xs p-1 rounded cursor-pointer hover:bg-white hover:shadow-sm transition-all duration-300"
                          style={{ backgroundColor: `${getPlatformColor(post.platforms[0])}20` }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getPlatformColor(post.platforms[0]) }}
                          />
                          <span className="truncate text-gray-700">{post.content.slice(0, 20)}</span>
                        </div>
                      ))}
                      {posts.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{posts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Week view coming soon</p>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Day view coming soon</p>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPost(null)}></div>

            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Platforms */}
                <div className="flex flex-wrap gap-2">
                  {selectedPost.platforms.map((platformId) => {
                    const platform = PLATFORM_CONFIGS[platformId as keyof typeof PLATFORM_CONFIGS];
                    return (
                      <span
                        key={platformId}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
                        style={{ backgroundColor: platform?.color }}
                      >
                        <span className="flex items-center gap-1">{getPlatformIcon(platform?.icon)} {platform?.name}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Content */}
                <div>
                  <p className="text-gray-900">{selectedPost.content}</p>
                  {selectedPost.hashtags.length > 0 && (
                    <p className="text-blue-600 text-sm mt-2">
                      {selectedPost.hashtags.map(h => h).join(' ')}
                    </p>
                  )}
                </div>

                {/* Media */}
                {selectedPost.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPost.media.map((item) => (
                      <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Schedule Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Scheduled for:</span>
                    <span className="font-medium text-gray-900">
                      {selectedPost.scheduledDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedPost.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      selectedPost.status === 'published' ? 'bg-green-100 text-green-700' :
                      selectedPost.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedPost.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-300">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} total
          </span>
          <span>
            {filteredPosts.filter(p => p.status === 'scheduled').length} scheduled,
            {filteredPosts.filter(p => p.status === 'published').length} published
          </span>
        </div>
      </div>
    </div>
  );
}
