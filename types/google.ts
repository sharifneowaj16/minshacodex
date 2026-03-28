// TypeScript interfaces for Google Services Integration System

export interface GoogleService {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error' | 'warning';
  metrics?: Record<string, number | string>;
  setupCompleted?: boolean;
  accountId?: string;
  propertyId?: string;
  containerId?: string;
  errors?: string[];
}

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    change?: number;
  }>;
  topPages: Array<{
    url: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  coverageIssues: {
    errors: number;
    warnings: number;
    valid: number;
    excluded: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    mobile: {
      lcp: number;
      fid: number;
      cls: number;
    };
    desktop: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  searchAppearance: {
    richResults: number;
    ampPages: number;
    faqPages: number;
    howToPages: number;
  };
  indexing: {
    submitted: number;
    indexed: number;
    crawlErrors: number;
    sitemaps: Array<{
      path: string;
      lastSubmitted: Date;
      processed: number;
      errors: number;
    }>;
  };
  dateRange: string;
}

export interface MerchantProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  gtin?: string;
  upc?: string;
  mpn?: string;
  availability: 'in stock' | 'out of stock' | 'preorder';
  condition: 'new' | 'used' | 'refurbished';
  status: 'approved' | 'pending' | 'disapproved';
  issues?: Array<{
    code: string;
    severity: 'error' | 'warning';
    message: string;
    action: string;
  }>;
  imageUrl: string;
  additionalImages: string[];
  category: string;
  googleCategory: string;
  shipping: {
    country: string;
    price: number;
    service: string;
  }[];
  tax: {
    country: string;
    rate: number;
    taxShip: boolean;
  };
  adsEnabled: boolean;
  lastUpdated: Date;
  createdDate: Date;
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  type: 'search' | 'shopping' | 'display' | 'youtube' | 'performance_max';
  status: 'active' | 'paused' | 'ended' | 'removed';
  budget: number;
  budgetType: 'daily' | 'total';
  spent: number;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
  cpa: number; // Cost Per Acquisition
  cpc: number; // Cost Per Click
  roas: number; // Return On Ad Spend
  startDate: Date;
  endDate?: Date;
  targeting: {
    locations: string[];
    languages: string[];
    devices: string[];
    demographics: {
      age?: string[];
      gender?: string[];
    };
  };
  adGroups: Array<{
    id: string;
    name: string;
    keywords?: string[];
    products?: string[];
    ads: Array<{
      id: string;
      type: string;
      headline?: string;
      description?: string;
      imageUrl?: string;
      videoUrl?: string;
    }>;
  }>;
  performance: {
    searchImpressionShare: number;
    avgPosition: number;
    topOfPageRate: number;
  };
}

export interface GA4Metrics {
  users: number;
  newUsers: number;
  sessions: number;
  pageviews: number;
  engagementRate: number;
  conversionRate: number;
  conversions: number;
  revenue: number;
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  topPages: Array<{
    path: string;
    title: string;
    pageviews: number;
    uniquePageviews: number;
    avgTimeOnPage: number;
    exitRate: number;
  }>;
  topSources: Array<{
    source: string;
    medium: string;
    users: number;
    sessions: number;
    percentage: number;
    revenue?: number;
  }>;
  topProducts: Array<{
    itemId: string;
    itemName: string;
    revenue: number;
    quantity: number;
    price: number;
  }>;
  events: Array<{
    eventName: string;
    eventCount: number;
    conversionEvents: number;
    revenue: number;
  }>;
  demographics: {
    ageGroups: Array<{
      age: string;
      users: number;
      percentage: number;
    }>;
    gender: Array<{
      gender: string;
      users: number;
      percentage: number;
    }>;
    interests: Array<{
      interest: string;
      users: number;
      percentage: number;
    }>;
  };
  locations: Array<{
    country: string;
    region: string;
    city: string;
    users: number;
    sessions: number;
    revenue: number;
  }>;
  devices: Array<{
    device: string;
    users: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
  }>;
  realTime: {
    users: number;
    activePages: Array<{
      path: string;
      title: string;
      users: number;
    }>;
    trafficSources: Array<{
      source: string;
      medium: string;
      users: number;
    }>;
    conversions: Array<{
      eventName: string;
      count: number;
    }>;
  };
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  website: string;
  hours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  rating: number;
  reviewCount: number;
  photos: Array<{
    id: string;
    url: string;
    type: 'logo' | 'cover' | 'interior' | 'exterior' | 'product' | 'team';
    uploadDate: Date;
  }>;
  posts: Array<{
    id: string;
    type: 'update' | 'event' | 'offer' | 'product';
    title: string;
    summary: string;
    callToAction: {
      type: string;
      url: string;
    };
    media: string[];
    startDate?: Date;
    endDate?: Date;
    createTime: Date;
    updateTime: Date;
    state: 'LIVE_STATE_UNSPECIFIED' | 'LIVE' | 'PROCESSED';
  }>;
  reviews: Array<{
    id: string;
    reviewer: {
      name: string;
      profilePhotoUrl?: string;
    };
    starRating: number;
    comment: string;
    createTime: Date;
    updateTime: Date;
    reply?: {
      comment: string;
      updateTime: Date;
    };
    flag: 'FLAG_REASON_UNSPECIFIED' | 'SPAM' | 'OFF_TOPIC' | 'BANNED_USER' | 'PROFANITY' | 'SEXUAL_CONTENT' | 'HATE_SPEECH' | 'IMPERSONATION' | 'RESTRICTED_POLICY' | 'SENSITIVE_INFORMATION';
  }>;
  insights: {
    totalViews: number;
    totalSearchViews: number;
    totalMapViews: number;
    totalWebsiteClicks: number;
    totalPhoneCalls: number;
    totalDirectionRequests: number;
    totalBookings: number;
    totalFoodOrders: number;
    totalMessaging: number;
    timeRange: string;
  };
  services: Array<{
    name: string;
    category: string;
    description: string;
    price?: {
      currencyCode: string;
      units: number;
      nanos: number;
    };
  }>;
  questions: Array<{
    id: string;
    author: {
      displayName: string;
      profilePhotoUrl?: string;
    };
    text: string;
    createTime: Date;
    updateTime: Date;
    topAnswer?: {
      author: {
        displayName: string;
        profilePhotoUrl?: string;
      };
      text: string;
      updateTime: Date;
      upvoteCount: number;
    };
    totalAnswerCount: number;
  }>;
}

