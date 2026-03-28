'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
// 👇 নিচে AdminNotificationBell ইমপোর্ট করা হয়েছে 👇
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';
import {
  Home,
  ShoppingBag,
  Truck,
  Users,
  BarChart,
  Settings,
  FileText,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  Globe,
  MessageCircle,
  Smartphone,
  Mail,
  Megaphone,
  Sparkles,
  Minus,
} from 'lucide-react';

// Simple clsx alternative
const clsx = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Type definitions for menu items
interface MenuChild {
  title: string;
  href: string;
  permission?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: number;
  children?: MenuChild[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    permission: PERMISSIONS.DASHBOARD,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: ShoppingBag,
    permission: PERMISSIONS.PRODUCTS_VIEW,
    badge: 5,
    children: [
      { title: 'All Products', href: '/admin/products' },
      { title: 'Categories', href: '/admin/categories', permission: PERMISSIONS.CONTENT_MANAGE },
      { title: 'Inventory', href: '/admin/inventory' },
    ],
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: Truck,
    permission: PERMISSIONS.ORDERS_VIEW,
    badge: 12,
    children: [
      { title: 'All Orders', href: '/admin/orders' },
      { title: 'Processing', href: '/admin/orders?status=processing', permission: PERMISSIONS.ORDERS_PROCESS },
      { title: 'Returns', href: '/admin/orders/returns', permission: PERMISSIONS.ORDERS_REFUND },
    ],
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_VIEW,
    children: [
      { title: 'All Customers', href: '/admin/customers' },
      { title: 'Top Customers', href: '/admin/top-customers' },
    ],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
    permission: PERMISSIONS.ANALYTICS_VIEW,
    children: [
      { title: 'Overview', href: '/admin/analytics' },
      { title: 'Sales by Region', href: '/admin/sales-by-region' },
      { title: 'Tracking & Pixels', href: '/admin/tracking' },
      { title: 'Retargeting Audiences', href: '/admin/retargeting' },
      { title: 'Campaign Targeting', href: '/admin/campaign-targeting' },
    ],
  },
  {
    title: 'Marketing',
    href: '/admin/marketing',
    icon: Megaphone,
    permission: PERMISSIONS.CONTENT_MANAGE,
    badge: 5,
    children: [
      { title: 'Overview', href: '/admin/marketing' },
      { title: 'Social Media', href: '/admin/marketing?tab=social', icon: Globe },
      { title: 'Social Inbox', href: '/admin/marketing?tab=inbox', icon: MessageCircle, badge: 5 },
      { title: 'WhatsApp Business', href: '/admin/marketing?tab=whatsapp', icon: Smartphone },
      { title: 'Email Marketing', href: '/admin/marketing?tab=email', icon: Mail },
      { title: 'SMS Marketing', href: '/admin/marketing?tab=sms', icon: Smartphone },
      { title: 'Google Services', href: '/admin/marketing?tab=google', icon: Sparkles },
      { title: 'Coupons', href: '/admin/coupons' },
      { title: 'Promotions', href: '/admin/promotions' },
    ],
  },
  {
    title: 'Content',
    href: '/admin/content',
    icon: FileText,
    permission: PERMISSIONS.CONTENT_MANAGE,
    children: [
      { title: 'Home Sections', href: '/admin/home-sections' },
      { title: 'Blog Posts', href: '/admin/blog' },
      { title: 'FAQ', href: '/admin/faq' },
      { title: 'Reviews', href: '/admin/reviews' },
      { title: 'Banners', href: '/admin/banners' },
      { title: 'Pages', href: '/admin/pages' },
      { title: 'Media Library', href: '/admin/media' },
      { title: 'Contact Submissions', href: '/admin/contact' },
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: PERMISSIONS.USERS_MANAGE,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  // const [notifications, setNotifications] = useState(5); <-- এটি আর দরকার নেই কারণ AdminNotificationBell নিজেই নোটিফিকেশন হ্যান্ডেল করবে
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasPermission, isLoading } = useAdminAuth();

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, router, pathname]);

  // Auto-expand active menu items
  useEffect(() => {
    if (!user || isLoading) return; // Skip if not ready

    const activeItem = menuItems.find(item => {
      if (pathname === item.href) return true;
      if (item.children) {
        return item.children.some(child => pathname === child.href);
      }
      return false;
    });
    if (activeItem && activeItem.children) {
      setExpandedItems([activeItem.title]);
    }
  }, [pathname, user, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout if user is not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const filteredMenuItems = menuItems.filter(item => !item.permission || hasPermission(item.permission));

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Metronic Style */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-purple-600 font-bold text-lg">MB</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Minsah Beauty</h2>
                <p className="text-white/80 text-xs">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role?.replace('_', ' ') || 'Super Admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isExpanded = expandedItems.includes(item.title);
              const hasChildren = item.children && item.children.length > 0;
              const active = isActive(item.href);

              return (
                <div key={item.title}>
                  <Link
                    href={item.href}
                    onClick={(e: React.MouseEvent) => {
                      if (hasChildren) {
                        e.preventDefault();
                        toggleExpanded(item.title);
                      }
                    }}
                    className={clsx(
                      'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-l-4 border-purple-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon
                        className={clsx(
                          'w-5 h-5',
                          active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          className={clsx(
                            'w-4 h-4 transform transition-transform duration-200',
                            isExpanded ? 'rotate-180' : '',
                            active ? 'text-purple-600' : 'text-gray-400'
                          )}
                        />
                      )}
                    </div>
                  </Link>

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.children
                        ?.filter(child => !child.permission || hasPermission(child.permission))
                        .map((child) => {
                          const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={clsx(
                                'group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200',
                                childActive
                                  ? 'bg-purple-50 text-purple-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {child.icon && (
                                  <child.icon className="w-4 h-4 text-gray-400" />
                                )}
                                <span>{child.title}</span>
                              </div>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Top header - Metronic Style */}
        <header className="h-20 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-96 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">All Systems Operational</span>
              <Minus className="w-3 h-3 text-green-600 rotate-90" />
              <span className="text-xs text-green-600">Last sync: 2 min ago</span>
            </div>

            {/* 👇 এখানে আপনার স্ট্যাটিক বেল আইকনের বদলে AdminNotificationBell বসানো হয়েছে 👇 */}
            <AdminNotificationBell />
            {/* 👆 ------------------------------------------------------------- 👆 */}

            {/* User menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// ﻿'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
// import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
// import {
//   Home,
//   ShoppingBag,
//   Truck,
//   Users,
//   BarChart,
//   Settings,
//   FileText,
//   Tag,
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   Search,
//   Bell,
//   Globe,
//   MessageCircle,
//   Smartphone,
//   Mail,
//   Megaphone,
//   Sparkles,
//   Minus,
// } from 'lucide-react';
// // Simple clsx alternative
// const clsx = (...classes: (string | boolean | undefined | null)[]): string => {
//   return classes.filter(Boolean).join(' ');
// };

// // Type definitions for menu items
// interface MenuChild {
//   title: string;
//   href: string;
//   permission?: string;
//   icon?: React.ComponentType<{ className?: string }>;
//   badge?: number;
// }

// interface MenuItem {
//   title: string;
//   href: string;
//   icon: React.ComponentType<{ className?: string }>;
//   permission?: string;
//   badge?: number;
//   children?: MenuChild[];
// }

// const menuItems: MenuItem[] = [
//   {
//     title: 'Dashboard',
//     href: '/admin',
//     icon: Home,
//     permission: PERMISSIONS.DASHBOARD,
//   },
//   {
//     title: 'Products',
//     href: '/admin/products',
//     icon: ShoppingBag,
//     permission: PERMISSIONS.PRODUCTS_VIEW,
//     badge: 5,
//     children: [
//       { title: 'All Products', href: '/admin/products' },
//       { title: 'Categories', href: '/admin/categories', permission: PERMISSIONS.CONTENT_MANAGE },
//       { title: 'Inventory', href: '/admin/inventory' },
//     ],
//   },
//   {
//     title: 'Orders',
//     href: '/admin/orders',
//     icon: Truck,
//     permission: PERMISSIONS.ORDERS_VIEW,
//     badge: 12,
//     children: [
//       { title: 'All Orders', href: '/admin/orders' },
//       { title: 'Processing', href: '/admin/orders?status=processing', permission: PERMISSIONS.ORDERS_PROCESS },
//       { title: 'Returns', href: '/admin/orders/returns', permission: PERMISSIONS.ORDERS_REFUND },
//     ],
//   },
//   {
//     title: 'Customers',
//     href: '/admin/customers',
//     icon: Users,
//     permission: PERMISSIONS.CUSTOMERS_VIEW,
//     children: [
//       { title: 'All Customers', href: '/admin/customers' },
//       { title: 'Top Customers', href: '/admin/top-customers' },
//     ],
//   },
//   {
//     title: 'Analytics',
//     href: '/admin/analytics',
//     icon: BarChart,
//     permission: PERMISSIONS.ANALYTICS_VIEW,
//     children: [
//       { title: 'Overview', href: '/admin/analytics' },
//       { title: 'Sales by Region', href: '/admin/sales-by-region' },
//       { title: 'Tracking & Pixels', href: '/admin/tracking' },
//       { title: 'Retargeting Audiences', href: '/admin/retargeting' },
//       { title: 'Campaign Targeting', href: '/admin/campaign-targeting' },
//     ],
//   },
//   {
//     title: 'Marketing',
//     href: '/admin/marketing',
//     icon: Megaphone,
//     permission: PERMISSIONS.CONTENT_MANAGE,
//     badge: 5,
//     children: [
//       { title: 'Overview', href: '/admin/marketing' },
//       { title: 'Social Media', href: '/admin/marketing?tab=social', icon: Globe },
//       { title: 'Social Inbox', href: '/admin/marketing?tab=inbox', icon: MessageCircle, badge: 5 },
//       { title: 'WhatsApp Business', href: '/admin/marketing?tab=whatsapp', icon: Smartphone },
//       { title: 'Email Marketing', href: '/admin/marketing?tab=email', icon: Mail },
//       { title: 'SMS Marketing', href: '/admin/marketing?tab=sms', icon: Smartphone },
//       { title: 'Google Services', href: '/admin/marketing?tab=google', icon: Sparkles },
//       { title: 'Coupons', href: '/admin/coupons' },
//       { title: 'Promotions', href: '/admin/promotions' },
//     ],
//   },
//   {
//     title: 'Content',
//     href: '/admin/content',
//     icon: FileText,
//     permission: PERMISSIONS.CONTENT_MANAGE,
//     children: [
//       { title: 'Home Sections', href: '/admin/home-sections' },
//       { title: 'Blog Posts', href: '/admin/blog' },
//       { title: 'FAQ', href: '/admin/faq' },
//       { title: 'Reviews', href: '/admin/reviews' },
//       { title: 'Banners', href: '/admin/banners' },
//       { title: 'Pages', href: '/admin/pages' },
//       { title: 'Media Library', href: '/admin/media' },
//       { title: 'Contact Submissions', href: '/admin/contact' },
//     ],
//   },
//   {
//     title: 'Users',
//     href: '/admin/users',
//     icon: Users,
//     permission: PERMISSIONS.USERS_MANAGE,
//   },
//   {
//     title: 'Settings',
//     href: '/admin/settings',
//     icon: Settings,
//     permission: PERMISSIONS.SETTINGS_VIEW,
//   },
// ];

// interface AdminLayoutWrapperProps {
//   children: React.ReactNode;
// }

// export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [expandedItems, setExpandedItems] = useState<string[]>([]);
//   const [notifications, setNotifications] = useState(5);
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, logout, hasPermission, isLoading } = useAdminAuth();

//   // Redirect to login if not authenticated and not already on login page
//   useEffect(() => {
//     if (!isLoading && !user && pathname !== '/admin/login') {
//       router.push('/admin/login');
//     }
//   }, [user, isLoading, router, pathname]);

//   // Auto-expand active menu items
//   useEffect(() => {
//     if (!user || isLoading) return; // Skip if not ready

//     const activeItem = menuItems.find(item => {
//       if (pathname === item.href) return true;
//       if (item.children) {
//         return item.children.some(child => pathname === child.href);
//       }
//       return false;
//     });
//     if (activeItem && activeItem.children) {
//       setExpandedItems([activeItem.title]);
//     }
//   }, [pathname, user, isLoading]);

//   // Show loading state while checking authentication
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Don't render layout if user is not authenticated
//   if (!user) {
//     return null;
//   }

//   const handleLogout = () => {
//     logout();
//     router.push('/admin/login');
//   };

//   const toggleExpanded = (title: string) => {
//     setExpandedItems(prev =>
//       prev.includes(title)
//         ? prev.filter(item => item !== title)
//         : [...prev, title]
//     );
//   };

//   const filteredMenuItems = menuItems.filter(item => !item.permission || hasPermission(item.permission));

//   const isActive = (href: string) => {
//     if (href === '/admin') {
//       return pathname === href;
//     }
//     return pathname.startsWith(href);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar - Metronic Style */}
//       <aside
//         className={clsx(
//           'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
//           sidebarOpen ? 'block' : 'hidden lg:block'
//         )}
//       >
//         <div className="flex h-full flex-col">
//           {/* Logo */}
//           <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
//                 <span className="text-purple-600 font-bold text-lg">MB</span>
//               </div>
//               <div>
//                 <h2 className="text-white font-bold text-lg">Minsah Beauty</h2>
//                 <p className="text-white/80 text-xs">Admin Panel</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setSidebarOpen(false)}
//               className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* User info */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
//                 <span className="text-white font-semibold text-lg">
//                   {user?.name?.charAt(0).toUpperCase() || 'A'}
//                 </span>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-900 truncate">
//                   {user?.name || 'Admin User'}
//                 </p>
//                 <p className="text-xs text-gray-500 truncate capitalize">
//                   {user?.role?.replace('_', ' ') || 'Super Admin'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//             {filteredMenuItems.map((item) => {
//               const isExpanded = expandedItems.includes(item.title);
//               const hasChildren = item.children && item.children.length > 0;
//               const active = isActive(item.href);

//               return (
//                 <div key={item.title}>
//                   <Link
//                     href={item.href}
//                     onClick={(e: React.MouseEvent) => {
//                       if (hasChildren) {
//                         e.preventDefault();
//                         toggleExpanded(item.title);
//                       }
//                     }}
//                     className={clsx(
//                       'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
//                       active
//                         ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-l-4 border-purple-600 shadow-sm'
//                         : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
//                     )}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <item.icon
//                         className={clsx(
//                           'w-5 h-5',
//                           active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
//                         )}
//                       />
//                       <span>{item.title}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {item.badge && (
//                         <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
//                           {item.badge}
//                         </span>
//                       )}
//                       {hasChildren && (
//                         <ChevronDown
//                           className={clsx(
//                             'w-4 h-4 transform transition-transform duration-200',
//                             isExpanded ? 'rotate-180' : '',
//                             active ? 'text-purple-600' : 'text-gray-400'
//                           )}
//                         />
//                       )}
//                     </div>
//                   </Link>

//                   {/* Submenu */}
//                   {hasChildren && isExpanded && (
//                     <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
//                       {item.children
//                         ?.filter(child => !child.permission || hasPermission(child.permission))
//                         .map((child) => {
//                           const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
//                           return (
//                             <Link
//                               key={child.href}
//                               href={child.href}
//                               className={clsx(
//                                 'group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200',
//                                 childActive
//                                   ? 'bg-purple-50 text-purple-700 font-medium'
//                                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                               )}
//                             >
//                               <div className="flex items-center gap-2">
//                                 {child.icon && (
//                                   <child.icon className="w-4 h-4 text-gray-400" />
//                                 )}
//                                 <span>{child.title}</span>
//                               </div>
//                               {child.badge && (
//                                 <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
//                                   {child.badge}
//                                 </span>
//                               )}
//                             </Link>
//                           );
//                         })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>

//           {/* Logout */}
//           <div className="border-t border-gray-200 p-4">
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//             >
//               <LogOut className="w-5 h-5" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
//         {/* Top header - Metronic Style */}
//         <header className="h-20 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
//             >
//               <Menu className="w-6 h-6" />
//             </button>

//             {/* Search */}
//             <div className="hidden md:block relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search products, orders, customers..."
//                 className="w-96 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* System Status */}
//             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-xs font-medium text-green-700">All Systems Operational</span>
//               <Minus className="w-3 h-3 text-green-600 rotate-90" />
//               <span className="text-xs text-green-600">Last sync: 2 min ago</span>
//             </div>

//             {/* Notifications */}
//             <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
//               <Bell className="w-6 h-6" />
//               {notifications > 0 && (
//                 <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-semibold">
//                   {notifications}
//                 </span>
//               )}
//             </button>

//             {/* User menu */}
//             <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
//                 <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
//               </div>
//               <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
//                 <span className="text-white font-semibold">
//                   {user?.name?.charAt(0).toUpperCase() || 'A'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
