// Universal Tracking Event Types for All Platforms
export const TRACKING_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  SEARCH: 'Search',
  ADD_TO_CART: 'AddToCart',
  ADD_TO_WISHLIST: 'AddToWishlist',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  ADD_PAYMENT_INFO: 'AddPaymentInfo',
  PURCHASE: 'Purchase',
  LEAD: 'Lead',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  SUBSCRIBE: 'Subscribe',
  START_TRIAL: 'StartTrial',
  SUBMIT_APPLICATION: 'SubmitApplication',
  CONTACT: 'Contact',
} as const satisfies Record<string, TrackingEvent>;

export type TrackingEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Subscribe'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Contact';

export interface TrackingEventData {
  // Product Data
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    price?: number;
  }>;

  // Transaction Data
  value?: number;
  currency?: string;
  transaction_id?: string;

  // User Data
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;

  // Campaign Data
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Additional Data
  num_items?: number;
  search_string?: string;
  predicted_ltv?: number;
  status?: string;

  // Custom Properties
  [key: string]: any;
}

// Platform Configuration
export interface TrackingPlatformConfig {
  enabled: boolean;
  pixelId?: string;
  apiKey?: string;
  measurementId?: string;
  accessToken?: string;
  testMode?: boolean;
}

export interface AllPlatformsConfig {
  facebook: TrackingPlatformConfig & {
    pixelId: string;
    accessToken?: string; // For CAPI
    testEventCode?: string;
  };
  google: TrackingPlatformConfig & {
    measurementId: string; // GA4
    tagManagerId?: string; // GTM
    adsConversionId?: string;
    adsConversionLabel?: string;
  };
  tiktok: TrackingPlatformConfig & {
    pixelId: string;
  };
  snapchat: TrackingPlatformConfig & {
    pixelId: string;
  };
  pinterest: TrackingPlatformConfig & {
    tagId: string;
  };
  twitter: TrackingPlatformConfig & {
    pixelId: string;
  };
  linkedin: TrackingPlatformConfig & {
    partnerId: string;
  };
  reddit: TrackingPlatformConfig & {
    pixelId: string;
  };
  microsoft: TrackingPlatformConfig & {
    uetTagId: string;
  };
  hotjar: TrackingPlatformConfig & {
    siteId: string;
  };
  clarity: TrackingPlatformConfig & {
    projectId: string;
  };
  mixpanel: TrackingPlatformConfig & {
    token: string;
  };
}

// Customer Tracking Data
export interface CustomerSession {
  sessionId: string;
  userId?: string;
  deviceId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: Array<{
    event: TrackingEvent;
    timestamp: number;
    data?: TrackingEventData;
  }>;
  referrer?: string;
  landingPage: string;
  currentPage: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
  };
}

// Campaign Attribution
export interface CampaignAttribution {
  firstTouch?: {
    source: string;
    medium: string;
    campaign: string;
    timestamp: number;
  };
  lastTouch?: {
    source: string;
    medium: string;
    campaign: string;
    timestamp: number;
  };
  allTouchpoints?: Array<{
    source: string;
    medium: string;
    campaign: string;
    timestamp: number;
    conversion?: boolean;
  }>;
  model?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
  touchpoints?: Array<any>;
  attribution?: Record<string, number>;
}

// Customer Segment
export interface CustomerSegment {
  id: string;
  name: string;
  segment?: 'visitors' | 'browsers' | 'engaged' | 'cart_abandoners' | 'first_time' | 'returning' | 'loyal' | 'at_risk' | 'high_value';
  description?: string;
  conditions?: {
    totalOrders?: { min?: number; max?: number };
    totalSpent?: { min?: number; max?: number };
    lastPurchase?: { daysAgo?: number };
    categories?: string[];
    tags?: string[];
    customEvents?: string[];
  };
  criteria?: {
    minPageViews?: number;
    minPurchases?: number;
    minRevenue?: number;
  };
  customerIds?: string[];
  userCount?: number;
  value?: 'high' | 'medium' | 'low';
  lastUpdated?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Retargeting Audience
export interface RetargetingAudience {
  id: string;
  name: string;
  platform: keyof AllPlatformsConfig | 'all';
  type?: 'custom' | 'lookalike' | 'dynamic';
  source?: {
    type: 'abandoned_cart' | 'product_viewers' | 'purchasers' | 'segment';
    timeframe: number; // days
    productIds?: string[];
    categoryIds?: string[];
    segmentId?: string;
  };
  criteria?: Record<string, any>;
  size: number;
  status: 'active' | 'inactive';
  syncedAt?: string;
  createdAt: string | number;
}

// Analytics Report Data
export interface AnalyticsReport {
  period: {
    start: string;
    end: string;
  };
  overview: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    avgOrderValue: number;
  };
  traffic: {
    sources: Array<{
      source: string;
      sessions: number;
      users: number;
      conversions: number;
      revenue: number;
    }>;
    mediums: Array<{
      medium: string;
      sessions: number;
      users: number;
      conversions: number;
      revenue: number;
    }>;
    campaigns: Array<{
      campaign: string;
      sessions: number;
      users: number;
      conversions: number;
      revenue: number;
      cost?: number;
      roas?: number;
    }>;
  };
  behavior: {
    topPages: Array<{
      page: string;
      views: number;
      uniqueViews: number;
      avgTimeOnPage: number;
      exitRate: number;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      views: number;
      addToCarts: number;
      purchases: number;
      revenue: number;
    }>;
  };
  funnel: {
    steps: Array<{
      name: string;
      users: number;
      dropoffRate: number;
    }>;
  };
  cohorts: Array<{
    cohort: string;
    users: number;
    retention: number[];
    ltv: number;
  }>;
}

// Event Queue for Offline Support
export interface EventQueueItem {
  id: string;
  platform: keyof AllPlatformsConfig;
  event: TrackingEvent;
  data: TrackingEventData;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'sent' | 'failed';
}
