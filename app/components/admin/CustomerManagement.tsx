'use client';

import { useState, useEffect } from 'react';
import type { AdminCustomer } from '@/types/admin';
import { generateMockCustomers } from '@/types/admin';
import {
  Search,
  Plus,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Star,
  CreditCard,
  BarChart,
  Users,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Edit,
  Trash2,
  Eye,
  Tag,
  Gift,
  Bell,
  MessageCircle
} from 'lucide-react';
import { Star as StarIconSolid } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSegmentManager, setShowSegmentManager] = useState(false);
  const [showVipManager, setShowVipManager] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchQuery, selectedSegment, selectedStatus, sortBy]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockCustomers = generateMockCustomers();
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      );
    }

    // Filter by segment
    if (selectedSegment !== 'all') {
      filtered = filtered.filter(customer => customer.rfm.score === selectedSegment);
    }

    // Filter by status
    if (selectedStatus === 'vip') {
      filtered = filtered.filter(customer => customer.isVip);
    } else if (selectedStatus === 'active') {
      filtered = filtered.filter(customer =>
        new Date(customer.stats.lastOrderDate).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
      );
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(customer =>
        new Date(customer.stats.lastOrderDate).getTime() <= Date.now() - 90 * 24 * 60 * 60 * 1000
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'orders':
          return b.stats.totalOrders - a.stats.totalOrders;
        case 'spent':
          return b.stats.totalSpent - a.stats.totalSpent;
        case 'recency':
          return new Date(b.stats.lastOrderDate).getTime() - new Date(a.stats.lastOrderDate).getTime();
        case 'rfm':
          return b.rfm.recency + b.rfm.frequency + b.rfm.monetary -
                 (a.rfm.recency + a.rfm.frequency + a.rfm.monetary);
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const getSegmentColor = (score: string) => {
    switch (score) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'loyal': return 'bg-green-100 text-green-800 border-green-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSegmentIcon = (score: string) => {
    switch (score) {
      case 'vip': return <Crown className="h-4 w-4" />;
      case 'loyal': return <Star className="h-4 w-4" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4" />;
      case 'lost': return <Clock className="h-4 w-4" />;
      case 'new': return <CheckCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const calculateRFMScore = (customer: AdminCustomer) => {
    const { recency, frequency, monetary } = customer.rfm;
    return Math.round((recency + frequency + monetary) / 3);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleBulkEmail = () => {
    if (selectedCustomers.length > 0) {
      // Simulate bulk email action
      alert(`Sending email to ${selectedCustomers.length} customers`);
      setSelectedCustomers([]);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Avg Order Value',
      'RFM Score', 'Segment', 'Last Order Date', 'Is VIP'
    ];

    const csvData = filteredCustomers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone || '',
      customer.stats.totalOrders.toString(),
      customer.stats.totalSpent.toString(),
      customer.stats.avgOrderValue.toString(),
      calculateRFMScore(customer).toString(),
      customer.rfm.score,
      customer.stats.lastOrderDate,
      customer.isVip.toString()
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  const sendNotification = async (customerId: string, type: string) => {
    // Simulate notification API call
    console.log(`Sending ${type} notification to customer ${customerId}`);
    alert(`${type} notification sent successfully!`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customers and analyze behavior</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSegmentManager(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Users className="h-4 w-4" />
            Manage Segments
          </button>
          <button
            onClick={() => setShowVipManager(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Crown className="h-4 w-4" />
            VIP Customers
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Total Customers</span>
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{customers.length.toLocaleString()}</p>
          <p className="text-blue-100 text-xs mt-1">+12% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">VIP Customers</span>
            <Crown className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{customers.filter(c => c.isVip).length}</p>
          <p className="text-purple-100 text-xs mt-1">Top tier</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Active</span>
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">
            {customers.filter(c =>
              new Date(c.stats.lastOrderDate).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
            ).length}
          </p>
          <p className="text-green-100 text-xs mt-1">Last 90 days</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-100 text-sm font-medium">At Risk</span>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">
            {customers.filter(c => c.rfm.score === 'at-risk').length}
          </p>
          <p className="text-yellow-100 text-xs mt-1">Need attention</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100 text-sm font-medium">New</span>
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">
            {customers.filter(c => c.rfm.score === 'new').length}
          </p>
          <p className="text-orange-100 text-xs mt-1">This month</p>
        </div>
      </div>

      {/* RFM Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation (RFM Analysis)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { score: 'vip', label: 'VIP Customers', desc: 'High value, recent purchasers', color: 'purple' },
            { score: 'loyal', label: 'Loyal Customers', desc: 'Regular purchasers', color: 'green' },
            { score: 'at-risk', label: 'At Risk', desc: 'Declining engagement', color: 'yellow' },
            { score: 'lost', label: 'Lost', desc: 'No recent activity', color: 'red' },
            { score: 'new', label: 'New', desc: 'Recent first-time buyers', color: 'blue' }
          ].map((segment) => {
            const count = customers.filter(c => c.rfm.score === segment.score).length;
            const percentage = ((count / customers.length) * 100).toFixed(1);

            return (
              <div key={segment.score} className={`border-${segment.color}-200 bg-${segment.color}-50 rounded-lg p-4 border`}>
                <div className="flex items-center gap-2 mb-2">
                  {getSegmentIcon(segment.score)}
                  <h4 className="font-medium text-gray-900">{segment.label}</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{percentage}% of total</p>
                <p className="text-xs text-gray-500 mt-1">{segment.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Segments</option>
            <option value="vip">VIP</option>
            <option value="loyal">Loyal</option>
            <option value="at-risk">At Risk</option>
            <option value="lost">Lost</option>
            <option value="new">New</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="vip">VIP Only</option>
            <option value="active">Active (90 days)</option>
            <option value="inactive">Inactive (90+ days)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="orders">Sort by Orders</option>
            <option value="spent">Sort by Total Spent</option>
            <option value="recency">Sort by Last Order</option>
            <option value="rfm">Sort by RFM Score</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCustomers.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedCustomers.length} customers selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedCustomers.length === filteredCustomers.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEmail}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </button>
              <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <Tag className="h-4 w-4" />
                Add Tags
              </button>
              <button className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Gift className="h-4 w-4" />
                Send Coupon
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customers Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredCustomers.map((customer) => {
          const isSelected = selectedCustomers.includes(customer.id);
          const rfmScore = calculateRFMScore(customer);

          return viewMode === 'grid' ? (
            <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {customer.avatar ? (
                      <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-medium">{customer.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      {customer.name}
                      {customer.isVip && <Crown className="h-4 w-4 text-yellow-500" />}
                    </h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Segment:</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getSegmentColor(customer.rfm.score)}`}>
                    {customer.rfm.score.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">RFM Score:</span>
                  <span className="font-medium">{rfmScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">{customer.stats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="font-medium">{formatCurrency(customer.stats.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Order:</span>
                  <span className="font-medium">{formatRelativeTime(customer.stats.lastOrderDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  {customer.preferences.email && (
                    <button
                      onClick={() => sendNotification(customer.id, 'email')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                  {customer.preferences.sms && (
                    <button
                      onClick={() => sendNotification(customer.id, 'sms')}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Send SMS"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => sendNotification(customer.id, 'push')}
                    className="p-1 text-purple-600 hover:text-purple-700"
                    title="Send Push"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerDetails(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectCustomer(customer.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-medium text-lg">{customer.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      {customer.name}
                      {customer.isVip && <Crown className="h-4 w-4 text-yellow-500" />}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSegmentColor(customer.rfm.score)}`}>
                      {customer.rfm.score.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-1 font-medium truncate block">{customer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-1 font-medium">{customer.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orders:</span>
                      <span className="ml-1 font-medium">{customer.stats.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Spent:</span>
                      <span className="ml-1 font-medium">{formatCurrency(customer.stats.totalSpent)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RFM:</span>
                      <span className="ml-1 font-medium">{rfmScore}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Order:</span>
                      <span className="ml-1 font-medium">{formatRelativeTime(customer.stats.lastOrderDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {customer.preferences.email && (
                      <button
                        onClick={() => sendNotification(customer.id, 'email')}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    )}
                    {customer.preferences.sms && (
                      <button
                        onClick={() => sendNotification(customer.id, 'sms')}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Send SMS"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerDetails(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedCustomer.avatar ? (
                      <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-medium text-2xl">{selectedCustomer.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.isVip && <Crown className="h-5 w-5 text-yellow-500" />}
                    </h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSegmentColor(selectedCustomer.rfm.score)}`}>
                        {selectedCustomer.rfm.score.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">RFM Score: {calculateRFMScore(selectedCustomer)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Phone:</span> {selectedCustomer.phone || 'Not provided'}</p>
                    <p><span className="text-gray-600">Date of Birth:</span> {selectedCustomer.dateOfBirth || 'Not provided'}</p>
                    <p><span className="text-gray-600">Gender:</span> {selectedCustomer.gender || 'Not specified'}</p>
                    <p><span className="text-gray-600">Member Since:</span> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">VIP Status:</span> {selectedCustomer.isVip ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Total Orders:</span> {selectedCustomer.stats.totalOrders}</p>
                    <p><span className="text-gray-600">Total Spent:</span> {formatCurrency(selectedCustomer.stats.totalSpent)}</p>
                    <p><span className="text-gray-600">Average Order Value:</span> {formatCurrency(selectedCustomer.stats.avgOrderValue)}</p>
                    <p><span className="text-gray-600">Items Purchased:</span> {selectedCustomer.stats.itemsPurchased}</p>
                    <p><span className="text-gray-600">First Order:</span> {new Date(selectedCustomer.stats.firstOrderDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Last Order:</span> {new Date(selectedCustomer.stats.lastOrderDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* RFM Analysis */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">RFM Analysis</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Recency</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCustomer.rfm.recency}</p>
                    <p className="text-xs text-gray-500">How recent</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCustomer.rfm.frequency}</p>
                    <p className="text-xs text-gray-500">How often</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monetary</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCustomer.rfm.monetary}</p>
                    <p className="text-xs text-gray-500">How much</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Segment: <span className="font-medium">{selectedCustomer.rfm.segment}</span></p>
                </div>
              </div>

              {/* Addresses */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Addresses</h4>
                <div className="space-y-3">
                  {selectedCustomer.addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{address.name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          address.type === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {address.type}
                        </span>
                        {address.isDefault && <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}<br />
                        {address.city}, {address.state} {address.zip}<br />
                        {address.country}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Communication Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCustomer.preferences.email}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCustomer.preferences.sms}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCustomer.preferences.marketing}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Marketing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Language:</span>
                    <span className="font-medium">{selectedCustomer.preferences.language}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Mail className="h-4 w-4" />
                  Send Email
                </button>
                {selectedCustomer.phone && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    <Phone className="h-4 w-4" />
                    Send SMS
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  <Gift className="h-4 w-4" />
                  Send Coupon
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                  <Tag className="h-4 w-4" />
                  Add Tag
                </button>
                {selectedCustomer.isVip ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    <Crown className="h-4 w-4" />
                    Remove VIP
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                    <Crown className="h-4 w-4" />
                    Make VIP
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segment Manager Modal */}
      {showSegmentManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
                <button
                  onClick={() => setShowSegmentManager(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">Manage your customer segmentation rules and targeting strategies.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'VIP Customers', desc: 'High-value customers with 90+ RFM score', count: customers.filter(c => c.rfm.score === 'vip').length },
                    { name: 'Loyal Customers', desc: 'Regular purchasers with good engagement', count: customers.filter(c => c.rfm.score === 'loyal').length },
                    { name: 'At Risk Customers', desc: 'Declining engagement, needs re-engagement', count: customers.filter(c => c.rfm.score === 'at-risk').length },
                    { name: 'Lost Customers', desc: 'No purchases in 6+ months', count: customers.filter(c => c.rfm.score === 'lost').length },
                  ].map((segment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-1">{segment.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{segment.desc}</p>
                      <p className="text-lg font-bold text-blue-600">{segment.count} customers</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Create Campaign
                </button>
                <button
                  onClick={() => setShowSegmentManager(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Manager Modal */}
      {showVipManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">VIP Customer Management</h3>
                <button
                  onClick={() => setShowVipManager(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">Manage your VIP customers and exclusive benefits.</p>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">Current VIP Customers</h4>
                    <span className="text-purple-600 font-bold">{customers.filter(c => c.isVip).length}</span>
                  </div>
                  <p className="text-sm text-purple-700">These customers receive exclusive benefits and priority support.</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">VIP Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Free shipping on all orders',
                      'Early access to new products',
                      'Exclusive discounts and promotions',
                      'Priority customer support',
                      'Birthday gifts and rewards',
                      'Invitations to VIP events'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  Manage VIP Rules
                </button>
                <button
                  onClick={() => setShowVipManager(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
