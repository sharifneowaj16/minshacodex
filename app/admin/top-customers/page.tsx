'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Crown,
  Award,
  Gift,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  Download,
  Filter,
  Send,
} from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';
import { getAllDivisions } from '@/data/bangladesh-locations';

export default function TopCustomersPage() {
  const { hasPermission } = useAdminAuth();
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [filterYear, setFilterYear] = useState('2024');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Mock top customers data - Replace with real API data
  const topCustomers = [
    {
      id: '1',
      name: 'Fatima Rahman',
      email: 'fatima.rahman@example.com',
      phone: '+880 1712-345678',
      location: {
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        area: 'Dhanmondi 8',
      },
      totalOrders: 45,
      totalSpent: 45678,
      avgOrderValue: 1015.07,
      firstOrderDate: new Date('2023-01-15'),
      lastOrderDate: new Date('2024-01-18'),
      loyaltyPoints: 4567,
      tier: 'diamond' as const,
      yearlyGiftEligible: true,
      yearlyGiftAwarded: {
        year: 2023,
        giftName: 'Premium Beauty Kit',
        giftValue: 5000,
        awardedDate: new Date('2023-12-25'),
      },
    },
    {
      id: '2',
      name: 'Ayesha Siddique',
      email: 'ayesha.siddique@example.com',
      phone: '+880 1812-345679',
      location: {
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Gulshan',
        area: 'Gulshan 2',
      },
      totalOrders: 38,
      totalSpent: 38901,
      avgOrderValue: 1023.71,
      firstOrderDate: new Date('2023-02-20'),
      lastOrderDate: new Date('2024-01-19'),
      loyaltyPoints: 3890,
      tier: 'platinum' as const,
      yearlyGiftEligible: true,
    },
    {
      id: '3',
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@example.com',
      phone: '+880 1912-345680',
      location: {
        division: 'Chittagong',
        district: 'Chittagong',
        thana: 'Agrabad',
        area: 'Agrabad Commercial Area',
      },
      totalOrders: 32,
      totalSpent: 32145,
      avgOrderValue: 1004.53,
      firstOrderDate: new Date('2023-03-10'),
      lastOrderDate: new Date('2024-01-17'),
      loyaltyPoints: 3214,
      tier: 'platinum' as const,
      yearlyGiftEligible: true,
    },
    {
      id: '4',
      name: 'Sabrina Akhter',
      email: 'sabrina.akhter@example.com',
      phone: '+880 1612-345681',
      location: {
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Uttara',
        area: 'Uttara Sector 7',
      },
      totalOrders: 28,
      totalSpent: 28456,
      avgOrderValue: 1016.29,
      firstOrderDate: new Date('2023-04-05'),
      lastOrderDate: new Date('2024-01-16'),
      loyaltyPoints: 2845,
      tier: 'gold' as const,
      yearlyGiftEligible: true,
    },
    {
      id: '5',
      name: 'Tahmina Begum',
      email: 'tahmina.begum@example.com',
      phone: '+880 1712-345682',
      location: {
        division: 'Sylhet',
        district: 'Sylhet',
        thana: 'Sylhet Sadar',
        area: 'Zindabazar',
      },
      totalOrders: 25,
      totalSpent: 25678,
      avgOrderValue: 1027.12,
      firstOrderDate: new Date('2023-05-12'),
      lastOrderDate: new Date('2024-01-15'),
      loyaltyPoints: 2567,
      tier: 'gold' as const,
      yearlyGiftEligible: true,
    },
    {
      id: '6',
      name: 'Razia Sultana',
      email: 'razia.sultana@example.com',
      phone: '+880 1812-345683',
      location: {
        division: 'Rajshahi',
        district: 'Rajshahi',
        thana: 'Boalia',
        area: 'Shaheb Bazar',
      },
      totalOrders: 22,
      totalSpent: 22345,
      avgOrderValue: 1015.68,
      firstOrderDate: new Date('2023-06-18'),
      lastOrderDate: new Date('2024-01-14'),
      loyaltyPoints: 2234,
      tier: 'silver' as const,
      yearlyGiftEligible: false,
    },
    {
      id: '7',
      name: 'Nasrin Akter',
      email: 'nasrin.akter@example.com',
      phone: '+880 1912-345684',
      location: {
        division: 'Khulna',
        district: 'Khulna',
        thana: 'Khulna Sadar',
        area: 'Khulna City',
      },
      totalOrders: 20,
      totalSpent: 20123,
      avgOrderValue: 1006.15,
      firstOrderDate: new Date('2023-07-22'),
      lastOrderDate: new Date('2024-01-13'),
      loyaltyPoints: 2012,
      tier: 'silver' as const,
      yearlyGiftEligible: false,
    },
    {
      id: '8',
      name: 'Shahnaz Parvin',
      email: 'shahnaz.parvin@example.com',
      phone: '+880 1612-345685',
      location: {
        division: 'Dhaka',
        district: 'Gazipur',
        thana: 'Gazipur Sadar',
        area: 'Tongi',
      },
      totalOrders: 18,
      totalSpent: 18456,
      avgOrderValue: 1025.33,
      firstOrderDate: new Date('2023-08-15'),
      lastOrderDate: new Date('2024-01-12'),
      loyaltyPoints: 1845,
      tier: 'silver' as const,
      yearlyGiftEligible: false,
    },
  ];

  if (!hasPermission(PERMISSIONS.CUSTOMERS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view top customers.</p>
      </div>
    );
  }

  const filteredCustomers = topCustomers.filter(customer => {
    const matchesDivision = filterDivision === 'all' || customer.location.division === filterDivision;
    const matchesTier = filterTier === 'all' || customer.tier === filterTier;
    return matchesDivision && matchesTier;
  });

  const getTierBadge = (tier: string) => {
    const badges = {
      diamond: { color: 'bg-cyan-100 text-cyan-800', icon: 'D' },
      platinum: { color: 'bg-purple-100 text-purple-800', icon: 'P' },
      gold: { color: 'bg-yellow-100 text-yellow-800', icon: 'G' },
      silver: { color: 'bg-gray-100 text-gray-800', icon: 'S' },
      bronze: { color: 'bg-orange-100 text-orange-800', icon: 'B' },
    };
    return badges[tier as keyof typeof badges] || badges.bronze;
  };

  const eligibleForGift = filteredCustomers.filter(c => c.yearlyGiftEligible).length;
  const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
  const avgSpent = totalSpent / filteredCustomers.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Customers by Region</h1>
          <p className="text-gray-600">Identify and reward your most valuable customers</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Gift className="w-5 h-5 mr-2" />
            Award Yearly Gifts
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{filteredCustomers.length}</p>
              <p className="text-xs text-gray-600 mt-1">Active customers</p>
            </div>
            <Crown className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(totalSpent))}
              </p>
              <p className="text-xs text-green-600 mt-1">From top customers</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(avgSpent))}
              </p>
              <p className="text-xs text-gray-600 mt-1">Per customer</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gift Eligible</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{eligibleForGift}</p>
              <p className="text-xs text-orange-600 mt-1">For {filterYear} gifts</p>
            </div>
            <Gift className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Divisions</option>
            {getAllDivisions().map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Tiers</option>
            <option value="diamond">Diamond</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="2024">2024 Gifts</option>
            <option value="2023">2023 Gifts</option>
            <option value="2022">2022 Gifts</option>
          </select>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yearly Gift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => {
                const tierBadge = getTierBadge(customer.tier);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600 mr-2">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-purple-500 mr-1" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{customer.location.thana}</p>
                          <p className="text-xs text-gray-500">{customer.location.district}, {customer.location.division}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(convertUSDtoBDT(customer.totalSpent))}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: {formatPrice(convertUSDtoBDT(customer.avgOrderValue))}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <ShoppingCart className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{customer.totalOrders}</span>
                      </div>
                      <p className="text-xs text-gray-500">{customer.loyaltyPoints} pts</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierBadge.color}`}>
                        <span className="mr-1">{tierBadge.icon}</span>
                        <span className="capitalize">{customer.tier}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.yearlyGiftEligible ? (
                        customer.yearlyGiftAwarded ? (
                          <div className="text-xs">
                            <p className="text-green-600 font-medium flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              Awarded {customer.yearlyGiftAwarded.year}
                            </p>
                            <p className="text-gray-500">{customer.yearlyGiftAwarded.giftName}</p>
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Eligible
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Not eligible</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {customer.yearlyGiftEligible && !customer.yearlyGiftAwarded && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowGiftModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Gift className="w-5 h-5" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
