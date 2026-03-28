'use client';

import { useState, useRef, useEffect } from 'react';
import type { Platform, ScheduledPost, PostData, MediaItem } from '@/types/social';
import { PLATFORM_CONFIGS } from '@/types/social';
import { getPlatformIcon } from '@/utils/socialIcons';
import {
  X,
  Image,
  Smile,
  Hash,
  Calendar,
  Clock,
  Send,
  FileText,
  Eye,
  Check
} from 'lucide-react';

interface PostSchedulerProps {
  onClose: () => void;
  onSchedule: (postData: Partial<ScheduledPost>) => void;
  platforms: Platform[];
  selectedPlatforms?: string[];
}

export default function PostScheduler({ onClose, onSchedule, platforms, selectedPlatforms = [] }: PostSchedulerProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [selectedPlatformsState, setSelectedPlatforms] = useState<string[]>(selectedPlatforms);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const connectedPlatforms = platforms.filter(p => p.connected);
  const selectedPlatformConfigs = selectedPlatformsState.map(id =>
    connectedPlatforms.find(p => p.id === id)
  ).filter(Boolean) as Platform[];

  // Beauty-related hashtags
  const beautyHashtags = [
    '#beauty', '#makeup', '#skincare', '#cosmetics', '#makeupartist', '#beautytips',
    '#glowup', '#selfcare', '#motd', '#eotd', '#lotd', '#beautyroutine',
    '#organicbeauty', '#naturalbeauty', '#cleanbeauty', '#sustainablebeauty',
    '#luxuryskincare', '#antiaging', '#skincareproducts', '#makeuptutorial'
  ];

  const emojis = ['✨', '💄', '🧴', '🌸', '💕', '🎨', '⭐', '🔥', '💖', '✅'];

  const getCharacterCount = (platformId: string) => {
    const config = PLATFORM_CONFIGS[platformId as keyof typeof PLATFORM_CONFIGS];
    return config ? config.characterLimit : 280;
  };

  const getCharacterCountClass = (platformId: string) => {
    const limit = getCharacterCount(platformId);
    const count = content.length;

    if (count > limit * 0.9) return 'text-red-500';
    if (count > limit * 0.8) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaItem: MediaItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: e.target?.result as string,
          thumbnail: file.type.startsWith('video/') ? e.target?.result as string : undefined,
          size: file.size,
          aspectRatio: 1, // Would calculate from actual dimensions
        };
        setMedia(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addHashtag = (hashtag: string) => {
    if (!hashtags.includes(hashtag)) {
      setHashtags(prev => [...prev, hashtag]);
    }
    setShowHashtagSuggestions(false);
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const handlePostNow = async () => {
    if (selectedPlatformsState.length === 0 || !content.trim()) {
      alert('Please select at least one platform and add content');
      return;
    }

    setIsPosting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onSchedule({
        platforms: selectedPlatformsState,
        content,
        media,
        hashtags,
        mentions,
        status: 'published',
        publishedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedPlatformsState.length === 0 || !content.trim() || (scheduleOption === 'later' && (!scheduledDate || !scheduledTime))) {
      alert('Please fill all required fields');
      return;
    }

    setIsScheduling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      const scheduledDateTime = scheduleOption === 'now'
        ? new Date()
        : new Date(`${scheduledDate}T${scheduledTime}`);

      onSchedule({
        platforms: selectedPlatformsState,
        content,
        media,
        hashtags,
        mentions,
        scheduledDate: scheduledDateTime,
        status: 'scheduled'
      });
      onClose();
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-300 ${
                activeTab === 'compose'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compose
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-300 ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview ({selectedPlatformConfigs.length})
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'compose' ? (
              /* Compose Tab */
              <div className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {connectedPlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                          selectedPlatformsState.includes(platform.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-sm">{getPlatformIcon(platform.icon)}</span>
                        <span className="text-sm font-medium">{platform.name}</span>
                        {selectedPlatformsState.includes(platform.id) && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Media</label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-300"
                    >
                      <Image className="h-4 w-4" />
                      Add Media
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleMediaUpload(e.target.files)}
                    className="hidden"
                  />

                  {media.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {media.map((item) => (
                        <div key={item.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {item.type === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <button
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-300 cursor-pointer"
                    >
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload images or videos</p>
                      <p className="text-xs text-gray-500 mt-1">Drag and drop supported</p>
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Caption</label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                        >
                          <Smile className="h-4 w-4" />
                        </button>

                        {showEmojiPicker && (
                          <div className="absolute bottom-full right-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="grid grid-cols-8 gap-1">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addEmoji(emoji)}
                                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-300"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setShowHashtagSuggestions(!showHashtagSuggestions)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                        >
                          <Hash className="h-4 w-4" />
                        </button>

                        {showHashtagSuggestions && (
                          <div className="absolute bottom-full right-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 max-h-48 overflow-y-auto">
                            <p className="text-xs font-medium text-gray-700 mb-2">Suggested Hashtags</p>
                            <div className="space-y-1">
                              {beautyHashtags.slice(0, 10).map((hashtag) => (
                                <button
                                  key={hashtag}
                                  onClick={() => addHashtag(hashtag)}
                                  className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-300"
                                >
                                  {hashtag}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your caption here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />

                  {/* Character Counts */}
                  {selectedPlatformsState.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {selectedPlatformConfigs.map((platform) => {
                        const limit = getCharacterCount(platform.id);
                        const count = content.length;
                        const percentage = (count / limit) * 100;

                        return (
                          <div key={platform.id} className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">{getPlatformIcon(platform.icon)}</span>
                            <span className={getCharacterCountClass(platform.id)}>
                              {count}/{limit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Hashtags */}
                  {hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {hashtag}
                          <button
                            onClick={() => removeHashtag(hashtag)}
                            className="hover:text-blue-900 transition-colors duration-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">When to Post</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="now"
                        checked={scheduleOption === 'now'}
                        onChange={(e) => setScheduleOption(e.target.value as 'now' | 'later')}
                        className="mr-2"
                      />
                      <span className="text-sm">Post Now</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="later"
                        checked={scheduleOption === 'later'}
                        onChange={(e) => setScheduleOption(e.target.value as 'now' | 'later')}
                        className="mr-2"
                      />
                      <span className="text-sm">Schedule for Later</span>
                    </label>
                  </div>

                  {scheduleOption === 'later' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Preview Tab */
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Preview how your post will look on each selected platform
                </p>

                {selectedPlatformConfigs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select platforms to see preview</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPlatformConfigs.map((platform) => (
                      <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${platform.color}20` }}
                          >
                            {getPlatformIcon(platform.icon)}
                          </div>
                          <span className="font-medium text-gray-900">{platform.name}</span>
                        </div>

                        {/* Platform-specific preview */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          {media.length > 0 && (
                            <div className="mb-3">
                              {media.length === 1 ? (
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                  {media[0].type === 'video' ? (
                                    <video src={media[0].url} className="w-full h-full object-cover" controls />
                                  ) : (
                                    <img src={media[0].url} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1">
                                  {media.slice(0, 4).map((item, index) => (
                                    <div key={item.id} className="aspect-square bg-gray-200 rounded overflow-hidden">
                                      {item.type === 'video' ? (
                                        <video src={item.url} className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                  ))}
                                  {media.length > 4 && (
                                    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                                      <span className="text-sm text-gray-600">+{media.length - 4}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-gray-900 mb-2">{content}</p>
                          {hashtags.length > 0 && (
                            <p className="text-blue-600 text-sm">
                              {hashtags.map(h => h).join(' ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{PLATFORM_CONFIGS[platform.id as keyof typeof PLATFORM_CONFIGS]?.characterLimit} char limit</span>
                          <span>{content.length} chars used</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-300"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                Save Draft
              </button>

              {scheduleOption === 'now' ? (
                <button
                  onClick={handlePostNow}
                  disabled={isPosting || selectedPlatformsState.length === 0 || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Now
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSchedule}
                  disabled={isScheduling || selectedPlatformsState.length === 0 || !content.trim() || !scheduledDate || !scheduledTime}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isScheduling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Schedule Post
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
