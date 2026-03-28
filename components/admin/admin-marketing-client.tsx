'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarketingHub from '@/app/components/admin/MarketingHub';
import SocialMediaInbox from '@/app/components/admin/SocialMediaInbox';
import WhatsAppIntegration from '@/app/components/admin/WhatsAppIntegration';
import GoogleServicesIntegration from '@/app/components/admin/GoogleServicesIntegration';
import {
  Megaphone,
  MessageCircle,
  Smartphone,
  Globe,
  Mail,
  Bell,
  BarChart,
} from 'lucide-react';

type MarketingTab = 'overview' | 'social' | 'inbox' | 'whatsapp' | 'email' | 'sms' | 'google';

interface AdminMarketingClientProps {
  initialTab: MarketingTab;
}

export function AdminMarketingClient({ initialTab }: AdminMarketingClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MarketingTab>(initialTab);

  const handleTabChange = (tab: MarketingTab) => {
    setActiveTab(tab);
    router.push(`/admin/marketing?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: 'overview' as MarketingTab, name: 'Overview', icon: BarChart },
    { id: 'social' as MarketingTab, name: 'Social Media', icon: Globe },
    { id: 'inbox' as MarketingTab, name: 'Social Inbox', icon: MessageCircle, badge: 5 },
    { id: 'whatsapp' as MarketingTab, name: 'WhatsApp', icon: Smartphone },
    { id: 'email' as MarketingTab, name: 'Email Marketing', icon: Mail },
    { id: 'sms' as MarketingTab, name: 'SMS Marketing', icon: Bell },
    { id: 'google' as MarketingTab, name: 'Google Services', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
              <p className="text-gray-600 mt-1">
                Manage all your marketing channels from one place
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 -mb-px">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                    {tab.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-180px)]">
        {activeTab === 'overview' && (
          <div className="p-6">
            <MarketingHub />
          </div>
        )}
        {activeTab === 'social' && (
          <div className="p-6">
            <MarketingHub />
          </div>
        )}
        {activeTab === 'inbox' && (
          <SocialMediaInbox className="h-full" />
        )}
        {activeTab === 'whatsapp' && (
          <WhatsAppIntegration />
        )}
        {activeTab === 'email' && (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Marketing</h3>
              <p className="text-gray-600 mb-6">
                Create and manage email campaigns, newsletters, and automated email sequences.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Email Campaign
              </button>
            </div>
          </div>
        )}
        {activeTab === 'sms' && (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS Marketing</h3>
              <p className="text-gray-600 mb-6">
                Send SMS campaigns, order updates, and promotional messages to your customers.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create SMS Campaign
              </button>
            </div>
          </div>
        )}
        {activeTab === 'google' && (
          <div className="p-6">
            <GoogleServicesIntegration />
          </div>
        )}
      </div>
    </div>
  );
}
