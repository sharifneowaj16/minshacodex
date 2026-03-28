import { redirect } from 'next/navigation';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';
import { DashboardClient } from '@/components/account/dashboard-client';

// Fetch real dashboard data from DB
async function getDashboardData(userId: string) {
  const [recentOrders, wishlistCount, addressCount, user] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: { select: { quantity: true } },
      },
    }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, createdAt: true },
    }),
  ]);

  return {
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status.toLowerCase(),
      total: Number(o.total),
      createdAt: o.createdAt,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
    wishlistItems: wishlistCount,
    savedAddresses: addressCount,
    unreadNotifications: 0,
    upcomingOrderDate: new Date(),
    loyaltyPointsExpiring: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
}

// ✅ FIX: Pass icon names as strings, NOT as React components
// Client Component-এ function/component directly pass করা যায় না
const quickActions = [
  { name: 'Shop New Arrivals', description: 'Check out the latest products', href: '/shop?sort=newest', icon: 'ShoppingBag', color: 'purple' },
  { name: 'Write a Review', description: 'Share your experience', href: '/account/reviews', icon: 'Star', color: 'yellow' },
  { name: 'Refer a Friend', description: 'Earn 500 points per referral', href: '/account/referrals', icon: 'Users', color: 'blue' },
  { name: 'Update Profile', description: 'Keep your information current', href: '/account/settings', icon: 'MapPin', color: 'green' },
];

const upcomingFeatures = [
  { name: 'Personalized Recommendations', description: 'AI-powered product suggestions based on your preferences', icon: 'Star', progress: 80 },
  { name: 'Beauty Profile Quiz', description: 'Find the perfect products for your skin type', icon: 'BarChart3', progress: 60 },
  { name: 'Virtual Try-On', description: 'See how makeup looks before you buy', icon: 'Heart', progress: 40 },
];

export default async function AccountDashboard() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account');
  }

  const data = await getDashboardData(userId);

  return (
    <DashboardClient
      initialData={data}
      quickActions={quickActions}
      upcomingFeatures={upcomingFeatures}
    />
  );
}

// import { redirect } from 'next/navigation';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth/nextauth';
// import prisma from '@/lib/prisma';
// import { DashboardClient } from '@/components/account/dashboard-client';
// import { ShoppingBag, Star, BarChart3, Heart, MapPin, Users } from 'lucide-react';

// // Fetch real dashboard data from DB
// async function getDashboardData(userId: string) {
//   const [recentOrders, wishlistCount, addressCount, user] = await Promise.all([
//     prisma.order.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//       take: 5,
//       include: {
//         items: { select: { quantity: true } },
//       },
//     }),
//     prisma.wishlistItem.count({ where: { userId } }),
//     prisma.address.count({ where: { userId } }),
//     prisma.user.findUnique({
//       where: { id: userId },
//       select: { loyaltyPoints: true, createdAt: true },
//     }),
//   ]);

//   return {
//     recentOrders: recentOrders.map((o) => ({
//       id: o.id,
//       orderNumber: o.orderNumber,
//       status: o.status.toLowerCase(),
//       total: Number(o.total),
//       createdAt: o.createdAt,
//       itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
//     })),
//     wishlistItems: wishlistCount,
//     savedAddresses: addressCount,
//     unreadNotifications: 0,
//     upcomingOrderDate: new Date(),
//     loyaltyPointsExpiring: 0,
//     expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//   };
// }

// const quickActions = [
//   { name: 'Shop New Arrivals', description: 'Check out the latest products', href: '/shop?sort=newest', icon: ShoppingBag, color: 'purple' },
//   { name: 'Write a Review', description: 'Share your experience', href: '/account/reviews', icon: Star, color: 'yellow' },
//   { name: 'Refer a Friend', description: 'Earn 500 points per referral', href: '/account/referrals', icon: Users, color: 'blue' },
//   { name: 'Update Profile', description: 'Keep your information current', href: '/account/settings', icon: MapPin, color: 'green' },
// ];

// const upcomingFeatures = [
//   { name: 'Personalized Recommendations', description: 'AI-powered product suggestions based on your preferences', icon: Star, progress: 80 },
//   { name: 'Beauty Profile Quiz', description: 'Find the perfect products for your skin type', icon: BarChart3, progress: 60 },
//   { name: 'Virtual Try-On', description: 'See how makeup looks before you buy', icon: Heart, progress: 40 },
// ];

// export default async function AccountDashboard() {
//   // Try NextAuth session first
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     redirect('/login?redirect=/account');
//   }

//   const data = await getDashboardData(session.user.id);

//   return (
//     <DashboardClient
//       initialData={data}
//       quickActions={quickActions}
//       upcomingFeatures={upcomingFeatures}
//     />
//   );
// }
