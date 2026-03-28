import { LoyaltyClient } from '@/components/account/loyalty-client';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getLoyaltyPageData } from '@/lib/account/pageData';

// ✅ FIX: icon as string, NOT React component
const loyaltyTiers = [
  {
    name: 'Customer',
    minPoints: 0,
    icon: 'Star', // string
    color: 'gray',
    benefits: ['1 point per $1 spent', 'Birthday bonus: 50 points', 'Standard customer support'],
  },
  {
    name: 'VIP',
    minPoints: 1000,
    icon: 'Heart', // string
    color: 'purple',
    benefits: ['1.2x points on all purchases', 'Birthday bonus: 100 points', 'Priority customer support', 'Exclusive access to sales', 'Free shipping on orders over $50'],
  },
  {
    name: 'Premium',
    minPoints: 5000,
    icon: 'Crown', // string
    color: 'yellow',
    benefits: ['1.5x points on all purchases', 'Birthday bonus: 200 points', 'Dedicated customer support', 'Early access to new products', 'Free shipping on all orders', 'Personal beauty consultant', 'Anniversary bonus: 150 points'],
  },
];

const rewards = [
  { id: '1', name: '$5 Off Coupon', points: 500, description: 'Get $5 off your next purchase', category: 'discount' },
  { id: '2', name: '$10 Off Coupon', points: 900, description: 'Get $10 off your next purchase', category: 'discount' },
  { id: '3', name: 'Free Shipping', points: 300, description: 'Free shipping on your next order', category: 'shipping' },
  { id: '4', name: 'Premium Face Serum', points: 2500, description: 'Redeem our premium face serum', category: 'product' },
  { id: '5', name: 'Beauty Box', points: 3000, description: 'Exclusive curated beauty box', category: 'product' },
];

export default async function LoyaltyPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/loyalty');
  }

  const loyaltyData = await getLoyaltyPageData(userId);
  if (!loyaltyData) {
    redirect('/login?redirect=/account/loyalty');
  }

  return (
    <LoyaltyClient
      userLoyalty={loyaltyData.userLoyalty}
      transactions={loyaltyData.transactions}
      loyaltyTiers={loyaltyTiers}
      rewards={rewards}
    />
  );
}

// import { LoyaltyClient } from '@/components/account/loyalty-client';
// import { Star, Heart, Crown } from 'lucide-react';
// import type { LoyaltyTransaction } from '@/types/user';

// const mockUserLoyalty = {
//   currentPoints: 2450,
//   lifetimePoints: 12500,
//   tier: 'vip',
//   nextTierPoints: 5000,
//   tierProgress: 49,
//   monthlyEarned: 320,
//   pointsExpiring: 150,
//   expiryDate: new Date('2024-02-28')
// };

// const mockTransactions: LoyaltyTransaction[] = [
//   { id: '1', type: 'earned', points: 100, description: 'Welcome bonus for signing up', createdAt: new Date('2023-01-15'), expiresAt: new Date('2024-01-15') },
//   { id: '2', type: 'earned', points: 50, description: 'Order #MB-2024-001', orderId: 'MB-2024-001', createdAt: new Date('2024-01-15') },
//   { id: '3', type: 'earned', points: 25, description: 'Product review for Premium Face Serum', createdAt: new Date('2024-01-10') },
//   { id: '4', type: 'redeemed', points: 500, description: '$5 off coupon', createdAt: new Date('2024-01-08') },
//   { id: '5', type: 'earned', points: 75, description: 'Order #MB-2024-002', orderId: 'MB-2024-002', createdAt: new Date('2024-01-05') },
//   { id: '6', type: 'earned', points: 1000, description: 'Successful referral: jane.smith@example.com', createdAt: new Date('2023-12-20') }
// ];

// const loyaltyTiers = [
//   { name: 'Customer', minPoints: 0, icon: Star, color: 'gray', benefits: ['1 point per $1 spent', 'Birthday bonus: 50 points', 'Standard customer support'] },
//   { name: 'VIP', minPoints: 1000, icon: Heart, color: 'purple', benefits: ['1.2x points on all purchases', 'Birthday bonus: 100 points', 'Priority customer support', 'Exclusive access to sales', 'Free shipping on orders over $50'] },
//   { name: 'Premium', minPoints: 5000, icon: Crown, color: 'yellow', benefits: ['1.5x points on all purchases', 'Birthday bonus: 200 points', 'Dedicated customer support', 'Early access to new products', 'Free shipping on all orders', 'Personal beauty consultant', 'Anniversary bonus: 150 points'] }
// ];

// const rewards = [
//   { id: '1', name: '$5 Off Coupon', points: 500, description: 'Get $5 off your next purchase', category: 'discount' },
//   { id: '2', name: '$10 Off Coupon', points: 900, description: 'Get $10 off your next purchase', category: 'discount' },
//   { id: '3', name: 'Free Shipping', points: 300, description: 'Free shipping on your next order', category: 'shipping' },
//   { id: '4', name: 'Premium Face Serum', points: 2500, description: 'Redeem our premium face serum', category: 'product' },
//   { id: '5', name: 'Beauty Box', points: 3000, description: 'Exclusive curated beauty box', category: 'product' }
// ];

// export default async function LoyaltyPage() {
//   return <LoyaltyClient userLoyalty={mockUserLoyalty} transactions={mockTransactions} loyaltyTiers={loyaltyTiers} rewards={rewards} />;
// }
