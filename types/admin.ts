// Admin Panel TypeScript Interfaces
// Next.js 16 + React 19 + TypeScript + Tailwind CSS 4

export interface AdminDashboardStats {
  revenue: {
    total: number;
    change: number;
    chartData: Array<{ date: string; revenue: number; orders: number }>;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    change: number;
    recentOrders: Array<{
      id: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
    }>;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    vip: number;
    change: number;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  traffic: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgSession: number;
    sources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
  };
  lowStockAlerts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    salesRate: number;
  }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  cost: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  category: {
    id: string;
    name: string;
    subcategory?: string;
  };
  brand: string;
  tags: string[];
  variants: AdminProductVariant[];
  images: AdminProductImage[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
    location?: string;
  };
  shipping: {
    requiresShipping: boolean;
    weightUnit: string;
    originCountry: string;
  };
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  sales: number;
  views: number;
  rating: number;
  reviews: number;
}

export interface AdminProductVariant {
  id: string;
  name: string;
  options: Record<string, string>;
  price: number;
  sku: string;
  barcode?: string;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
  };
  image?: string;
  weight?: number;
}

export interface AdminProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isMain: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parent?: string;
  children: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    sku: string;
    variant?: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  shipping: {
    method: string;
    tracking?: string;
    carrier?: string;
    cost: number;
    estimatedDelivery?: string;
  };
  payment: {
    method: string;
    transactionId?: string;
    gateway: string;
    paidAt?: string;
  };
  notes?: string;
  internalNotes?: string;
  timeline: Array<{
    timestamp: string;
    status: string;
    note: string;
    actor: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: Array<{
    id: string;
    type: 'shipping' | 'billing';
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences: {
    language: string;
    currency: string;
    marketing: boolean;
    sms: boolean;
    email: boolean;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    firstOrderDate: string;
    lastOrderDate: string;
    itemsPurchased: number;
  };
  rfm: {
    recency: number;
    frequency: number;
    monetary: number;
    score: 'vip' | 'loyal' | 'at-risk' | 'lost' | 'new';
    segment: string;
  };
  tags: string[];
  notes?: string;
  isVip: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInventory {
  id: string;
  productId: string;
  variantId?: string;
  location: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  supplier?: string;
  lastUpdated: string;
  movements: Array<{
    id: string;
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    reason: string;
    reference?: string;
    location?: string;
    timestamp: string;
  }>;
}

export interface AdminSupplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  website?: string;
  taxId?: string;
  paymentTerms: string;
  notes?: string;
  products: string[];
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    id: string;
    name: string;
  };
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitCost: number;
    total: number;
    expectedDelivery?: string;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  };
  shipping: {
    method: string;
    cost: number;
    tracking?: string;
  };
  payment: {
    method: string;
    terms: string;
    dueDate: string;
    paid?: boolean;
    paidAt?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expectedDelivery?: string;
}

export interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'twitter' | 'linkedin';
  type: 'post' | 'story' | 'reel' | 'video' | 'pin' | 'tweet';
  content: {
    text: string;
    media?: Array<{
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    }>;
    hashtags: string[];
    mentions: string[];
  };
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagement: number;
    reach: number;
  };
  targeting?: {
    ageRange: [number, number];
    gender: string[];
    locations: string[];
    interests: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  pageId?: string;
  accessToken: string;
  refreshToken?: string;
  isConnected: boolean;
  lastSync?: string;
  metrics: {
    followers: number;
    posts: number;
    engagement: number;
    reach: number;
  };
  settings: {
    autoPublish: boolean;
    defaultHashtags: string[];
    postingSchedule: Array<{
      day: string;
      time: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads' | 'sms' | 'push';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget?: number;
  spent?: number;
  duration: {
    start: string;
    end?: string;
  };
  targetAudience: {
    segments: string[];
    criteria: Record<string, any>;
  };
  content: {
    subject?: string;
    body: string;
    media?: Array<{
      type: string;
      url: string;
    }>;
    cta?: {
      text: string;
      url: string;
    };
  };
  metrics: {
    sent?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    converted?: number;
    cost?: number;
    roas?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data generators
export function generateMockAdminStats(): AdminDashboardStats {
  const now = new Date();
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 50) + 20,
    };
  });

  return {
    revenue: {
      total: 145680,
      change: 12.5,
      chartData,
    },
    orders: {
      total: 2341,
      pending: 23,
      completed: 2289,
      change: 8.3,
      recentOrders: [
        {
          id: 'ORD-001',
          customer: 'Sarah Johnson',
          amount: 89.99,
          status: 'confirmed',
          date: new Date().toISOString(),
        },
        {
          id: 'ORD-002',
          customer: 'Emily Chen',
          amount: 124.50,
          status: 'processing',
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'ORD-003',
          customer: 'Maria Garcia',
          amount: 67.25,
          status: 'shipped',
          date: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    },
    customers: {
      total: 12450,
      new: 234,
      active: 8456,
      vip: 156,
      change: 15.2,
    },
    products: {
      total: 456,
      inStock: 389,
      lowStock: 23,
      outOfStock: 44,
      topProducts: [
        {
          id: 'P-001',
          name: 'Luxury Face Serum',
          sales: 234,
          revenue: 23400,
          trend: 'up',
        },
        {
          id: 'P-002',
          name: 'Hydrating Face Cream',
          sales: 189,
          revenue: 11340,
          trend: 'stable',
        },
        {
          id: 'P-003',
          name: 'Anti-Aging Eye Cream',
          sales: 156,
          revenue: 23400,
          trend: 'up',
        },
      ],
    },
    traffic: {
      visitors: 45678,
      pageViews: 123456,
      bounceRate: 32.5,
      avgSession: 4.2,
      sources: [
        { source: 'Organic Search', visitors: 15678, percentage: 34.3 },
        { source: 'Direct', visitors: 12345, percentage: 27.0 },
        { source: 'Social Media', visitors: 8901, percentage: 19.5 },
        { source: 'Referral', visitors: 5432, percentage: 11.9 },
        { source: 'Paid Ads', visitors: 3322, percentage: 7.3 },
      ],
    },
    lowStockAlerts: [
      {
        id: 'P-101',
        name: 'Rose Face Oil',
        currentStock: 5,
        minStock: 20,
        salesRate: 15,
      },
      {
        id: 'P-102',
        name: 'Vitamin C Serum',
        currentStock: 8,
        minStock: 25,
        salesRate: 20,
      },
      {
        id: 'P-103',
        name: 'Collagen Mask',
        currentStock: 12,
        minStock: 30,
        salesRate: 18,
      },
    ],
  };
}

export function generateMockProducts(): AdminProduct[] {
  // Products loaded from database
  return [];
}

export function generateMockCustomers(): AdminCustomer[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `C-${String(i + 1).padStart(4, '0')}`,
    name: [
      'Sarah Johnson',
      'Emily Chen',
      'Maria Garcia',
      'Jessica Smith',
      'Ashley Wilson',
    ][i % 5],
    email: `customer${i + 1}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    avatar: `https://example.com/avatar-${i}.jpg`,
    addresses: [
      {
        id: `ADDR-${i}-1`,
        type: 'shipping' as const,
        name: ['Home', 'Office'][i % 2],
        street: `${123 + i} Main St`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
        zip: String(10000 + i),
        country: 'US',
        isDefault: i === 0,
      },
    ],
    preferences: {
      language: 'en',
      currency: 'USD',
      marketing: Math.random() > 0.5,
      sms: Math.random() > 0.7,
      email: Math.random() > 0.3,
    },
    stats: {
      totalOrders: Math.floor(Math.random() * 20) + 1,
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      avgOrderValue: Math.floor(Math.random() * 200) + 50,
      firstOrderDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      itemsPurchased: Math.floor(Math.random() * 50) + 5,
    },
    rfm: {
      recency: Math.floor(Math.random() * 100),
      frequency: Math.floor(Math.random() * 50),
      monetary: Math.floor(Math.random() * 1000) + 100,
      score: ['vip', 'loyal', 'at-risk', 'lost', 'new'][i % 5] as any,
      segment: ['High Value', 'Regular', 'Occasional', 'One-time'][i % 4],
    },
    tags: i < 10 ? ['VIP'] : [],
    notes: `Customer notes for ${i + 1}`,
    isVip: i < 10,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// ======================
// HOME SECTION MANAGEMENT TYPES
// ======================

export type SectionType =
  | 'categories'
  | 'promotion'
  | 'combos'
  | 'flash-sale'
  | 'new-arrivals'
  | 'for-you'
  | 'recommendations'
  | 'favourites'
  | 'brands';

export interface HomeSection {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
  settings: {
    showViewAll?: boolean;
    itemsToShow?: number;
    layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'horizontal-scroll';
    backgroundColor?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeSectionCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isVisible: boolean;
  order: number;
  productCount?: number;
}

export interface HomeSectionProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  sku?: string;
  stock: number;
  category: string;
  rating?: number;
  reviews?: number;
  isVisible: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  isFavourite: boolean;
  isRecommended: boolean;
  isForYou: boolean;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface HomeSectionCombo {
  id: string;
  name: string;
  price: number;
  priceRange: string;
  image: string;
  description?: string;
  items?: string[];
  isVisible: boolean;
  order: number;
  category: 'makeup' | 'skincare' | 'haircare' | 'bodycare' | 'spa' | 'luxury';
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeSectionBrand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
  isVisible: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  gradient: string;
  link?: string;
  isVisible: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComboSlide {
  id: string;
  title: string;
  description: string;
  gradient: string;
  image: string;
  isVisible: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Settings
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  currency: string;
  freeShippingThreshold: number;
  taxRate: number;
  allowGuestCheckout: boolean;
  maintenanceMode: boolean;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}
