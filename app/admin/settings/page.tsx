'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Save,
  Globe,
  Mail,
  CreditCard,
  Truck,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  MapPin,
  DollarSign,
  Shield,
  Bell,
  Palette,
  Code,
} from 'lucide-react';

type SettingsTab = 'general' | 'payment' | 'shipping' | 'social' | 'tracking' | 'notifications' | 'appearance';

export default function SettingsPage() {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Minsah Beauty',
    siteDescription: 'Premium Beauty Products Store',
    contactEmail: 'info@minsahbeauty.com',
    contactPhone: '+1 345 99 71 345',
    address: '27 Division St, New York, NY 10002, USA',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    language: 'English',

    // Social Media
    facebookUrl: 'https://facebook.com/minsahbeauty',
    instagramUrl: 'https://instagram.com/minsahbeauty',
    youtubeUrl: 'https://youtube.com/minsahbeauty',
    whatsappNumber: '+8801234567890',

    // Payment Settings
    stripeEnabled: true,
    stripePublicKey: '',
    paypalEnabled: true,
    cashOnDelivery: true,
    bankTransfer: false,

    // Shipping Settings
    freeShippingThreshold: 1000,
    standardShippingCost: 60,
    expressShippingCost: 120,

    // Facebook Pixel
    facebookPixelId: '',
    facebookConversionApiToken: '',

    // Google Analytics
    googleAnalyticsId: '',
    googleTagManagerId: '',

    // Notifications
    orderNotifications: true,
    customerNotifications: true,
    lowStockAlerts: true,
    newsletterSignups: true,

    // Appearance
    primaryColor: '#9333ea',
    secondaryColor: '#ec4899',
    logoUrl: '/logo.png',
  });

  if (!hasPermission(PERMISSIONS.SETTINGS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general' as SettingsTab, name: 'General', icon: Globe },
    { id: 'payment' as SettingsTab, name: 'Payment', icon: CreditCard },
    { id: 'shipping' as SettingsTab, name: 'Shipping', icon: Truck },
    { id: 'social' as SettingsTab, name: 'Social Media', icon: Facebook },
    { id: 'tracking' as SettingsTab, name: 'Tracking & Analytics', icon: Code },
    { id: 'notifications' as SettingsTab, name: 'Notifications', icon: Bell },
    { id: 'appearance' as SettingsTab, name: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your store configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="BDT">BDT - Bangladeshi Taka</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Settings</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Credit/Debit Card (Stripe)</p>
                        <p className="text-sm text-gray-500">Accept card payments via Stripe</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.stripeEnabled}
                        onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-500">Accept PayPal payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.paypalEnabled}
                        onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Allow payment upon delivery</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.cashOnDelivery}
                        onChange={(e) => setSettings({ ...settings, cashOnDelivery: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Settings */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (BDT)</label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping (BDT)</label>
                    <input
                      type="number"
                      value={settings.standardShippingCost}
                      onChange={(e) => setSettings({ ...settings, standardShippingCost: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping (BDT)</label>
                    <input
                      type="number"
                      value={settings.expressShippingCost}
                      onChange={(e) => setSettings({ ...settings, expressShippingCost: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media Links</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Youtube className="w-4 h-4 mr-2 text-red-600" />
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={settings.youtubeUrl}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+8801234567890"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tracking & Analytics Settings */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking & Analytics</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={settings.facebookPixelId}
                      onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your Facebook Pixel ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Conversion API Token</label>
                    <input
                      type="password"
                      value={settings.facebookConversionApiToken}
                      onChange={(e) => setSettings({ ...settings, facebookConversionApiToken: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your Conversion API token"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId}
                      onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Tag Manager ID</label>
                    <input
                      type="text"
                      value={settings.googleTagManagerId}
                      onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications for new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.orderNotifications}
                        onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when products are running low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.lowStockAlerts}
                        onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appearance</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
