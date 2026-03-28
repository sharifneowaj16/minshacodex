'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Smartphone,
  Link,
  Settings,
  Bell,
  Send,
  ChevronRight,
} from 'lucide-react';

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  businessName: string;
  status: 'connected' | 'disconnected' | 'pending';
  qrCode?: string;
  lastSync?: string;
  messageCount: {
    sent: number;
    received: number;
    today: number;
  };
  settings: {
    autoReply: boolean;
    autoReplyMessage?: string;
    businessHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    awayMessage?: string;
  };
}

export default function WhatsAppIntegration() {
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadWhatsAppAccount();
  }, []);

  const loadWhatsAppAccount = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccount({
        id: 'wa-001',
        phoneNumber: '+1234567890',
        businessName: 'Minsah Beauty',
        status: 'connected',
        lastSync: new Date().toISOString(),
        messageCount: {
          sent: 1234,
          received: 890,
          today: 45,
        },
        settings: {
          autoReply: true,
          autoReplyMessage: 'Thank you for contacting Minsah Beauty! We will get back to you soon.',
          businessHours: {
            enabled: true,
            start: '09:00',
            end: '18:00',
            timezone: 'UTC',
          },
          awayMessage: 'We are currently offline. We will respond during business hours.',
        },
      });
    } catch (error) {
      console.error('Error loading WhatsApp account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowQR(true);
      setAccount(prev => prev ? { ...prev, status: 'pending' } : null);
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccount(prev => prev ? { ...prev, status: 'disconnected' } : null);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Business Integration</h2>
          <p className="text-gray-600 text-sm">Connect and manage your WhatsApp Business account</p>
        </div>
        {account && account.status === 'connected' && (
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        )}
      </div>

      {/* Connection Status */}
      {!account || account.status === 'disconnected' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect WhatsApp Business</h3>
            <p className="text-gray-600 mb-6">
              Connect your WhatsApp Business account to send and receive messages directly from your admin dashboard.
            </p>
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 mx-auto"
            >
              <Link className="w-5 h-5" />
              Connect WhatsApp
            </button>
          </div>
        </div>
      ) : account.status === 'pending' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
            <p className="text-gray-600 mb-6">
              Open WhatsApp on your phone, go to Settings <ChevronRight className="w-4 h-4 inline mx-1" /> Linked Devices <ChevronRight className="w-4 h-4 inline mx-1" /> Link a Device, and scan this QR code.
            </p>
            {showQR && (
              <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center">
                <div className="w-64 h-64 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              </div>
            )}
            <button
              onClick={() => setShowQR(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Show QR Code
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Status</span>
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">Connected</p>
              <p className="text-green-100 text-xs mt-1">{account.phoneNumber}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Messages Sent</span>
                <Send className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{account.messageCount.sent.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1">Total sent</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Messages Received</span>
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{account.messageCount.received.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1">Total received</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Today</span>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{account.messageCount.today}</p>
              <p className="text-gray-500 text-xs mt-1">Messages today</p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Reply Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-Reply Enabled</p>
                  <p className="text-sm text-gray-500">Automatically reply to incoming messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={account.settings.autoReply}
                    onChange={(e) => setAccount(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, autoReply: e.target.checked }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {account.settings.autoReply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Reply Message
                  </label>
                  <textarea
                    value={account.settings.autoReplyMessage || ''}
                    onChange={(e) => setAccount(prev => prev ? {
                      ...prev,
                      settings: { ...prev.settings, autoReplyMessage: e.target.value }
                    } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your auto-reply message..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-sm text-gray-500">
                    {account.settings.businessHours.start} - {account.settings.businessHours.end}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={account.settings.businessHours.enabled}
                    onChange={(e) => setAccount(prev => prev ? {
                      ...prev,
                      settings: {
                        ...prev.settings,
                        businessHours: { ...prev.settings.businessHours, enabled: e.target.checked }
                      }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          <div className="flex justify-end">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              Disconnect WhatsApp
            </button>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && account && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={account.businessName}
                  onChange={(e) => setAccount(prev => prev ? { ...prev, businessName: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={account.phoneNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Away Message
                </label>
                <textarea
                  value={account.settings.awayMessage || ''}
                  onChange={(e) => setAccount(prev => prev ? {
                    ...prev,
                    settings: { ...prev.settings, awayMessage: e.target.value }
                  } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Message to send when offline..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  // Save settings
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

