import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'customer' | 'vip' | 'premium';
  status: string;
  emailVerified: boolean;
  loyaltyPoints: number;
  referralCode: string | null;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    promotions: boolean;
    newProducts: boolean;
    orderUpdates: boolean;
  };
}

/**
 * Verify authentication token and return user data
 * This is a server-side only function
 */
export async function verifyAuthToken(token: string): Promise<User | null> {
  try {
    // Call your API to verify the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get the current authenticated user from cookies
 * This is a server-side only function
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  return await verifyAuthToken(token);
}

/**
 * Check if user has a specific permission based on role
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  const rolePermissions: Record<string, string[]> = {
    customer: [
      'browse_products',
      'view_products',
      'add_to_cart',
      'purchase_products',
      'write_reviews',
      'manage_profile',
      'manage_addresses',
      'manage_wishlist',
      'view_orders',
      'track_orders',
    ],
    vip: [
      'browse_products',
      'view_products',
      'add_to_cart',
      'purchase_products',
      'write_reviews',
      'manage_profile',
      'manage_addresses',
      'manage_wishlist',
      'view_orders',
      'track_orders',
      'exclusive_deals',
      'early_access',
      'free_shipping',
      'priority_support',
    ],
    premium: [
      'browse_products',
      'view_products',
      'add_to_cart',
      'purchase_products',
      'write_reviews',
      'manage_profile',
      'manage_addresses',
      'manage_wishlist',
      'view_orders',
      'track_orders',
      'exclusive_deals',
      'early_access',
      'free_shipping',
      'priority_support',
      'personal_stylist',
      'birthday_rewards',
      'anniversary_rewards',
    ],
  };

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Get user permissions flags
 */
export function getUserPermissions(user: User | null) {
  return {
    canBrowseProducts: hasPermission(user, 'browse_products'),
    canViewProducts: hasPermission(user, 'view_products'),
    canAddToCart: hasPermission(user, 'add_to_cart'),
    canPurchase: hasPermission(user, 'purchase_products'),
    canWriteReviews: hasPermission(user, 'write_reviews'),
    canManageProfile: hasPermission(user, 'manage_profile'),
    canManageAddresses: hasPermission(user, 'manage_addresses'),
    canManageWishlist: hasPermission(user, 'manage_wishlist'),
    canViewOrders: hasPermission(user, 'view_orders'),
    canTrackOrders: hasPermission(user, 'track_orders'),
    hasExclusiveDeals: hasPermission(user, 'exclusive_deals'),
    hasEarlyAccess: hasPermission(user, 'early_access'),
    hasFreeShipping: hasPermission(user, 'free_shipping'),
    hasPrioritySupport: hasPermission(user, 'priority_support'),
    hasPersonalStylist: hasPermission(user, 'personal_stylist'),
    hasBirthdayRewards: hasPermission(user, 'birthday_rewards'),
    hasAnniversaryRewards: hasPermission(user, 'anniversary_rewards'),
    isVip: user?.role === 'vip' || user?.role === 'premium',
    isPremium: user?.role === 'premium',
  };
}
