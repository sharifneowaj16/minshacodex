'use client';

import { useState, useEffect } from 'react';
import type { AdminInventory, AdminSupplier, AdminPurchaseOrder } from '@/types/admin';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Truck,
  Clock,
  X,
  Edit,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  DollarSign,
  Building,
  Users,
  FileText,
  Printer,
  Star
} from 'lucide-react';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<AdminInventory[]>([]);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<AdminPurchaseOrder[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<AdminInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'purchase-orders'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<AdminInventory | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<AdminSupplier | null>(null);
  const [selectedPO, setSelectedPO] = useState<AdminPurchaseOrder | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchQuery, selectedLocation, stockFilter, sortBy]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockInventoryData();
      setInventory(mockData.inventory);
      setSuppliers(mockData.suppliers);
      setPurchaseOrders(mockData.purchaseOrders);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockInventoryData = () => {
    // Mock inventory items
    const inventory = Array.from({ length: 50 }, (_, i) => ({
      id: `INV-${String(i + 1).padStart(4, '0')}`,
      productId: `P-${String(i + 1).padStart(3, '0')}`,
      variantId: i % 3 === 0 ? `V-${String(i).padStart(2, '0')}` : undefined,
      location: ['Warehouse A', 'Warehouse B', 'Store Front', 'Main Office'][i % 4],
      quantity: Math.floor(Math.random() * 200),
      reserved: Math.floor(Math.random() * 20),
      available: 0,
      lowStockThreshold: Math.floor(Math.random() * 30) + 10,
      reorderPoint: Math.floor(Math.random() * 40) + 20,
      reorderQuantity: Math.floor(Math.random() * 100) + 50,
      unitCost: Math.floor(Math.random() * 50) + 10,
      supplier: `SUP-${String(Math.floor(i / 5) + 1).padStart(3, '0')}`,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      movements: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
        id: `MOV-${i}-${j}`,
        type: ['in', 'out', 'transfer', 'adjustment'][Math.floor(Math.random() * 4)] as any,
        quantity: Math.floor(Math.random() * 50) + 1,
        reason: ['Purchase', 'Sale', 'Transfer', 'Adjustment', 'Return'][Math.floor(Math.random() * 5)],
        reference: `REF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        location: ['Warehouse A', 'Warehouse B', 'Store Front'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    })).map(item => ({
      ...item,
      available: item.quantity - item.reserved,
    }));

    // Mock suppliers
    const suppliers = Array.from({ length: 10 }, (_, i) => ({
      id: `SUP-${String(i + 1).padStart(3, '0')}`,
      name: [
        'Beauty Supplies Inc.',
        'Cosmetics Wholesale Co.',
        'Skincare Ingredients Ltd.',
        'Premium Beauty Products',
        'Natural Beauty Supply',
      ][i % 5],
      contactPerson: [
        'John Smith',
        'Sarah Johnson',
        'Michael Chen',
        'Emily Davis',
        'Robert Wilson',
      ][i % 5],
      email: `contact${i + 1}@supplier${i + 1}.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: {
        street: `${123 + i} Supplier St`,
        city: ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix'][i % 5],
        state: ['CA', 'NY', 'IL', 'TX', 'AZ'][i % 5],
        zip: String(10000 + i),
        country: 'US',
      },
      website: `https://supplier${i + 1}.com`,
      taxId: `TX-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      paymentTerms: ['Net 30', 'Net 60', 'Net 90', 'COD'][Math.floor(Math.random() * 4)],
      notes: `Supplier notes for ${i + 1}`,
      products: inventory.slice(i * 5, (i + 1) * 5).map(item => item.productId),
      rating: Math.random() * 2 + 3,
      isActive: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    // Mock purchase orders
    const purchaseOrders = Array.from({ length: 20 }, (_, i) => ({
      id: `PO-${String(i + 1).padStart(4, '0')}`,
      orderNumber: `PO-${String(i + 1).padStart(6, '0')}`,
      supplier: {
        id: suppliers[Math.floor(Math.random() * suppliers.length)].id,
        name: suppliers[Math.floor(Math.random() * suppliers.length)].name,
      },
      status: ['draft', 'sent', 'confirmed', 'received', 'cancelled'][Math.floor(Math.random() * 5)] as any,
      items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        productId: inventory[Math.floor(Math.random() * inventory.length)].productId,
        name: [
          'Luxury Face Serum',
          'Hydrating Face Cream',
          'Anti-Aging Eye Cream',
          'Rose Face Oil',
          'Vitamin C Serum'
        ][j % 5],
        sku: `SKU-${String(j + 1).padStart(4, '0')}`,
        quantity: Math.floor(Math.random() * 100) + 10,
        unitCost: Math.floor(Math.random() * 30) + 10,
        total: 0,
      })).map(item => ({
        ...item,
        total: item.quantity * item.unitCost,
      })),
      totals: {
        subtotal: 0,
        tax: 0,
        shipping: Math.floor(Math.random() * 50) + 10,
        total: 0,
        currency: 'USD',
      },
      shipping: {
        method: ['Standard', 'Express', 'Overnight'][Math.floor(Math.random() * 3)],
        cost: Math.floor(Math.random() * 50) + 10,
        tracking: Math.random() > 0.5 ? `TRK-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` : undefined,
      },
      payment: {
        method: ['Wire Transfer', 'Check', 'Credit Card', 'ACH'][Math.floor(Math.random() * 4)],
        terms: ['Net 30', 'Net 60', 'Net 90', 'COD'][Math.floor(Math.random() * 4)],
        dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        paid: Math.random() > 0.5,
        paidAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      },
      notes: Math.random() > 0.7 ? `Purchase order notes for ${i + 1}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      expectedDelivery: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })).map(po => ({
      ...po,
      totals: {
        ...po.totals,
        subtotal: po.items.reduce((sum, item) => sum + item.total, 0),
        tax: Math.floor(po.items.reduce((sum, item) => sum + item.total, 0) * 0.1),
      },
    })).map(po => ({
      ...po,
      totals: {
        ...po.totals,
        total: po.totals.subtotal + po.totals.tax + po.totals.shipping,
      },
    }));

    return { inventory, suppliers, purchaseOrders };
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }

    // Filter by stock status
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.quantity <= item.lowStockThreshold);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.quantity === 0);
    } else if (stockFilter === 'available') {
      filtered = filtered.filter(item => item.available > 0);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productId.localeCompare(b.productId);
        case 'quantity':
          return a.quantity - b.quantity;
        case 'available':
          return a.available - b.available;
        case 'location':
          return a.location.localeCompare(b.location);
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    setFilteredInventory(filtered);
  };

  const getStockStatus = (item: AdminInventory) => {
    if (item.quantity === 0) return { color: 'text-red-600 bg-red-100', text: 'Out of Stock', icon: X };
    if (item.quantity <= item.lowStockThreshold) return { color: 'text-yellow-600 bg-yellow-100', text: 'Low Stock', icon: AlertTriangle };
    return { color: 'text-green-600 bg-green-100', text: 'In Stock', icon: CheckCircle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateLowStockAlerts = () => {
    return inventory.filter(item => item.quantity <= item.lowStockThreshold && item.quantity > 0);
  };

  const calculateOutOfStock = () => {
    return inventory.filter(item => item.quantity === 0);
  };

  const calculateTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.quantity * item.unitCost), 0);
  };

  const handleCreatePurchaseOrder = () => {
    setShowCreatePO(true);
  };

  const handleReorderItem = (item: AdminInventory) => {
    console.log('Reordering item:', item);
    alert(`Creating purchase order for ${item.productId} - Quantity: ${item.reorderQuantity}`);
  };

  const handleBulkReorder = () => {
    if (selectedItems.length === 0) return;
    alert(`Creating bulk purchase order for ${selectedItems.length} items`);
    setSelectedItems([]);
  };

  const handleStockAdjustment = (itemId: string, adjustment: number, reason: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + adjustment);
        return {
          ...item,
          quantity: newQuantity,
          available: newQuantity - item.reserved,
          lastUpdated: new Date().toISOString(),
          movements: [
            {
              id: `ADJ-${Date.now()}`,
              type: 'adjustment' as const,
              quantity: Math.abs(adjustment),
              reason,
              timestamp: new Date().toISOString(),
              location: item.location,
            },
            ...item.movements,
          ],
        };
      }
      return item;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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

  const lowStockAlerts = calculateLowStockAlerts();
  const outOfStock = calculateOutOfStock();
  const totalValue = calculateTotalInventoryValue();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage stock levels, suppliers, and purchase orders</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'inventory' && (
            <>
              <button
                onClick={() => setShowLowStockAlert(true)}
                className="flex items-center gap-2 px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                Low Stock Alerts ({lowStockAlerts.length})
              </button>
              <button
                onClick={handleCreatePurchaseOrder}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Purchase Order
              </button>
            </>
          )}
          {activeTab === 'suppliers' && (
            <button
              onClick={() => setShowAddSupplier(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'inventory', name: 'Inventory', icon: Archive },
            { id: 'suppliers', name: 'Suppliers', icon: Building },
            { id: 'purchase-orders', name: 'Purchase Orders', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Items</span>
                <Archive className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              <p className="text-xs text-gray-500 mt-1">Across all locations</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Value</span>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">At cost</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Low Stock</span>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{lowStockAlerts.length}</p>
              <p className="text-xs text-gray-500 mt-1">Need reordering</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Out of Stock</span>
                <X className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{outOfStock.length}</p>
              <p className="text-xs text-gray-500 mt-1">Items unavailable</p>
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
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Locations</option>
                <option value="Warehouse A">Warehouse A</option>
                <option value="Warehouse B">Warehouse B</option>
                <option value="Store Front">Store Front</option>
                <option value="Main Office">Main Office</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Stock Levels</option>
                <option value="available">Available</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="name">Sort by Product</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="available">Sort by Available</option>
                <option value="location">Sort by Location</option>
                <option value="updated">Sort by Updated</option>
              </select>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Apply Filters
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} items selected
                  </span>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkReorder}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Truck className="h-4 w-4 inline mr-1" />
                    Bulk Reorder
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredInventory.length}
                        onChange={() => setSelectedItems(selectedItems.length === filteredInventory.length ? [] : filteredInventory.map(item => item.id))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const isSelected = selectedItems.includes(item.id);
                    const StatusIcon = stockStatus.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedItems(prev =>
                              prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                            )}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.productId}</p>
                            {item.variantId && <p className="text-xs text-gray-500">{item.variantId}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                            {item.quantity <= item.lowStockThreshold && item.quantity > 0 && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.available}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.reserved}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unitCost)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${stockStatus.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedInventory(item)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReorderItem(item)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Reorder"
                            >
                              <RefreshCw className="h-4 w-4" />
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
        </>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {supplier.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {supplier.phone}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Products:</span> {supplier.products.length}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Rating:</span>
                    <span className="ml-1 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-1">{supplier.rating.toFixed(1)}</span>
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedSupplier(supplier)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase-orders' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{po.orderNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{po.supplier.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{po.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(po.totals.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Alerts Modal */}
      {showLowStockAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
                <button
                  onClick={() => setShowLowStockAlert(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {lowStockAlerts.map((item) => (
                  <div key={item.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h4 className="font-medium text-gray-900">{item.productId}</h4>
                      </div>
                      <span className="text-orange-600 font-medium">{item.quantity} units left</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-1 font-medium">{item.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reorder Point:</span>
                        <span className="ml-1 font-medium">{item.reorderPoint}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reorder Qty:</span>
                        <span className="ml-1 font-medium">{item.reorderQuantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Unit Cost:</span>
                        <span className="ml-1 font-medium">{formatCurrency(item.unitCost)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReorderItem(item)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Reorder Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Details Modal */}
      {selectedInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Details</h3>
                <button
                  onClick={() => setSelectedInventory(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Inventory Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Product ID:</span> {selectedInventory.productId}</p>
                    <p><span className="text-gray-600">Location:</span> {selectedInventory.location}</p>
                    <p><span className="text-gray-600">Current Stock:</span> {selectedInventory.quantity}</p>
                    <p><span className="text-gray-600">Available:</span> {selectedInventory.available}</p>
                    <p><span className="text-gray-600">Reserved:</span> {selectedInventory.reserved}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Reorder Settings</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Low Stock Threshold:</span> {selectedInventory.lowStockThreshold}</p>
                    <p><span className="text-gray-600">Reorder Point:</span> {selectedInventory.reorderPoint}</p>
                    <p><span className="text-gray-600">Reorder Quantity:</span> {selectedInventory.reorderQuantity}</p>
                    <p><span className="text-gray-600">Unit Cost:</span> {formatCurrency(selectedInventory.unitCost)}</p>
                    <p><span className="text-gray-600">Total Value:</span> {formatCurrency(selectedInventory.quantity * selectedInventory.unitCost)}</p>
                  </div>
                </div>
              </div>

              {/* Stock Movements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Movements</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInventory.movements.map((movement) => (
                        <tr key={movement.id}>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              movement.type === 'in' ? 'bg-green-100 text-green-800' :
                              movement.type === 'out' ? 'bg-red-100 text-red-800' :
                              movement.type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {movement.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{movement.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{movement.reason}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{movement.reference}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(movement.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Adjustment */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Stock Adjustment</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Adjustment quantity"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Reason for adjustment"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Adjust Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Supplier</h3>
                <button
                  onClick={() => setShowAddSupplier(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Net 90</option>
                    <option>COD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Add Supplier
                </button>
                <button
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