export interface GoogleTag {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'disabled';
  firingRule: string;
  blockingRule?: string;
  priority: number;
  impressions: number;
  lastFired?: Date;
  tagDetails: string;
  code?: string;
}

export interface GTMTag {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'disabled';
  firingRuleId: string;
  blockingRuleId: string;
  priority: number;
  parameters: Array<{
    key: string;
    value: string;
    type: 'template' | 'list' | 'boolean';
  }>;
  fingerprint: string;
  tagFiringOption: 'oncePerEvent' | 'oncePerLoad' | 'unlimited' | 'oncePerWindow';
  consentSettings: {
    consentType: string;
  };
  notes: string;
  setupTag?: Array<{
    tagName: string;
  }>;
  teardownTag?: Array<{
    tagName: string;
  }>;
  createdTime: Date;
  modifiedTime: Date;
}

export interface GTMTrigger {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'disabled';
  parameters: Array<{
    key: string;
    value: string;
    type: 'template' | 'boolean';
  }>;
  fingerprint: string;
  uniqueTriggerId: string;
  autoEventFilter: Array<{
    parameter: Array<{
      key: string;
      value: string;
      type: string;
    }>;
  }>;
  customEventFilter: Array<{
    parameter: Array<{
      key: string;
      value: string;
      type: string;
    }>;
  }>;
  filter: Array<{
    parameter: Array<{
      key: string;
      value: string;
      type: string;
    }>;
  }>;
  eventId: number;
  interval: number;
  intervalSeconds: number;
  limit: number;
  maxTimerLimitSeconds: number;
  triggerId: string;
  waitForTags: {
    enabled: boolean;
    name: string;
  };
  createdTime: Date;
  modifiedTime: Date;
}

export interface GTMContainer {
  id: string;
  name: string;
  publicId: string;
  usageContext: Array<'web' | 'android' | 'ios' | 'amp' | 'server'>;
  domainName?: string;
  notes: string;
  tagManagerUrl: string;
  containerVersionId: string;
  enabledBuiltInVariables: Array<{
    type: string;
    name: string;
  }>;
  features: Array<{
    name: string;
    value: boolean;
  }>;
  workspaceId: string;
  fingerprint: string;
  createdTime: Date;
  modifiedTime: Date;
}

export interface RemarketingAudience {
  id: string;
  name: string;
  description: string;
  size: number;
  sizeSource: 'estimated' | 'actual';
  membershipDurationDays: number;
  rules: Array<{
    ruleType: 'INCLUDE' | 'EXCLUDE';
    conditions: Array<{
      parameter: string;
      operator: string;
      value: string;
    }>;
  }>;
  activeCampaigns: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  createdTime: Date;
  modifiedTime: Date;
}

export interface BusinessProfileData {
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    hours: string;
    rating: number;
    totalReviews: number;
    website: string;
    category: string;
  };
  insights: {
    views: number;
    viewChange?: number;
    clicks: number;
    clickChange?: number;
    calls: number;
    callChange?: number;
    directions: number;
    directionChange?: number;
    customerActions: Record<string, number>;
    searchQueries: Array<{
      query: string;
      count: number;
      views: number;
    }>;
  };
  reviews: GoogleReview[];
  posts: GooglePost[];
  photos: Array<{
    url: string;
    caption?: string;
    uploadDate: string;
  }>;
  recentActivity: Array<{
    type: 'review' | 'question' | 'photo';
    description: string;
    date: string;
  }>;
}

export interface GoogleReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  reply?: {
    text: string;
    date: string;
  };
}

export interface GooglePost {
  id: string;
  type: 'update' | 'offer' | 'event';
  title: string;
  content: string;
  date: string;
  views: number;
  likes: number;
}

export interface TagManagerData {
  container: {
    id: string;
    name: string;
    publicId: string;
    lastPublish: Date;
    totalTags: number;
    activeTags: number;
    totalTriggers: number;
    totalVariables: number;
    version: string;
    environment: 'production' | 'staging' | 'development';
    snippet?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'disabled';
    firingRule: string;
    blockingRule?: string;
    priority: number;
    impressions: number;
    lastFired?: Date;
    tagDetails: string;
  }>;
  triggers: Array<{
    id: string;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'disabled';
    conditions: string;
    firesOn: string;
    lastTriggered?: Date;
    triggerCount: number;
  }>;
  variables: Array<{
    id: string;
    name: string;
    type: string;
    value: string;
    status: 'active' | 'inactive';
    usageCount: number;
  }>;
  recentActivity: Array<{
    type: 'tag' | 'trigger' | 'variable' | 'publish';
    action: 'created' | 'updated' | 'deleted' | 'published';
    description: string;
    date: Date;
    author: string;
  }>;
  performance: {
    totalEvents: number;
    eventChange?: number;
    totalTagsFired: number;
    tagFireChange?: number;
    averageLoadTime: number;
    loadTimeChange?: number;
    errors: number;
    errorsChange?: number;
  };
}

