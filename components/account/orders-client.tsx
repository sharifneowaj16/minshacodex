'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ORDER_STATUS } from '@/types/user';
import {
  ShoppingBag,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Search,
  Star,
  Download,
  RotateCcw,
} from 'lucide-react';

function ProductImage({ src, name }: { src: any; name: string }) {
  if (typeof src === 'string' && (src.startsWith('/') || src.startsWith('http'))) {
    return (
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover rounded-lg"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
        }}
      />
    );
  }
  if (src && typeof src === 'object') return src;
  return null;
}

interface OrderItem {
  id: string;
  productName: string;
  productImage: any;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  estimatedDelivery: Date;
  trackingNumber?: string;
  steadfastTrackingCode?: string;
  steadfastStatus?: string;
  userPhone?: string;
  canReview: boolean;
}

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getTrackingUrl = (order: Order): string => {
    if (order.steadfastTrackingCode) {
      return `/track?code=${order.steadfastTrackingCode}`;
    }
    return `/track?order=${order.orderNumber}&phone=${order.userPhone || ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Order History</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't placed any orders yet"}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {capitalize(order.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {capitalize(order.paymentStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">৳{order.total.toFixed(2)}</p>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <ProductImage src={item.productImage} name={item.productName} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-gray-900">৳{item.totalPrice.toFixed(2)}</p>
                        {order.canReview && (
                          <Link
                            href={`/account/reviews/write?productId=${item.id}&orderId=${order.id}`}
                            className="inline-flex items-center text-xs text-purple-600 hover:text-purple-500 mt-1"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {(order.steadfastTrackingCode || order.trackingNumber) && (
                    <a
                      href={getTrackingUrl(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Track Delivery
                    </a>
                  )}
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </button>
                  {(order.status === 'delivered' || order.status === 'shipped') && (
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Return
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { ORDER_STATUS } from '@/types/user';
// import { formatPrice } from '@/utils/currency';
// import {
//   ShoppingBag,
//   Calendar,
//   Truck,
//   CheckCircle,
//   XCircle,
//   Clock,
//   ChevronRight,
//   Search,
//   Package,
//   Star,
//   Download,
//   RotateCcw,
// } from 'lucide-react';

// // ✅ Smart image renderer — URL string → <img>, React element → render directly, else → icon
// function ProductImage({ src, name }: { src: any; name: string }) {
//   if (typeof src === 'string' && (src.startsWith('/') || src.startsWith('http'))) {
//     return (
//       <img
//         src={src}
//         alt={name}
//         className="w-full h-full object-cover rounded-lg"
//         onError={(e) => {
//           const el = e.target as HTMLImageElement;
//           el.style.display = 'none';
//           const fallback = el.parentElement?.querySelector('.img-fallback') as HTMLElement;
//           if (fallback) fallback.style.display = 'flex';
//         }}
//       />
//     );
//   }
//   if (src && typeof src === 'object') return src;
//   return null;
// }

// interface OrderItem {
//   id: string;
//   productName: string;
//   productImage: any;
//   quantity: number;
//   price: number;
//   totalPrice: number;
// }

// interface Order {
//   id: string;
//   orderNumber: string;
//   status: string;
//   paymentStatus: string;
//   items: OrderItem[];
//   total: number;
//   createdAt: Date;
//   estimatedDelivery: Date;
//   trackingNumber?: string;
//   steadfastTrackingCode?: string;
//   steadfastStatus?: string;
//   userPhone?: string;
//   canReview: boolean;
// }

// interface OrdersClientProps {
//   initialOrders: Order[];
// }

// export function OrdersClient({ initialOrders }: OrdersClientProps) {
//   const [orders] = useState(initialOrders);
//   const [filteredOrders, setFilteredOrders] = useState(initialOrders);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   useEffect(() => {
//     let filtered = orders;
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (order) =>
//           order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.items.some((item) =>
//             item.productName.toLowerCase().includes(searchTerm.toLowerCase())
//           )
//       );
//     }
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter((order) => order.status === statusFilter);
//     }
//     setFilteredOrders(filtered);
//   }, [orders, searchTerm, statusFilter]);

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
//       case 'processing': return <Clock className="w-5 h-5 text-yellow-500" />;
//       case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
//       default: return <Clock className="w-5 h-5 text-yellow-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'delivered': return 'bg-green-100 text-green-800';
//       case 'shipped': return 'bg-blue-100 text-blue-800';
//       case 'processing': return 'bg-yellow-100 text-yellow-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       case 'confirmed': return 'bg-indigo-100 text-indigo-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getPaymentStatusColor = (status: string) => {
//     switch (status) {
//       case 'paid': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'failed': return 'bg-red-100 text-red-800';
//       case 'refunded': return 'bg-purple-100 text-purple-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-1">Order History</h1>
//         <p className="text-gray-600">Track and manage your orders</p>
//       </div>

//       {/* Search & Filter */}
//       <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-3">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by order number or product name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//         >
//           <option value="all">All Status</option>
//           <option value="pending">Pending</option>
//           <option value="confirmed">Confirmed</option>
//           <option value="processing">Processing</option>
//           <option value="shipped">Shipped</option>
//           <option value="delivered">Delivered</option>
//           <option value="cancelled">Cancelled</option>
//         </select>
//       </div>

//       {/* Orders */}
//       {filteredOrders.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//           <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium mb-2">No orders found</h3>
//           <p className="text-gray-600 mb-6">
//             {searchTerm || statusFilter !== 'all'
//               ? 'Try adjusting your filters'
//               : "You haven't placed any orders yet"}
//           </p>
//           <Link
//             href="/shop"
//             className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//           >
//             Start Shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {filteredOrders.map((order) => (
//             <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
//               {/* Order Header */}
//               <div className="p-6 border-b border-gray-100">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div className="flex items-center space-x-3">
//                     {getStatusIcon(order.status)}
//                     <div>
//                       <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
//                       <div className="flex items-center space-x-2 mt-1">
//                         <Calendar className="w-3 h-3 text-gray-400" />
//                         <span className="text-sm text-gray-500">
//                           {new Date(order.createdAt).toLocaleDateString()}
//                         </span>
//                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
//                           {capitalize(order.status)}
//                         </span>
//                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
//                           {capitalize(order.paymentStatus)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="text-right">
//                       <p className="text-xs text-gray-500">Total</p>
//                       {/* ✅ formatPrice renders ৳ symbol */}
//                       <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
//                     </div>
//                     <Link
//                       href={`/account/orders/${order.id}`}
//                       className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
//                     >
//                       View Details
//                       <ChevronRight className="w-4 h-4 ml-1" />
//                     </Link>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="p-6 space-y-4">
//                 {order.items.map((item) => (
//                   <div key={item.id} className="flex items-center space-x-4">
//                     {/* ✅ Smart image container — shows <img> for URLs, fallback icon otherwise */}
//                     <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
//                       <ProductImage src={item.productImage} name={item.productName} />
//                       <div className="img-fallback w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
//                         <Package className="w-8 h-8 text-purple-400" />
//                       </div>
//                       {/* Emoji/icon fallback when no valid image */}
//                       {(!item.productImage ||
//                         (typeof item.productImage === 'string' &&
//                           !item.productImage.startsWith('/') &&
//                           !item.productImage.startsWith('http'))) && (
//                         <Package className="w-8 h-8 text-purple-400" />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
//                       {/* ✅ formatPrice for BDT ৳ */}
//                       <p className="text-sm text-gray-500">
//                         Qty: {item.quantity} × {formatPrice(item.price)}
//                       </p>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="font-medium text-gray-900">{formatPrice(item.totalPrice)}</p>
//                       {order.canReview && (
//                         <Link
//                           href={`/account/reviews/write?productId=${item.id}&orderId=${order.id}`}
//                           className="inline-flex items-center text-xs text-purple-600 hover:text-purple-500 mt-1"
//                         >
//                           <Star className="w-3 h-3 mr-1" />
//                           Write Review
//                         </Link>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="px-6 pb-6 flex flex-wrap gap-3">
//                 <div className="px-6 pb-6 flex flex-wrap gap-3">
//                   {(order.steadfastTrackingCode || order.trackingNumber) && (
    
//               href={
//                 order.steadfastTrackingCode
//               ? `/track?code=${order.steadfastTrackingCode}`
//               : `/track?order=${order.orderNumber}&phone=${order.userPhone || ''}`
//               }
//                   target="_blank"
//                   rel="noreferrer"
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
//                   >
//                   <Truck className="w-4 h-4 mr-2" />
//                   Track Delivery
//                 </a>
//                 )}
//                 <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
//                   <Download className="w-4 h-4 mr-2" />
//                   Download Invoice
//                 </button>
//                 {(order.status === 'delivered' || order.status === 'shipped') && (
//                   <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
//                     <RotateCcw className="w-4 h-4 mr-2" />
//                     Return/Exchange
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
