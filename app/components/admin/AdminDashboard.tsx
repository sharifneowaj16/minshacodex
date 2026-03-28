'use client';

import { formatPrice } from '@/utils/currency';

// Mock data - remove complex imports
const stats = {
  revenue: 250000,
  orders: 1250,
  customers: 4800,
  products: 156,
  lowStock: 8,
  pendingOrders: 23
};

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to Minsah Beauty Admin Panel</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="text-sm font-medium text-gray-900">Just now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(stats.revenue)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.orders.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.pendingOrders} pending</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.customers.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm text-red-600 font-medium">Stock Alert</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Products</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.products}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.lowStock} low stock</p>
        </div>
      </div>

      {/* Marketing Hub Card */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Marketing Hub</h2>
            <p className="text-purple-100 mb-4">
              Manage all your marketing channels - Social Media, Email, SMS, WhatsApp, and Google Services
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/admin/marketing"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Open Marketing Hub
              </a>
              <a
                href="/admin/marketing?tab=inbox"
                className="px-6 py-3 bg-purple-700/50 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-400"
              >
                Social Inbox (5)
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/products"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </a>
            <a
              href="/admin/orders"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
            >
              <svg className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-900">View Orders</span>
            </a>
            <a
              href="/admin/customers"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all group"
            >
              <svg className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Customers</span>
            </a>
            <a
              href="/admin/analytics"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all group"
            >
              <svg className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-3V8a3 3 0 00-3-3h0a3 3 0 00-3 3v6m3-3h0" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Reports</span>
            </a>
          </div>
        </div>

        {/* Marketing Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Quick Links</h3>
          <div className="space-y-3">
            <a
              href="/admin/marketing?tab=inbox"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Social Media Inbox</p>
                  <p className="text-sm text-gray-500">5 unread messages</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">5</span>
            </a>
            <a
              href="/admin/marketing?tab=whatsapp"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.347-.347.52-.52.173-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Business</p>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </a>
            <a
              href="/admin/marketing?tab=social"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Social Media</p>
                  <p className="text-sm text-gray-500">Facebook, Instagram, YouTube</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