export interface RemarketingData {
  performance: {
    totalUsers: number;
    userChange?: number;
    impressions: number;
    impressionChange?: number;
    clicks: number;
    clickChange?: number;
    conversions: number;
    conversionChange?: number;
    cost: number;
    roas: number;
  };
  audienceFunnel: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  audiences: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    size: number;
    campaignsUsed: number;
    rules: string;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    budget: number;
    roas: number;
    audiences: string[];
  }>;
  pixels: Array<{
    id: string;
    name: string;
    type: string;
    platform: string;
    status: string;
    pixelId: string;
    createdAt: string;
    events: number;
  }>;
  recentActivity: Array<{
    type: 'campaign' | 'audience' | 'conversion';
    description: string;
    date: string;
  }>;
}

export interface RemarketingCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  audienceIds: string[];
  budget: number;
  biddingStrategy: string;
  adGroups: Array<{
    id: string;
    name: string;
    ads: Array<{
      id: string;
      type: string;
      headline?: string;
      description?: string;
      imageUrl?: string;
      videoUrl?: string;
      callToAction: string;
    }>;
  }>;
  targeting: {
    locations: string[];
    languages: string[];
    devices: string[];
    ageRanges: string[];
    genders: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    ctr: number;
    cpa: number;
    roas: number;
  };
  startDate: Date;
  endDate?: Date;
}

export interface GoogleAnalyticsReport {
  id: string;
  name: string;
  type: 'realtime' | 'acquisition' | 'engagement' | 'monetization' | 'audience' | 'events';
  dateRange: string;
  dimensions: string[];
  metrics: string[];
  filters?: Array<{
    fieldName: string;
    operator: string;
    value: string;
  }>;
  segments?: string[];
  samplingLevel: 'DEFAULT' | 'SMALL' | 'LARGE';
  currencyCode: string;
  createdTime: Date;
  updatedTime: Date;
  scheduled?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: string;
    time?: string;
    recipients: string[];
    format: 'pdf' | 'csv' | 'both';
  };
}

