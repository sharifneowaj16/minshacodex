'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import GoogleHubDashboard from '@/app/components/google/GoogleHubDashboard';
import {
  Home,
  Search,
  ShoppingBag,
  DollarSign,
  BarChart,
  MapPin,
  Tag,
  RefreshCw,
  Users,
  Menu,
  X,
  Settings,
  Bell
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/marketing/google', icon: Home, current: true },
  { name: 'Search Console', href: '/marketing/google/search-console', icon: Search, current: false },
  { name: 'Merchant Center', href: '/marketing/google/merchant-center', icon: ShoppingBag, current: false },
  { name: 'Google Ads', href: '/marketing/google/ads', icon: DollarSign, current: false },
  { name: 'Analytics', href: '/marketing/google/analytics', icon: BarChart, current: false },
  { name: 'Business Profile', href: '/marketing/google/business-profile', icon: MapPin, current: false },
  { name: 'Tag Manager', href: '/marketing/google/tag-manager', icon: Tag, current: false },
  { name: 'Remarketing', href: '/marketing/google/remarketing', icon: RefreshCw, current: false },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/marketing/google/settings', icon: Settings, current: false },
  { name: 'API Keys', href: '/marketing/google/api-keys', icon: Users, current: false },
];

export default function GooglePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Google Hub</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Advanced
              </div>
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-300"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Google Hub</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Advanced
            </div>
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-300"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Google Services</h1>
                <p className="text-sm text-gray-600">Centralized management for all Google services</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">admin@minsahbeauty.com</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          <GoogleHubDashboard />
        </div>
      </div>
    </div>
  );
}
