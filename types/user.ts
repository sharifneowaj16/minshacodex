// User role and type definitions for Minsah Beauty

// Default currency for the application
export const DEFAULT_CURRENCY = 'BDT';

export interface UserAddress {
  id: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderTracking {
  timestamp: Date;
  status: 'ordered' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  location?: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: UserAddress;
  billingAddress: UserAddress;
  tracking: OrderTracking[];
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  orderId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Referral {
  id: string;
  referralCode: string;
  referredEmail?: string;
  referredName?: string;
  status: 'pending' | 'signed_up' | 'made_purchase' | 'completed';
  rewardPoints: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  addedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: 'customer' | 'vip' | 'premium';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    promotions: boolean;
    newProducts: boolean;
    orderUpdates: boolean;
  };
  addresses: UserAddress[];
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: string;
}

// User role definitions
export const USER_ROLES: Record<string, UserRole> = {
  customer: {
    id: 'customer',
    name: 'Customer',
    permissions: [
      'browse_products',
      'view_products',
      'add_to_cart',
      'purchase_products',
      'write_reviews',
      'manage_profile',
      'manage_addresses',
      'manage_wishlist',
      'view_orders',
      'track_orders'
    ]
  },
  vip: {
    id: 'vip',
    name: 'VIP Customer',
    permissions: [
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
      'priority_support'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Customer',
    permissions: [
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
      'anniversary_rewards'
    ]
  }
};

// Order status definitions
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'yellow', description: 'Order received, awaiting confirmation' },
  confirmed: { label: 'Confirmed', color: 'blue', description: 'Order confirmed, preparing for shipment' },
  processing: { label: 'Processing', color: 'indigo', description: 'Order is being prepared' },
  shipped: { label: 'Shipped', color: 'purple', description: 'Order has been shipped' },
  out_for_delivery: { label: 'Out for Delivery', color: 'orange', description: 'Order is out for delivery' },
  delivered: { label: 'Delivered', color: 'green', description: 'Order has been delivered' },
  cancelled: { label: 'Cancelled', color: 'red', description: 'Order has been cancelled' },
  refunded: { label: 'Refunded', color: 'gray', description: 'Order has been refunded' }
} as const;

// Loyalty points configuration
export const LOYALTY_CONFIG = {
  points_per_bdt: 1, // 1 point per 1 BDT spent
  points_for_signup: 100,
  points_for_review: 25,
  points_for_referral_signup: 500,
  points_for_referral_purchase: 1000,
  points_expiry_days: 365,
  redemption_rate: 100 // 100 points = ৳100 BDT
};

// User statistics
export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  loyaltyTier: string;
  referralCount: number;
  reviewCount: number;
  wishlistCount: number;
}