// Mock Data Generators
export const generateMockGoogleServices = (): GoogleService[] => [
  {
    id: 'search-console',
    name: 'Google Search Console',
    icon: '🔍',
    connected: true,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'active',
    metrics: {
      clicks: 1234,
      impressions: 45678,
      ctr: 2.7,
      position: 12.5
    },
    propertyId: 'https://minsah-beauty.com/'
  },
  {
    id: 'merchant-center',
    name: 'Google Merchant Center',
    icon: '🛍️',
    connected: true,
    lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'warning',
    metrics: {
      totalProducts: 156,
      approvedProducts: 153,
      pendingProducts: 3,
      disapprovedProducts: 2,
      activeListings: 1
    },
    accountId: '123456789',
    setupCompleted: true
  },
  {
    id: 'google-ads',
    name: 'Google Shopping Ads',
    icon: '💰',
    connected: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'active',
    metrics: {
      activeCampaigns: 3,
      dailyBudget: 500,
      totalSpend: 123450,
      totalConversions: 89,
      avgROAS: 485
    },
    accountId: '123-456-7890',
    setupCompleted: true
  },
  {
    id: 'analytics',
    name: 'Google Analytics 4',
    icon: '📊',
    connected: true,
    lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'active',
    metrics: {
      propertyId: 'GA4-12345678',
      realTimeUsers: 23,
      totalUsers: 12456,
      totalSessions: 15678,
      conversionRate: 2.3,
      totalRevenue: 45200
    },
    propertyId: 'GA4-12345678'
  },
  {
    id: 'business-profile',
    name: 'Google Business Profile',
    icon: '🏪',
    connected: true,
    lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'active',
    metrics: {
      rating: 4.8,
      totalReviews: 127,
      profileViews: 3456,
      websiteClicks: 456,
      phoneCalls: 89,
      postsThisMonth: 12
    },
    accountId: 'minsah-beauty',
    setupCompleted: true
  },
  {
    id: 'tag-manager',
    name: 'Google Tag Manager',
    icon: '🏷️',
    connected: true,
    lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'active',
    metrics: {
      containerId: 'GTM-XXXXXX',
      publishedTags: 8,
      unpublishedChanges: 0,
      lastPublish: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    containerId: 'GTM-XXXXXX'
  },
  {
    id: 'remarketing',
    name: 'Google Remarketing',
    icon: '🔔',
    connected: true,
    lastSync: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'active',
    metrics: {
      totalAudiences: 5,
      totalUsers: 12450,
      activeCampaigns: 2,
      totalConversions: 45,
      totalCost: 8750
    },
    setupCompleted: true
  },
  {
    id: 'display-ads',
    name: 'Google Display Ads',
    icon: '🎨',
    connected: false,
    status: 'inactive',
    errors: ['Not connected']
  }
];

export const generateMockSearchConsoleData = (): SearchConsoleData => ({
  clicks: 1234,
  impressions: 45678,
  ctr: 2.7,
  position: 12.5,
  topQueries: [
    { query: 'mac lipstick', clicks: 89, impressions: 2780, ctr: 3.2, position: 8, change: 12 },
    { query: 'niacinamide serum', clicks: 67, impressions: 2390, ctr: 2.8, position: 12, change: -5 },
    { query: 'foundation makeup', clicks: 45, impressions: 1890, ctr: 2.4, position: 15, change: 8 },
    { query: 'beauty products online', clicks: 38, impressions: 1567, ctr: 2.4, position: 18, change: 15 },
    { query: 'mascara waterproof', clicks: 32, impressions: 1345, ctr: 2.4, position: 14, change: -2 }
  ],
  topPages: [
    { url: '/products/lipstick', title: 'MAC Ruby Woo Lipstick', clicks: 156, impressions: 3456, ctr: 4.5, position: 8 },
    { url: '/products/serum', title: 'Niacinamide 10% Serum', clicks: 134, impressions: 2890, ctr: 4.6, position: 10 },
    { url: '/products/foundation', title: 'Fit Me Foundation', clicks: 98, impressions: 2345, ctr: 4.2, position: 12 },
    { url: '/products/mascara', title: 'Magnifique Mascara', clicks: 87, impressions: 1987, ctr: 4.4, position: 11 }
  ],
  coverageIssues: {
    errors: 3,
    warnings: 8,
    valid: 1245,
    excluded: 23
  },
  coreWebVitals: {
    lcp: 2.1,
    fid: 45,
    cls: 0.1,
    mobile: {
      lcp: 2.8,
      fid: 78,
      cls: 0.15
    },
    desktop: {
      lcp: 1.4,
      fid: 12,
      cls: 0.05
    }
  },
  searchAppearance: {
    richResults: 89,
    ampPages: 12,
    faqPages: 23,
    howToPages: 8
  },
  indexing: {
    submitted: 156,
    indexed: 152,
    crawlErrors: 2,
    sitemaps: [
      {
        path: '/sitemap.xml',
        lastSubmitted: new Date(Date.now() - 24 * 60 * 60 * 1000),
        processed: 156,
        errors: 0
      }
    ]
  },
  dateRange: '28days'
});

export const generateMockMerchantProducts = (): MerchantProduct[] => [
  {
    id: 'prod_001',
    title: 'MAC Ruby Woo Lipstick',
    description: 'Classic retro matte lipstick in vivid ruby red',
    price: 1850,
    originalPrice: 2200,
    brand: 'MAC',
    gtin: '7617726442947',
    availability: 'in stock',
    condition: 'new',
    status: 'approved',
    imageUrl: '/api/placeholder/800/600',
    additionalImages: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
    category: 'Lipstick',
    googleCategory: 'Health & Beauty > Personal Care > Cosmetics > Lipstick',
    shipping: [
      { country: 'BD', price: 80, service: 'Standard' }
    ],
    tax: { country: 'BD', rate: 15, taxShip: false },
    adsEnabled: true,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'prod_002',
    title: 'Niacinamide 10% Serum',
    description: 'Powerful niacinamide serum for clear, smooth skin',
    price: 2850,
    brand: 'Minsah Beauty',
    availability: 'in stock',
    condition: 'new',
    status: 'pending',
    issues: [
      {
        code: 'missing_attribute',
        severity: 'error',
        message: 'Missing GTIN',
        action: 'Add GTIN or UPC for this product'
      }
    ],
    imageUrl: '/api/placeholder/800/600',
    additionalImages: [],
    category: 'Serum',
    googleCategory: 'Health & Beauty > Personal Care > Skin Care > Serum',
    shipping: [
      { country: 'BD', price: 80, service: 'Standard' }
    ],
    tax: { country: 'BD', rate: 15, taxShip: false },
    adsEnabled: true,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'prod_003',
    title: 'Fit Me Foundation',
    description: 'Natural fit foundation that matches your skin tone',
    price: 1650,
    originalPrice: 2200,
    brand: 'Maybelline',
    availability: 'in stock',
    condition: 'new',
    status: 'disapproved',
    issues: [
      {
        code: 'policy_violation',
        severity: 'error',
        message: 'Misleading health claim',
        action: 'Remove health claims that cannot be verified'
      }
    ],
    imageUrl: '/api/placeholder/800/600',
    additionalImages: [],
    category: 'Foundation',
    googleCategory: 'Health & Beauty > Personal Care > Cosmetics > Foundation',
    shipping: [
      { country: 'BD', price: 80, service: 'Standard' }
    ],
    tax: { country: 'BD', rate: 15, taxShip: false },
    adsEnabled: false,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  }
];

export const generateMockGoogleAdsCampaigns = (): GoogleAdsCampaign[] => [
  {
    id: 'camp_001',
    name: 'Search - Brand Keywords',
    type: 'search',
    status: 'active',
    budget: 200,
    budgetType: 'daily',
    spent: 4500,
    clicks: 234,
    impressions: 8900,
    ctr: 2.63,
    conversions: 12,
    cpa: 375,
    cpc: 19.23,
    roas: 245,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    targeting: {
      locations: ['Bangladesh'],
      languages: ['en', 'bn'],
      devices: ['mobile', 'desktop'],
      demographics: {}
    },
    adGroups: [
      {
        id: 'adg_001',
        name: 'Minsah Beauty Brand Terms',
        keywords: ['minsah beauty', 'minsah makeup', 'minsah cosmetics'],
        ads: [
          {
            id: 'ad_001',
            type: 'text',
            headline: 'Minsah Beauty - Official Store',
            description: 'Shop authentic beauty products. Fast delivery across Bangladesh.'
          }
        ]
      }
    ],
    performance: {
      searchImpressionShare: 45.2,
      avgPosition: 2.3,
      topOfPageRate: 78.5
    }
  },
  {
    id: 'camp_002',
    name: 'Shopping - All Products',
    type: 'shopping',
    status: 'active',
    budget: 300,
    budgetType: 'daily',
    spent: 6750,
    clicks: 456,
    impressions: 12450,
    ctr: 3.66,
    conversions: 34,
    cpa: 198.5,
    cpc: 14.8,
    roas: 520,
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    targeting: {
      locations: ['Bangladesh'],
      languages: ['en', 'bn'],
      devices: ['mobile', 'desktop'],
      demographics: {}
    },
    adGroups: [
      {
        id: 'adg_002',
        name: 'All Products',
        products: ['all'],
        ads: [
          {
            id: 'ad_002',
            type: 'shopping',
            imageUrl: '/api/placeholder/300/300'
          }
        ]
      }
    ],
    performance: {
      searchImpressionShare: 67.8,
      avgPosition: 1.8,
      topOfPageRate: 89.2
    }
  },
  {
    id: 'camp_003',
    name: 'YouTube - Product Reviews',
    type: 'youtube',
    status: 'active',
    budget: 150,
    budgetType: 'daily',
    spent: 2250,
    clicks: 2338,
    impressions: 125000,
    ctr: 1.87,
    conversions: 23,
    cpa: 97.8,
    cpc: 0.12,
    roas: 380,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    targeting: {
      locations: ['Bangladesh'],
      languages: ['en', 'bn'],
      devices: ['mobile', 'desktop', 'tablet'],
      demographics: {
        age: ['18-24', '25-34', '35-44'],
        gender: ['female']
      }
    },
    adGroups: [
      {
        id: 'adg_003',
        name: 'Beauty Product Reviews',
        ads: [
          {
            id: 'ad_003',
            type: 'video',
            videoUrl: '/api/video/placeholder',
            description: 'Shop Now'
          }
        ]
      }
    ],
    performance: {
      searchImpressionShare: 0,
      avgPosition: 0,
      topOfPageRate: 0
    }
  }
];

export const generateMockGA4Data = (): GA4Metrics => ({
  users: 12456,
  newUsers: 8234,
  sessions: 15678,
  pageviews: 45678,
  engagementRate: 65.4,
  conversionRate: 2.3,
  conversions: 34,
  revenue: 45200,
  avgSessionDuration: 156, // seconds
  bounceRate: 34.5,
  pagesPerSession: 2.9,
  topPages: [
    { path: '/', title: 'Minsah Beauty - Home', pageviews: 2456, uniquePageviews: 1987, avgTimeOnPage: 45, exitRate: 32.1 },
    { path: '/products', title: 'All Products', pageviews: 1876, uniquePageviews: 1543, avgTimeOnPage: 67, exitRate: 28.7 },
    { path: '/products/lipstick', title: 'Lipstick Collection', pageviews: 1234, uniquePageviews: 987, avgTimeOnPage: 89, exitRate: 23.4 }
  ],
  topSources: [
    { source: 'google', medium: 'organic', users: 3456, sessions: 4567, percentage: 45.2, revenue: 18900 },
    { source: '(direct)', medium: '(none)', users: 1890, sessions: 2345, percentage: 24.7, revenue: 12300 },
    { source: 'facebook', medium: 'social', users: 1234, sessions: 1567, percentage: 16.1, revenue: 8900 },
    { source: 'instagram', medium: 'social', users: 876, sessions: 1098, percentage: 11.4, revenue: 5100 }
  ],
  topProducts: [
    { itemId: 'prod_001', itemName: 'MAC Ruby Woo Lipstick', revenue: 25000, quantity: 14, price: 1850 },
    { itemId: 'prod_002', itemName: 'Niacinamide 10% Serum', revenue: 18500, quantity: 7, price: 2850 },
    { itemId: 'prod_003', itemName: 'Fit Me Foundation', revenue: 1200, quantity: 1, price: 1650 }
  ],
  events: [
    { eventName: 'page_view', eventCount: 45678, conversionEvents: 0, revenue: 0 },
    { eventName: 'add_to_cart', eventCount: 456, conversionEvents: 0, revenue: 0 },
    { eventName: 'purchase', eventCount: 34, conversionEvents: 34, revenue: 45200 },
    { eventName: 'view_item', eventCount: 567, conversionEvents: 0, revenue: 0 },
    { eventName: 'begin_checkout', eventCount: 89, conversionEvents: 0, revenue: 0 }
  ],
  demographics: {
    ageGroups: [
      { age: '18-24', users: 2345, percentage: 18.8 },
      { age: '25-34', users: 4567, percentage: 36.7 },
      { age: '35-44', users: 3234, percentage: 26.0 },
      { age: '45-54', users: 1567, percentage: 12.6 },
      { age: '55+', users: 743, percentage: 5.9 }
    ],
    gender: [
      { gender: 'female', users: 8765, percentage: 70.4 },
      { gender: 'male', users: 3678, percentage: 29.5 },
      { gender: 'unknown', users: 13, percentage: 0.1 }
    ],
    interests: [
      { interest: 'Beauty & Cosmetics', users: 5678, percentage: 45.6 },
      { interest: 'Fashion', users: 3456, percentage: 27.8 },
      { interest: 'Lifestyle', users: 2345, percentage: 18.8 }
    ]
  },
  locations: [
    { country: 'Bangladesh', region: 'Dhaka', city: 'Dhaka', users: 6789, sessions: 7890, revenue: 24500 },
    { country: 'Bangladesh', region: 'Chittagong', city: 'Chittagong', users: 2345, sessions: 2678, revenue: 8900 },
    { country: 'Bangladesh', region: 'Sylhet', city: 'Sylhet', users: 1234, sessions: 1456, revenue: 4560 }
  ],
  devices: [
    { device: 'mobile', users: 8765, sessions: 9876, bounceRate: 38.9, avgSessionDuration: 134 },
    { device: 'desktop', users: 3456, sessions: 4567, bounceRate: 28.4, avgSessionDuration: 198 },
    { device: 'tablet', users: 235, sessions: 235, bounceRate: 41.2, avgSessionDuration: 167 }
  ],
  realTime: {
    users: 23,
    activePages: [
      { path: '/', title: 'Minsah Beauty - Home', users: 8 },
      { path: '/products/lipstick', title: 'Lipstick Collection', users: 5 },
      { path: '/products', title: 'All Products', users: 4 }
    ],
    trafficSources: [
      { source: 'google', medium: 'organic', users: 12 },
      { source: 'facebook', medium: 'social', users: 6 },
      { source: '(direct)', medium: '(none)', users: 5 }
    ],
    conversions: [
      { eventName: 'purchase', count: 2 },
      { eventName: 'add_to_cart', count: 3 }
    ]
  }
});

export const generateMockBusinessProfileData = (): BusinessProfileData => ({
  businessInfo: {
    name: 'Minsah Beauty',
    address: '123 Gulshan Avenue, Dhaka 1212, Bangladesh',
    phone: '+880 1234-567890',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM',
    rating: 4.8,
    totalReviews: 127,
    website: 'https://minsah-beauty.com',
    category: 'Beauty Store'
  },
  insights: {
    views: 3456,
    viewChange: 12,
    clicks: 456,
    clickChange: 8,
    calls: 89,
    callChange: -5,
    directions: 234,
    directionChange: 15,
    customerActions: {
      website_clicks: 456,
      phone_calls: 89,
      direction_requests: 234,
      booking_clicks: 45
    },
    searchQueries: [
      { query: 'beauty store dhaka', count: 45, views: 1234 },
      { query: 'makeup shop', count: 38, views: 987 },
      { query: 'cosmetics near me', count: 32, views: 876 },
      { query: 'lipstick dhaka', count: 28, views: 765 },
      { query: 'skincare products', count: 24, views: 654 }
    ]
  },
  reviews: [
    {
      id: 'review_001',
      name: 'Ayesha Rahman',
      rating: 5,
      comment: 'Amazing collection of beauty products! The staff is very helpful and the quality is always top-notch. Highly recommend!',
      date: '2024-01-15',
      reply: {
        text: 'Thank you so much for your kind words! We\'re delighted to hear you had a great experience.',
        date: '2024-01-16'
      }
    },
    {
      id: 'review_002',
      name: 'Farhana Islam',
      rating: 4,
      comment: 'Great variety of products and reasonable prices. The location is convenient too.',
      date: '2024-01-12'
    },
    {
      id: 'review_003',
      name: 'Sabiha Karim',
      rating: 5,
      comment: 'My go-to place for all beauty needs! They have all the premium brands and authentic products.',
      date: '2024-01-10'
    },
    {
      id: 'review_004',
      name: 'Nusrat Jahan',
      rating: 3,
      comment: 'Good collection but sometimes they run out of stock on popular items.',
      date: '2024-01-08'
    },
    {
      id: 'review_005',
      name: 'Tahmina Ahmed',
      rating: 5,
      comment: 'Excellent customer service! They helped me find the perfect foundation match.',
      date: '2024-01-05'
    }
  ],
  posts: [
    {
      id: 'post_001',
      type: 'update',
      title: 'New Spring Collection Arrived! 🌸',
      content: 'Exciting news! Our spring collection is now in store. Fresh colors, new formulas, and amazing offers waiting for you!',
      date: '2024-01-15',
      views: 245,
      likes: 32
    },
    {
      id: 'post_002',
      type: 'offer',
      title: '20% Off on All Skincare Products',
      content: 'Special offer! Get 20% discount on all skincare products this week. Don\'t miss out on glowing healthy skin!',
      date: '2024-01-12',
      views: 189,
      likes: 28
    },
    {
      id: 'post_003',
      type: 'event',
      title: 'Free Makeup Workshop This Saturday',
      content: 'Join us for a free makeup workshop this Saturday at 3 PM. Learn tips from professional makeup artists.',
      date: '2024-01-10',
      views: 156,
      likes: 23
    }
  ],
  photos: [
    {
      url: '/api/placeholder/business-photo-1.jpg',
      caption: 'Store Front',
      uploadDate: '2024-01-15'
    },
    {
      url: '/api/placeholder/business-photo-2.jpg',
      caption: 'Interior Display',
      uploadDate: '2024-01-12'
    },
    {
      url: '/api/placeholder/business-photo-3.jpg',
      caption: 'Product Collection',
      uploadDate: '2024-01-10'
    },
    {
      url: '/api/placeholder/business-photo-4.jpg',
      caption: 'Happy Customer',
      uploadDate: '2024-01-08'
    }
  ],
  recentActivity: [
    {
      type: 'review',
      description: 'Ayesha Rahman left a 5-star review',
      date: '2 hours ago'
    },
    {
      type: 'photo',
      description: 'New photos added to business profile',
      date: '1 day ago'
    },
    {
      type: 'question',
      description: 'Customer asked about product availability',
      date: '2 days ago'
    },
    {
      type: 'review',
      description: 'Farhana Islam left a 4-star review',
      date: '3 days ago'
    }
  ]
});

export const generateMockTagManagerData = (): TagManagerData => ({
  container: {
    id: 'container_001',
    name: 'Minsah Beauty - Main Container',
    publicId: 'GTM-MNSHBTY',
    lastPublish: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    totalTags: 15,
    activeTags: 12,
    totalTriggers: 8,
    totalVariables: 6,
    version: '2.4.1',
    environment: 'production'
  },
  tags: [
    {
      id: 'tag_001',
      name: 'Google Analytics 4 - Page View',
      type: 'GA4 Configuration',
      status: 'active',
      firingRule: 'All Pages',
      priority: 1,
      impressions: 45678,
      lastFired: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      tagDetails: 'GA4 Measurement ID: G-MNSHBTY123'
    },
    {
      id: 'tag_002',
      name: 'Meta Pixel - Base Code',
      type: 'Custom HTML',
      status: 'active',
      firingRule: 'All Pages',
      priority: 2,
      impressions: 45123,
      lastFired: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      tagDetails: 'Meta Pixel ID: 1234567890123456'
    },
    {
      id: 'tag_003',
      name: 'Google Ads Remarketing',
      type: 'Google Ads Remarketing',
      status: 'active',
      firingRule: 'Product Pages',
      priority: 5,
      impressions: 12340,
      lastFired: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      tagDetails: 'Google Ads ID: AW-123456789'
    },
    {
      id: 'tag_004',
      name: 'Facebook Pixel - Purchase',
      type: 'Custom HTML',
      status: 'active',
      firingRule: 'Purchase Confirmation',
      priority: 1,
      impressions: 156,
      lastFired: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tagDetails: 'Purchase event tracking'
    },
    {
      id: 'tag_005',
      name: 'Hotjar Heatmaps',
      type: 'Custom HTML',
      status: 'paused',
      firingRule: 'Product Pages',
      priority: 10,
      impressions: 0,
      tagDetails: 'Hotjar Site ID: 1234567'
    },
    {
      id: 'tag_006',
      name: 'Google Ads Conversion - Purchase',
      type: 'Google Ads Conversion Tracking',
      status: 'active',
      firingRule: 'Purchase Confirmation',
      priority: 1,
      impressions: 156,
      lastFired: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tagDetails: 'Conversion Label: purchaseLabel'
    }
  ],
  triggers: [
    {
      id: 'trigger_001',
      name: 'All Pages',
      type: 'Page View',
      status: 'active',
      conditions: 'Page URL matches .*',
      firesOn: 'All pages',
      lastTriggered: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      triggerCount: 45678
    },
    {
      id: 'trigger_002',
      name: 'Product Pages',
      type: 'Page View',
      status: 'active',
      conditions: 'Page URL contains /products/',
      firesOn: 'Product pages only',
      lastTriggered: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      triggerCount: 12340
    },
    {
      id: 'trigger_003',
      name: 'Add to Cart Click',
      type: 'Click - All Elements',
      status: 'active',
      conditions: 'Click Text contains Add to Cart',
      firesOn: 'Add to cart button clicks',
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      triggerCount: 789
    },
    {
      id: 'trigger_004',
      name: 'Purchase Confirmation',
      type: 'Custom Event',
      status: 'active',
      conditions: 'Event equals purchase',
      firesOn: 'Purchase completion',
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      triggerCount: 156
    },
    {
      id: 'trigger_005',
      name: 'Scroll Depth 50%',
      type: 'Scroll Depth',
      status: 'active',
      conditions: 'Vertical Scroll Depth = 50',
      firesOn: 'When user scrolls to 50% of page',
      lastTriggered: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      triggerCount: 8901
    }
  ],
  variables: [
    {
      id: 'var_001',
      name: 'GA4 Measurement ID',
      type: 'Constant',
      value: 'G-MNSHBTY123',
      status: 'active',
      usageCount: 3
    },
    {
      id: 'var_002',
      name: 'Google Ads ID',
      type: 'Constant',
      value: 'AW-123456789',
      status: 'active',
      usageCount: 2
    },
    {
      id: 'var_003',
      name: 'Page URL',
      type: 'URL',
      value: '{{Page URL}}',
      status: 'active',
      usageCount: 8
    },
    {
      id: 'var_004',
      name: 'Click Text',
      type: 'Auto-Event Variable',
      value: '{{Click Text}}',
      status: 'active',
      usageCount: 4
    },
    {
      id: 'var_005',
      name: 'Purchase Value',
      type: 'Data Layer Variable',
      value: '{{purchaseValue}}',
      status: 'active',
      usageCount: 2
    },
    {
      id: 'var_006',
      name: 'User ID',
      type: 'Custom JavaScript',
      value: 'function() { return getCookie("user_id"); }',
      status: 'inactive',
      usageCount: 0
    }
  ],
  recentActivity: [
    {
      type: 'tag',
      action: 'updated',
      description: 'Updated Meta Pixel configuration for iOS 14+',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      author: 'Admin'
    },
    {
      type: 'publish',
      action: 'published',
      description: 'Published version 2.4.1 to production',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      author: 'Admin'
    },
    {
      type: 'trigger',
      action: 'created',
      description: 'Created new scroll depth trigger for 75%',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      author: 'Marketing Team'
    },
    {
      type: 'variable',
      action: 'created',
      description: 'Added new custom variable for product categories',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      author: 'Developer'
    }
  ],
  performance: {
    totalEvents: 45678,
    eventChange: 12.3,
    totalTagsFired: 41234,
    tagFireChange: 8.7,
    averageLoadTime: 45, // milliseconds
    loadTimeChange: -5.2, // improvement
    errors: 12,
    errorsChange: -25.0 // reduction in errors
  }
});

export const generateMockRemarketingData = (): RemarketingData => ({
  performance: {
    totalUsers: 12450,
    userChange: 15.2,
    impressions: 456780,
    impressionChange: 8.7,
    clicks: 3456,
    clickChange: 12.3,
    conversions: 234,
    conversionChange: 18.9,
    cost: 8750,
    roas: 4.85
  },
  audienceFunnel: [
    { name: 'Website Visitors', count: 12450, percentage: 100 },
    { name: 'Product Viewers', count: 8230, percentage: 66.1 },
    { name: 'Cart Adders', count: 3456, percentage: 27.8 },
    { name: 'Checkout Starters', count: 1234, percentage: 9.9 },
    { name: 'Purchasers', count: 456, percentage: 3.7 }
  ],
  audiences: [
    {
      id: 'aud_001',
      name: 'Website Visitors (30 Days)',
      type: 'Website Visitors',
      status: 'active',
      size: 12450,
      campaignsUsed: 3,
      rules: 'All website visitors in the last 30 days'
    },
    {
      id: 'aud_002',
      name: 'Product Page Viewers',
      type: 'Page Visitors',
      status: 'active',
      size: 8230,
      campaignsUsed: 2,
      rules: 'Visited product pages in the last 30 days'
    },
    {
      id: 'aud_003',
      name: 'Abandoned Cart Users',
      type: 'Cart Abandoners',
      status: 'active',
      size: 1234,
      campaignsUsed: 4,
      rules: 'Added items to cart but didn\'t complete purchase in last 14 days'
    },
    {
      id: 'aud_004',
      name: 'Past Purchasers',
      type: 'Purchase History',
      status: 'active',
      size: 456,
      campaignsUsed: 2,
      rules: 'Customers who made at least one purchase in the last 90 days'
    },
    {
      id: 'aud_005',
      name: 'High-Value Customers',
      type: 'Custom Combination',
      status: 'paused',
      size: 89,
      campaignsUsed: 1,
      rules: 'Past purchasers with total value > $100 in last 180 days'
    }
  ],
  campaigns: [
    {
      id: 'camp_001',
      name: 'Dynamic Remarketing - Display',
      type: 'Display Network',
      status: 'active',
      budget: 150,
      roas: 3.2,
      audiences: ['aud_001', 'aud_002', 'aud_003']
    },
    {
      id: 'camp_002',
      name: 'Cart Abandonment - Search',
      type: 'Search Network',
      status: 'active',
      budget: 200,
      roas: 5.8,
      audiences: ['aud_003']
    },
    {
      id: 'camp_003',
      name: 'Customer Loyalty - Display',
      type: 'Display Network',
      status: 'active',
      budget: 100,
      roas: 2.4,
      audiences: ['aud_004', 'aud_005']
    },
    {
      id: 'camp_004',
      name: 'Cross-Sell Campaign',
      type: 'Display Network',
      status: 'paused',
      budget: 75,
      roas: 1.8,
      audiences: ['aud_004']
    }
  ],
  pixels: [
    {
      id: 'pixel_001',
      name: 'Meta Pixel',
      type: 'Facebook/Instagram',
      platform: 'Meta',
      status: 'active',
      pixelId: '1234567890123456',
      createdAt: '2024-01-01',
      events: 15678
    },
    {
      id: 'pixel_002',
      name: 'Google Ads Remarketing',
      type: 'Google Ads',
      platform: 'Google',
      status: 'active',
      pixelId: 'AW-123456789',
      createdAt: '2024-01-01',
      events: 12450
    },
    {
      id: 'pixel_003',
      name: 'TikTok Pixel',
      type: 'TikTok',
      platform: 'TikTok',
      status: 'inactive',
      pixelId: 'C234567890123456789012',
      createdAt: '2024-01-15',
      events: 0
    }
  ],
  recentActivity: [
    {
      type: 'campaign',
      description: 'Dynamic Remarketing campaign created',
      date: '2 hours ago'
    },
    {
      type: 'audience',
      description: 'High-Value Customers audience updated',
      date: '4 hours ago'
    },
    {
      type: 'conversion',
      description: '12 conversions from Cart Abandonment campaign',
      date: '1 day ago'
    },
    {
      type: 'campaign',
      description: 'Cross-Sell campaign paused for optimization',
      date: '2 days ago'
    }
  ]
});

// Google Colors
export const GOOGLE_COLORS = {
  primary: '#4285F4',    // Blue
  success: '#34A853',    // Green
  warning: '#FBBC04',    // Yellow
  danger: '#EA4335',     // Red
  dark: '#202124',       // Text Primary
  secondary: '#5F6368',  // Text Secondary
  background: '#F8F9FA', // Background
  white: '#FFFFFF',      // White
  border: '#E8EAED',     // Border
  light: '#F1F3F4',      // Light Gray
  purple: '#9C27B0',     // Purple
  orange: '#FF9800'      // Orange
} as const;

// Google Service Configurations
export const GOOGLE_SERVICE_CONFIGS = {
  'search-console': {
    id: 'search-console',
    name: 'Google Search Console',
    icon: '🔍',
    description: 'Monitor your site\'s search performance and visibility',
    color: GOOGLE_COLORS.primary,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    features: ['Performance tracking', 'Coverage reports', 'Indexing status', 'Mobile usability']
  },
  'merchant-center': {
    id: 'merchant-center',
    name: 'Google Merchant Center',
    icon: '🛍️',
    description: 'Manage your product listings for Google Shopping',
    color: GOOGLE_COLORS.warning,
    scopes: ['https://www.googleapis.com/auth/content'],
    features: ['Product feed management', 'Free listings', 'Shopping ads', 'Product analytics']
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google Ads',
    icon: '💰',
    description: 'Create and manage advertising campaigns',
    color: GOOGLE_COLORS.success,
    scopes: ['https://www.googleapis.com/auth/adwords'],
    features: ['Search ads', 'Shopping ads', 'Display ads', 'YouTube ads', 'Performance tracking']
  },
  'analytics': {
    id: 'analytics',
    name: 'Google Analytics 4',
    icon: '📊',
    description: 'Track and analyze your website traffic and user behavior',
    color: GOOGLE_COLORS.orange,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    features: ['Real-time analytics', 'Audience insights', 'Conversion tracking', 'Custom reports']
  },
  'business-profile': {
    id: 'business-profile',
    name: 'Google Business Profile',
    icon: '🏪',
    description: 'Manage your business listing on Google Maps and Search',
    color: GOOGLE_COLORS.danger,
    scopes: ['https://www.googleapis.com/auth/business.manage'],
    features: ['Profile management', 'Reviews', 'Posts', 'Insights', 'Messaging']
  },
  'tag-manager': {
    id: 'tag-manager',
    name: 'Google Tag Manager',
    icon: '🏷️',
    description: 'Manage marketing tags without editing code',
    color: GOOGLE_COLORS.primary,
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers'],
    features: ['Tag management', 'Triggers', 'Variables', 'Version control']
  },
  'remarketing': {
    id: 'remarketing',
    name: 'Google Remarketing',
    icon: '🔔',
    description: 'Create remarketing audiences and campaigns',
    color: GOOGLE_COLORS.purple,
    scopes: ['https://www.googleapis.com/auth/adwords'],
    features: ['Audience creation', 'Remarketing campaigns', 'Dynamic ads', 'Cross-platform tracking']
  },
  'display-ads': {
    id: 'display-ads',
    name: 'Google Display Ads',
    icon: '🎨',
    description: 'Create visual ads across the Google Display Network',
    color: GOOGLE_COLORS.secondary,
    scopes: ['https://www.googleapis.com/auth/adwords'],
    features: ['Display campaigns', 'Responsive ads', 'Targeting options', 'Remarketing']
  }
} as const;
