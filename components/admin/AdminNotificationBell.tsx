'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Gift, ShoppingBag, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
  order?: { orderNumber: string; total: number } | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=15', {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/notifications', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n.id);
    if (n.order) {
      router.push(`/admin/orders?search=${n.order.orderNumber}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  সব পড়েছি
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">কোনো notification নেই</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${
                    !n.isRead ? 'bg-violet-50/50' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    n.type === 'GIFT_ORDER'
                      ? 'bg-pink-100'
                      : 'bg-violet-100'
                  }`}>
                    {n.type === 'GIFT_ORDER'
                      ? <Gift className="w-4 h-4 text-pink-600" />
                      : <ShoppingBag className="w-4 h-4 text-violet-600" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                      {n.type === 'GIFT_ORDER' && (
                        <span className="flex-shrink-0 text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-medium">
                          🎁 Gift
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-violet-500 rounded-full mt-1 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button
                onClick={() => { router.push('/admin/orders'); setOpen(false); }}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium"
              >
                সব orders দেখো →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
