'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  MapPin,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Filter,
  Download,
  ChevronRight,
} from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { bangladeshLocations, getAllDivisions, getDistrictsByDivision } from '@/data/bangladesh-locations';

export default function SalesByRegionPage() {
  const { hasPermission } = useAdminAuth();
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [viewType, setViewType] = useState<'division' | 'district' | 'thana'>('division');
  const [dateRange, setDateRange] = useState('30d');

  // Mock regional sales data - Replace with real API data
  const regionalSalesData = {
    divisions: [
      {
        name: 'Dhaka',
        totalOrders: 4567,
        totalRevenue: 456789,
        totalCustomers: 2345,
        avgOrderValue: 100.09,
        growth: 23.5,
        topProducts: [
          { id: '1', name: 'Luxury Foundation Pro', orders: 567, revenue: 78456 },
          { id: '2', name: 'Organic Face Serum', orders: 456, revenue: 56789 },
        ],
      },
      {
        name: 'Chittagong',
        totalOrders: 2345,
        totalRevenue: 234567,
        totalCustomers: 1567,
        avgOrderValue: 100.03,
        growth: 18.3,
        topProducts: [
          { id: '1', name: 'Luxury Foundation Pro', orders: 345, revenue: 45678 },
          { id: '3', name: 'Premium Perfume Set', orders: 234, revenue: 34567 },
        ],
      },
      {
        name: 'Rajshahi',
        totalOrders: 1234,
        totalRevenue: 123456,
        totalCustomers: 789,
        avgOrderValue: 100.05,
        growth: 15.7,
        topProducts: [
          { id: '2', name: 'Organic Face Serum', orders: 234, revenue: 34567 },
        ],
      },
      {
        name: 'Khulna',
        totalOrders: 987,
        totalRevenue: 98765,
        totalCustomers: 654,
        avgOrderValue: 100.07,
        growth: 12.4,
        topProducts: [
          { id: '1', name: 'Luxury Foundation Pro', orders: 123, revenue: 23456 },
        ],
      },
      {
        name: 'Sylhet',
        totalOrders: 876,
        totalRevenue: 87654,
        totalCustomers: 567,
        avgOrderValue: 100.06,
        growth: 20.1,
        topProducts: [
          { id: '3', name: 'Premium Perfume Set', orders: 156, revenue: 23456 },
        ],
      },
      {
        name: 'Barisal',
        totalOrders: 654,
        totalRevenue: 65432,
        totalCustomers: 456,
        avgOrderValue: 100.05,
        growth: 10.8,
        topProducts: [
          { id: '2', name: 'Organic Face Serum', orders: 89, revenue: 12345 },
        ],
      },
      {
        name: 'Rangpur',
        totalOrders: 543,
        totalRevenue: 54321,
        totalCustomers: 378,
        avgOrderValue: 100.04,
        growth: 14.2,
        topProducts: [
          { id: '1', name: 'Luxury Foundation Pro', orders: 67, revenue: 10234 },
        ],
      },
      {
        name: 'Mymensingh',
        totalOrders: 432,
        totalRevenue: 43210,
        totalCustomers: 298,
        avgOrderValue: 100.02,
        growth: 11.5,
        topProducts: [
          { id: '2', name: 'Organic Face Serum', orders: 56, revenue: 8901 },
        ],
      },
    ],
    districts: {
      Dhaka: [
        { name: 'Dhaka', totalOrders: 2345, totalRevenue: 234567, totalCustomers: 1567, avgOrderValue: 100.03, growth: 25.6 },
        { name: 'Gazipur', totalOrders: 876, totalRevenue: 87654, totalCustomers: 567, avgOrderValue: 100.06, growth: 22.3 },
        { name: 'Narayanganj', totalOrders: 654, totalRevenue: 65432, totalCustomers: 456, avgOrderValue: 100.05, growth: 20.1 },
        { name: 'Tangail', totalOrders: 432, totalRevenue: 43210, totalCustomers: 298, avgOrderValue: 100.02, growth: 18.9 },
        { name: 'Munshiganj', totalOrders: 260, totalRevenue: 25926, totalCustomers: 187, avgOrderValue: 99.71, growth: 15.2 },
      ],
      Chittagong: [
        { name: 'Chittagong', totalOrders: 1567, totalRevenue: 156789, totalCustomers: 1045, avgOrderValue: 100.06, growth: 19.8 },
        { name: "Cox's Bazar", totalOrders: 432, totalRevenue: 43210, totalCustomers: 298, avgOrderValue: 100.02, growth: 17.5 },
        { name: 'Comilla', totalOrders: 346, totalRevenue: 34567, totalCustomers: 234, avgOrderValue: 99.91, growth: 16.2 },
      ],
    },
    thanas: {
      Dhaka: [
        { name: 'Dhanmondi', totalOrders: 345, totalRevenue: 45678, totalCustomers: 234, avgOrderValue: 132.37, growth: 28.5 },
        { name: 'Gulshan', totalOrders: 289, totalRevenue: 38901, totalCustomers: 189, avgOrderValue: 134.60, growth: 26.7 },
        { name: 'Mirpur', totalOrders: 267, totalRevenue: 32145, totalCustomers: 178, avgOrderValue: 120.39, growth: 24.3 },
        { name: 'Uttara', totalOrders: 234, totalRevenue: 29876, totalCustomers: 156, avgOrderValue: 127.68, growth: 23.1 },
        { name: 'Mohammadpur', totalOrders: 198, totalRevenue: 24567, totalCustomers: 134, avgOrderValue: 124.03, growth: 21.8 },
        { name: 'Motijheel', totalOrders: 167, totalRevenue: 21234, totalCustomers: 112, avgOrderValue: 127.13, growth: 20.4 },
      ],
    },
  };

  if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view sales by region.</p>
      </div>
    );
  }

  const totalOrders = regionalSalesData.divisions.reduce((sum, div) => sum + div.totalOrders, 0);
  const totalRevenue = regionalSalesData.divisions.reduce((sum, div) => sum + div.totalRevenue, 0);
  const totalCustomers = regionalSalesData.divisions.reduce((sum, div) => sum + div.totalCustomers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const getDataToDisplay = () => {
    if (viewType === 'division') {
      return regionalSalesData.divisions;
    } else if (viewType === 'district' && selectedDivision !== 'all') {
      return regionalSalesData.districts[selectedDivision as keyof typeof regionalSalesData.districts] || [];
    } else if (viewType === 'thana' && selectedDistrict !== 'all') {
      return regionalSalesData.thanas[selectedDistrict as keyof typeof regionalSalesData.thanas] || [];
    }
    return regionalSalesData.divisions;
  };

  const dataToDisplay = getDataToDisplay();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales by Region - Bangladesh</h1>
          <p className="text-gray-600">Track sales performance across divisions, districts, thanas, and areas</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+18.5% vs last period</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">+22.3% vs last period</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalCustomers.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">From {regionalSalesData.divisions.length} divisions</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(avgOrderValue)}
              </p>
              <p className="text-xs text-green-600 mt-1">+5.2% vs last period</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={viewType}
            onChange={(e) => {
              setViewType(e.target.value as 'division' | 'district' | 'thana');
              setSelectedDivision('all');
              setSelectedDistrict('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="division">View by Division</option>
            <option value="district">View by District</option>
            <option value="thana">View by Thana</option>
          </select>

          {(viewType === 'district' || viewType === 'thana') && (
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Select Division</option>
              {getAllDivisions().map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          )}

          {viewType === 'thana' && selectedDivision !== 'all' && (
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Select District</option>
              {getDistrictsByDivision(selectedDivision).map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          )}

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Regional Sales Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataToDisplay.map((location: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{location.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{location.totalOrders.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(location.totalRevenue)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{location.totalCustomers.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {formatPrice(location.avgOrderValue)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      location.growth >= 20 ? 'text-green-600' :
                      location.growth >= 10 ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      +{location.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        if (viewType === 'division') {
                          setViewType('district');
                          setSelectedDivision(location.name);
                        } else if (viewType === 'district') {
                          setViewType('thana');
                          setSelectedDistrict(location.name);
                        }
                      }}
                      className="inline-flex items-center text-purple-600 hover:text-purple-900"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span className="text-sm">View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bangladesh Map Placeholder */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Heatmap - Bangladesh</h3>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600">Interactive Bangladesh map with sales heatmap</p>
          <p className="text-sm text-gray-500 mt-2">
            Visual representation of sales density across divisions, districts, and thanas
          </p>
        </div>
      </div>
    </div>
  );
}
