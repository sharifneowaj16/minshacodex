'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  Star,
  Gift,
  PenTool,
  Home,
  ChevronRight,
  Users,
  Sparkles
} from 'lucide-react';
import { User } from '@/lib/auth';

const navigation = [
  {
    name: 'Dashboard',
    href: '/account',
    icon: Home,
    description: 'Account overview'
  },
  {
    name: 'Orders',
    href: '/account/orders',
    icon: ShoppingBag,
    description: 'Order history and tracking'
  },
  {
    name: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
    description: 'Saved items'
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
    description: 'Shipping and billing addresses'
  },
  {
    name: 'Profile Settings',
    href: '/account/settings',
    icon: Settings,
    description: 'Account information and preferences'
  },
  {
    name: 'Loyalty Points',
    href: '/account/loyalty',
    icon: Star,
    description: 'Rewards and benefits'
  },
  {
    name: 'Referrals',
    href: '/account/referrals',
    icon: Users,
    description: 'Refer friends and earn rewards'
  },
  {
    name: 'Reviews',
    href: '/account/reviews',
    icon: PenTool,
    description: 'Product reviews'
  }
];

interface AccountLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function AccountLayoutClient({ user, children }: AccountLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isVip = user.role === 'vip' || user.role === 'premium';
  const isPremium = user.role === 'premium';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
              {user.firstName?.charAt(0) ?? ''}{user.lastName?.charAt(0) ?? ''}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">My Account</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.firstName ?? 'User'}!</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-gray-600"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200">
            <nav className="px-2 py-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user.firstName?.charAt(0) ?? ''}{user.lastName?.charAt(0) ?? ''}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.firstName ?? ''} {user.lastName ?? ''}
                </h2>
                <p className="text-gray-600 text-sm">{user.email}</p>

                {/* User Role Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'premium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : user.role === 'vip'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'premium' && (
                      <>
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    )}
                    {user.role === 'vip' && (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        VIP
                      </>
                    )}
                    {user.role === 'customer' && 'Customer'}
                  </span>
                </div>

                {/* Loyalty Points */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {user.loyaltyPoints.toLocaleString()} points
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/shop"
                      className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Shop
                    </Link>
                    <Link
                      href="/logout"
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                    >
                      Sign Out
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-purple-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Benefits for Premium/VIP */}
            {(isVip || isPremium) && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-purple-600" />
                  Your Benefits
                </h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  {isVip && (
                    <>
                      <li>• Early access to sales</li>
                      <li>• Free shipping over $50</li>
                      <li>• Priority support</li>
                    </>
                  )}
                  {isPremium && (
                    <>
                      <li>• Personal beauty consultant</li>
                      <li>• Free shipping on all orders</li>
                      <li>• Birthday & anniversary rewards</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-900">My Account</span>
                    </div>
                  </li>
                  {pathname !== '/account' && (
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="ml-2 text-sm text-purple-600 font-medium">
                          {navigation.find(item => item.href === pathname)?.name}
                        </span>
                      </div>
                    </li>
                  )}
                </ol>
              </nav>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
