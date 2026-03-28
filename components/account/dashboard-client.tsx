'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  Users,
  Truck,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Sparkles,
  Hand,
  ArrowRight,
} from 'lucide-react';
import { useAuth, useUserPermissions } from '@/contexts/AuthContext';

// ✅ Icon map — string থেকে component এ convert করার জন্য
// Server থেকে icon name string আসবে, এখানে সেটা render হবে
const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  Users,
  Truck,
  CheckCircle,
  BarChart3,
  Sparkles,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface DashboardData {
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    itemCount: number;
  }>;
  wishlistItems: number;
  savedAddresses: number;
  unreadNotifications: number;
  upcomingOrderDate: Date;
  loyaltyPointsExpiring: number;
  expiryDate: Date;
}

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: string; // ✅ string, not React component
  color: string;
}

interface UpcomingFeature {
  name: string;
  description: string;
  icon: string; // ✅ string, not React component
  progress: number;
}

interface DashboardClientProps {
  initialData: DashboardData;
  quickActions: QuickAction[];
  upcomingFeatures: UpcomingFeature[];
}

const colorMap: Record<string, { bg: string; text: string }> = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
};

export function DashboardClient({ initialData, quickActions, upcomingFeatures }: DashboardClientProps) {
  const { user } = useAuth();
  const { isVip, isPremium } = useUserPermissions();
  const [dashboardData] = useState(initialData);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <Hand className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-purple-100">
              {isPremium
                ? 'Thank you for being a Premium member! You have exclusive access to all our features.'
                : isVip
                ? 'Welcome back, VIP member! Enjoy your exclusive benefits.'
                : 'Your beauty journey continues here.'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <div className="text-sm text-purple-100 mb-1">Your Loyalty Points</div>
            <div className="text-3xl font-bold">{user.loyaltyPoints.toLocaleString()}</div>
            {dashboardData.loyaltyPointsExpiring > 0 && (
              <div className="text-xs text-yellow-200 mt-1">
                {dashboardData.loyaltyPointsExpiring} expiring {new Date(dashboardData.expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.recentOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Wishlist</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.wishlistItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reviews</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Addresses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.savedAddresses}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-purple-600 hover:text-purple-500 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="p-6">
            {dashboardData.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">এখনো কোনো order নেই</p>
                <Link href="/shop" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Shop করুন
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped' ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.itemCount} items • ৳{order.total.toFixed(0)} • {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    <Link href={`/account/orders/${order.id}`} className="p-2 text-gray-400 hover:text-purple-600 transition">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const colors = colorMap[action.color] || colorMap.purple;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
                  >
                    <div className={`inline-flex p-2 rounded-lg ${colors.bg} ${colors.text} mb-3 group-hover:scale-110 transition-transform`}>
                      {/* ✅ Icon name string থেকে component render */}
                      <DynamicIcon name={action.icon} className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition text-sm">
                      {action.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.loyaltyPointsExpiring > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Points Expiring Soon</h3>
              <p className="text-yellow-700 text-sm mt-1">
                আপনার {dashboardData.loyaltyPointsExpiring} points {new Date(dashboardData.expiryDate).toLocaleDateString()} এ expire হবে। এখনই use করুন!
              </p>
              <Link href="/account/loyalty" className="inline-flex items-center text-yellow-800 hover:text-yellow-600 text-sm font-medium mt-2">
                Points দেখুন
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Features */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature) => (
            <div key={feature.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {/* ✅ Icon name string থেকে component render */}
                <DynamicIcon name={feature.icon} className="w-6 h-6 text-purple-600" />
                <h3 className="font-medium text-gray-900 text-sm">{feature.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{feature.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Beauty Tip */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Beauty Tip of the Day
        </h2>
        <p className="text-gray-700 mb-4">
          Did you know? Applying serum to slightly damp skin can increase absorption by up to 50%. Pat your face gently with a towel after cleansing, then apply your serum while it&apos;s still slightly moist for maximum benefits!
        </p>
        <Link href="/blog" className="inline-flex items-center text-purple-600 hover:text-purple-500 font-medium gap-1">
          Read More Tips
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import {
//   ShoppingBag,
//   Heart,
//   MapPin,
//   Star,
//   Gift,
//   Users,
//   Truck,
//   CreditCard,
//   Clock,
//   CheckCircle,
//   AlertTriangle,
//   ChevronRight,
//   BarChart3,
//   Sparkles,
//   Hand,
//   ArrowRight
// } from 'lucide-react';
// import { useAuth, useUserPermissions } from '@/contexts/AuthContext';

// interface DashboardData {
//   recentOrders: Array<{
//     id: string;
//     orderNumber: string;
//     status: string;
//     total: number;
//     createdAt: Date;
//     itemCount: number;
//   }>;
//   wishlistItems: number;
//   savedAddresses: number;
//   unreadNotifications: number;
//   upcomingOrderDate: Date;
//   loyaltyPointsExpiring: number;
//   expiryDate: Date;
// }

// interface QuickAction {
//   name: string;
//   description: string;
//   href: string;
//   icon: any;
//   color: string;
// }

// interface UpcomingFeature {
//   name: string;
//   description: string;
//   icon: any;
//   progress: number;
// }

// interface DashboardClientProps {
//   initialData: DashboardData;
//   quickActions: QuickAction[];
//   upcomingFeatures: UpcomingFeature[];
// }

// export function DashboardClient({ initialData, quickActions, upcomingFeatures }: DashboardClientProps) {
//   const { user } = useAuth();
//   const { isVip, isPremium } = useUserPermissions();
//   const [dashboardData] = useState(initialData);

//   if (!user) {
//     return null; // Layout will handle the redirect
//   }

//   return (
//     <div className="space-y-6">
//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//           <div>
//             <div className="flex items-center">
//               <h1 className="text-3xl font-bold mb-2 mr-2">
//                 Welcome back, {user.firstName}!
//               </h1>
//               <Hand className="w-8 h-8 text-white animate-pulse" />
//             </div>
//             <p className="text-purple-100">
//               {isPremium
//                 ? 'Thank you for being a Premium member! You have exclusive access to all our features.'
//                 : isVip
//                 ? 'Welcome back, VIP member! Enjoy your exclusive benefits.'
//                 : 'Your beauty journey continues here.'}
//             </p>
//           </div>
//           <div className="mt-4 md:mt-0 text-center md:text-right">
//             <div className="text-sm text-purple-100 mb-1">Your Loyalty Points</div>
//             <div className="text-3xl font-bold">{user.loyaltyPoints.toLocaleString()}</div>
//             {dashboardData.loyaltyPointsExpiring > 0 && (
//               <div className="text-xs text-yellow-200 mt-1">
//                 {dashboardData.loyaltyPointsExpiring} expiring {dashboardData.expiryDate.toLocaleDateString()}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <ShoppingBag className="w-6 h-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Orders</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboardData.recentOrders.length + 8}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-pink-100 rounded-lg">
//               <Heart className="w-6 h-6 text-pink-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Wishlist Items</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboardData.wishlistItems}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-yellow-100 rounded-lg">
//               <Star className="w-6 h-6 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Reviews Written</p>
//               <p className="text-2xl font-bold text-gray-900">5</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <MapPin className="w-6 h-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Saved Addresses</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboardData.savedAddresses}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Orders */}
//         <div className="bg-white rounded-lg shadow-sm">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
//               <Link
//                 href="/account/orders"
//                 className="text-purple-600 hover:text-purple-500 text-sm font-medium"
//               >
//                 View All
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             {dashboardData.recentOrders.length === 0 ? (
//               <div className="text-center py-8">
//                 <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-4">No orders yet</p>
//                 <Link
//                   href="/shop"
//                   className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//                 >
//                   Start Shopping
//                 </Link>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {dashboardData.recentOrders.map((order) => (
//                   <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3">
//                         <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           order.status === 'delivered'
//                             ? 'bg-green-100 text-green-800'
//                             : order.status === 'shipped'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {order.status}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {order.itemCount} items • ${order.total.toFixed(2)} • {order.createdAt.toLocaleDateString()}
//                       </p>
//                     </div>
//                     <Link
//                       href={`/account/orders/${order.id}`}
//                       className="p-2 text-gray-400 hover:text-purple-600 transition"
//                     >
//                       <ChevronRight className="w-5 h-5" />
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white rounded-lg shadow-sm">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-2 gap-4">
//               {quickActions.map((action) => (
//                 <Link
//                   key={action.name}
//                   href={action.href}
//                   className="group p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
//                 >
//                   <div className={`inline-flex p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
//                     <action.icon className="w-5 h-5" />
//                   </div>
//                   <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition">
//                     {action.name}
//                   </h3>
//                   <p className="text-xs text-gray-600 mt-1">{action.description}</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Alerts and Notifications */}
//       {dashboardData.unreadNotifications > 0 || dashboardData.loyaltyPointsExpiring > 0 ? (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {dashboardData.loyaltyPointsExpiring > 0 && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//               <div className="flex items-start space-x-3">
//                 <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
//                 <div>
//                   <h3 className="font-medium text-yellow-800">Points Expiring Soon</h3>
//                   <p className="text-yellow-700 text-sm mt-1">
//                     You have {dashboardData.loyaltyPointsExpiring} points expiring on {dashboardData.expiryDate.toLocaleDateString()}. Use them before they expire!
//                   </p>
//                   <Link
//                     href="/account/loyalty"
//                     className="inline-flex items-center text-yellow-800 hover:text-yellow-600 text-sm font-medium mt-2"
//                   >
//                     View Rewards
//                     <ChevronRight className="w-4 h-4 ml-1" />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           )}

//           {dashboardData.unreadNotifications > 0 && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//               <div className="flex items-start space-x-3">
//                 <Gift className="w-5 h-5 text-blue-600 mt-0.5" />
//                 <div>
//                   <h3 className="font-medium text-blue-800">New Offers Available</h3>
//                   <p className="text-blue-700 text-sm mt-1">
//                     You have {dashboardData.unreadNotifications} new promotional offers tailored just for you.
//                   </p>
//                   <Link
//                     href="/shop?offers=true"
//                     className="inline-flex items-center text-blue-800 hover:text-blue-600 text-sm font-medium mt-2"
//                   >
//                     View Offers
//                     <ChevronRight className="w-4 h-4 ml-1" />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : null}

//       {/* Upcoming Features */}
//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-6">Coming Soon</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {upcomingFeatures.map((feature) => (
//             <div key={feature.name} className="border border-gray-200 rounded-lg p-4">
//               <div className="flex items-center space-x-3 mb-3">
//                 <feature.icon className="w-6 h-6 text-purple-600" />
//                 <h3 className="font-medium text-gray-900">{feature.name}</h3>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs text-gray-600">
//                   <span>Progress</span>
//                   <span>{feature.progress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-purple-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${feature.progress}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Beauty Tips */}
//       <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//           <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
//           Beauty Tip of the Day
//         </h2>
//         <p className="text-gray-700 mb-4">
//           Did you know? Applying serum to slightly damp skin can increase absorption by up to 50%. Pat your face gently with a towel after cleansing, then apply your serum while it's still slightly moist for maximum benefits!
//         </p>
//         <Link
//           href="/blog"
//           className="inline-flex items-center text-purple-600 hover:text-purple-500 font-medium"
//         >
//           Read More Tips
//           <ArrowRight className="w-4 h-4 ml-1" />
//         </Link>
//       </div>
//     </div>
//   );
// }
