'use client';

import { useState, useEffect } from 'react';
import { fixEncoding } from '@/lib/fixEncoding';
import {
  MessageCircle,
  Send,
  CheckCircle,
  UserCircle,
  Bell,
  Search,
} from 'lucide-react';

export interface SocialMessage {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'youtube';
  type: 'comment' | 'message' | 'dm' | 'mention';
  conversationId: string;
  sender: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    phone?: string;
  };
  content: {
    text: string;
    media?: Array<{
      type: 'image' | 'video' | 'document';
      url: string;
      thumbnail?: string;
    }>;
  };
  post?: {
    id: string;
    text: string;
    media?: string;
  };
  status: 'unread' | 'read' | 'replied' | 'archived';
  timestamp: string;
  isIncoming: boolean;
  replies?: SocialMessage[];
}

interface SocialMediaInboxProps {
  className?: string;
}

export default function SocialMediaInbox({ className = '' }: SocialMediaInboxProps) {
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/messages');
      const data = await res.json();
      const mapped = data.messages.map((m: any) => ({
        id: m.id,
        platform: m.platform,
        type: m.type,
        conversationId: m.conversationId || m.id,
        sender: {
          id: m.senderId || 'unknown',
          name: m.senderName || 'Unknown',
          avatar: m.senderAvatar,
        },
        content: { text: m.content },
        status: m.isRead ? 'read' : 'unread',
        timestamp: m.timestamp,
        isIncoming: m.isIncoming,
      }));
      setMessages(mapped);
      setUnreadCount(data.unreadCount);
      if (mapped.length > 0 && !selectedConversation) {
        setSelectedConversation(mapped[0].conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (conversationId: string) => {
    if (!replyText.trim()) return;

    const originalMessage = messages.find(m => m.conversationId === conversationId);
    if (!originalMessage) return;

    try {
      await fetch('/api/social/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: originalMessage.platform,
          messageId: originalMessage.id,
          conversationId,
          text: replyText,
        }),
      });

      const newReply: SocialMessage = {
        id: `reply-${Date.now()}`,
        platform: originalMessage.platform,
        type: 'message',
        conversationId,
        sender: { id: 'admin', name: 'Minsah Beauty' },
        content: { text: replyText },
        status: 'read',
        timestamp: new Date().toISOString(),
        isIncoming: false,
      };

      setMessages(prev =>
        prev.map(msg =>
          msg.conversationId === conversationId
            ? { ...msg, status: 'replied' as const, replies: [...(msg.replies || []), newReply] }
            : msg
        )
      );
      setReplyText('');
    } catch (error) {
      console.error('Reply failed:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    await fetch('/api/social/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId }),
    });
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">f</div>;
      case 'instagram':
        return <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-pink-500 rounded text-white flex items-center justify-center text-xs font-bold">ig</div>;
      case 'whatsapp':
        return <div className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-xs font-bold">W</div>;
      case 'youtube':
        return <div className="w-5 h-5 bg-red-600 rounded text-white flex items-center justify-center text-xs font-bold">YT</div>;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filterPlatform !== 'all' && msg.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && msg.status !== filterStatus) return false;
    if (
      searchQuery &&
      !msg.content.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const conversationMessages = selectedConversation
    ? filteredMessages.filter(m => m.conversationId === selectedConversation)
    : [];

  const selectedMessage = conversationMessages[0];

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Inbox</h1>
            <p className="text-gray-600 text-sm">Manage all social media messages and comments</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Bell className="w-4 h-4" />
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="youtube">YouTube</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MessageCircle className="w-12 h-12 mb-3" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedConversation(message.conversationId);
                    markAsRead(message.id);
                  }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === message.conversationId
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      {message.sender.avatar ? (
                        <img
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      )}
                      <div className="absolute -bottom-1 -right-1">
                        {getPlatformIcon(message.platform)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.sender.name}
                        </p>
                        {getStatusIcon(message.status)}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {message.platform} • {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {fixEncoding(message.content.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  {selectedMessage.sender.avatar ? (
                    <img
                      src={selectedMessage.sender.avatar}
                      alt={selectedMessage.sender.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedMessage.sender.name}
                      </h3>
                      {getPlatformIcon(selectedMessage.platform)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedMessage.sender.username || selectedMessage.sender.phone || selectedMessage.platform}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedMessage.status === 'unread'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedMessage.status === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedMessage.post && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Original Post:</p>
                    <p className="text-sm text-gray-600">{selectedMessage.post.text}</p>
                  </div>
                )}

                {/* Incoming Message */}
                <div className="flex items-start gap-3">
                  {selectedMessage.sender.avatar ? (
                    <img
                      src={selectedMessage.sender.avatar}
                      alt={selectedMessage.sender.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-900">
                        {fixEncoding(selectedMessage.content.text)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies?.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-blue-600 text-white rounded-lg p-4 max-w-md">
                        <p className="text-sm">{reply.content.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(reply.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MB</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={() => handleReply(selectedMessage.conversationId)}
                    disabled={!replyText.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
