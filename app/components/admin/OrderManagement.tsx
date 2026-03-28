'use client';

import { useState, useEffect } from 'react';
import type { AdminOrder } from '@/types/admin';
import {
  Search,
  Plus,
  Filter,
  Printer,
  Truck,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Eye,
  Edit,
  Archive,
  Receipt
} from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus, selectedPaymentStatus, dateRange]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by payment status
    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    // Filter by date range
    const now = new Date();
    const filterDate = new Date();
    switch (dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
    }

    if (dateRange !== 'all') {
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const generateMockOrders = (): AdminOrder[] => {
    const statuses: AdminOrder['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses: AdminOrder['paymentStatus'][] = ['pending', 'paid', 'failed', 'refunded'];

    return Array.from({ length: 50 }, (_, i) => {
      const orderNumber = `ORD-${String(i + 1).padStart(5, '0')}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      return {
        id: `order-${i + 1}`,
        orderNumber,
        customer: {
          id: `customer-${Math.floor(Math.random() * 20) + 1}`,
          name: [
            'Sarah Johnson',
            'Emily Chen',
            'Maria Garcia',
            'Jessica Smith',
            'Ashley Wilson',
            'Amanda Brown',
            'Jennifer Davis',
            'Lisa Anderson'
          ][Math.floor(Math.random() * 8)],
          email: `customer${i + 1}@example.com`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        },
        status,
        paymentStatus,
        shippingAddress: {
          name: 'Home',
          street: `${123 + i} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
          zip: String(10000 + i),
          country: 'US',
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        },
        billingAddress: {
          name: 'Home',
          street: `${123 + i} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
          zip: String(10000 + i),
          country: 'US',
        },
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          id: `item-${i}-${j}`,
          productId: `P-${String(j + 1).padStart(3, '0')}`,
          name: [
            'Luxury Face Serum',
            'Hydrating Face Cream',
            'Anti-Aging Eye Cream',
            'Rose Face Oil',
            'Vitamin C Serum'
          ][j % 5],
          sku: `SKU-${String(j + 1).padStart(4, '0')}`,
          variant: `Size ${['30ml', '50ml', '100ml'][j % 3]}`,
          quantity: Math.floor(Math.random() * 2) + 1,
          price: Math.floor(Math.random() * 100) + 20,
          total: (Math.floor(Math.random() * 100) + 20) * (Math.floor(Math.random() * 2) + 1),
        })),
        pricing: {
          subtotal: Math.floor(Math.random() * 200) + 50,
          tax: Math.floor(Math.random() * 30) + 10,
          shipping: Math.floor(Math.random() * 15) + 5,
          discount: Math.floor(Math.random() * 20),
          total: Math.floor(Math.random() * 250) + 80,
          currency: 'USD',
        },
        shipping: {
          method: ['Standard Shipping', 'Express Shipping', 'Overnight'][Math.floor(Math.random() * 3)],
          tracking: status === 'shipped' || status === 'delivered' ? `TRK-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` : undefined,
          carrier: ['UPS', 'FedEx', 'USPS'][Math.floor(Math.random() * 3)],
          cost: Math.floor(Math.random() * 15) + 5,
          estimatedDelivery: status === 'shipped' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        },
        payment: {
          method: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay'][Math.floor(Math.random() * 4)],
          transactionId: paymentStatus === 'paid' ? `TXN-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` : undefined,
          gateway: ['Stripe', 'PayPal', 'Square'][Math.floor(Math.random() * 3)],
          paidAt: paymentStatus === 'paid' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        },
        notes: Math.random() > 0.7 ? 'Customer requested gift wrapping' : undefined,
        internalNotes: Math.random() > 0.8 ? 'VIP customer - expedite processing' : undefined,
        timeline: generateOrderTimeline(status),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
  };

  const generateOrderTimeline = (status: AdminOrder['status']) => {
    const now = new Date();
    const timeline = [
      {
        timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Order placed',
        note: 'Customer submitted order',
        actor: 'Customer',
      },
    ];

    if (status !== 'pending') {
      timeline.push({
        timestamp: new Date(now.getTime() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Order confirmed',
        note: 'Payment confirmed and order processed',
        actor: 'System',
      });
    }

    if (status === 'processing' || status === 'shipped' || status === 'delivered') {
      timeline.push({
        timestamp: new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Processing',
        note: 'Order is being prepared for shipment',
        actor: 'Warehouse',
      });
    }

    if (status === 'shipped' || status === 'delivered') {
      timeline.push({
        timestamp: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Shipped',
        note: 'Order has been shipped',
        actor: 'Carrier',
      });
    }

    if (status === 'delivered') {
      timeline.push({
        timestamp: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        note: 'Order delivered successfully',
        actor: 'Carrier',
      });
    }

    return timeline;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      case 'partially_refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const updateOrderStatus = async (orderId: string, newStatus: AdminOrder['status']) => {
    // Simulate API call
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const printInvoice = (order: AdminOrder) => {
    // Simulate print functionality
    window.print();
  };

  const printShippingLabel = (order: AdminOrder) => {
    // Simulate print functionality
    window.print();
  };

  const processRefund = async (order: AdminOrder) => {
    if (confirm(`Process full refund for order ${order.orderNumber}?`)) {
      // Simulate API call
      setOrders(prev => prev.map(o =>
        o.id === order.id
          ? { ...o, status: 'refunded', paymentStatus: 'refunded', updatedAt: new Date().toISOString() }
          : o
      ));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <RefreshCw className="h-4 w-4" />
            Sync Orders
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Printer className="h-4 w-4" />
            Bulk Print
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Orders</span>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending</span>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Processing</span>
            <Filter className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Shipped</span>
            <Truck className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Delivered</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-xs text-gray-600 truncate">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(order.pricing.total)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => printInvoice(order)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      {order.shipping.tracking && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Truck className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
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
                    <p><span className="text-gray-600">Name:</span> {selectedOrder.customer.name}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedOrder.customer.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedOrder.customer.phone}</p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="space-y-1 text-sm">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.pricing.shipping)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedOrder.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.pricing.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{event.status}</p>
                          <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-gray-600">{event.note}</p>
                        <p className="text-xs text-gray-400">by {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </button>
                {selectedOrder.status === 'shipped' && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    <Truck className="h-4 w-4" />
                    Print Shipping Label
                  </button>
                )}
                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'shipped') && (
                  <button
                    onClick={() => processRefund(selectedOrder)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Receipt className="h-4 w-4" />
                    Process Refund
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Filter className="h-4 w-4" />
                    Start Processing
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <Truck className="h-4 w-4" />
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
