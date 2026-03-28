// TypeScript interfaces for Social Media Management System

export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  followers: number;
  engagement: number;
  lastPost?: {
    content: string;
    date: string;
    likes: number;
    comments: number;
    shares?: number;
    media?: string[];
  };
  scheduledPosts: number;
  username?: string;
  profileImage?: string;
}

export interface PostData {
  id?: string;
  platforms: string[];
  content: string;
  media: MediaItem[];
  hashtags: string[];
  mentions: string[];
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: Engagement;
  platformSpecific?: PlatformSpecificOptions;
  createdAt?: Date;
  publishedAt?: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  aspectRatio: number;
  caption?: string;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  clicks?: number;
  saves?: number;
}

export interface PlatformSpecificOptions {
  facebook?: {
    feeling?: string;
    activity?: string;
    taggedPeople?: string[];
    location?: string;
  };
  instagram?: {
    firstComment?: string;
    locationTag?: string;
    productTags?: string[];
    isStory?: boolean;
    storyDuration?: number;
  };
  tiktok?: {
    sound?: string;
    caption?: string;
    hashtags?: string[];
    allowDuet?: boolean;
    allowStitch?: boolean;
  };
  youtube?: {
    title: string;
    description: string;
    tags: string[];
    thumbnail?: string;
    category: string;
    isShort: boolean;
    privacy: 'public' | 'private' | 'unlisted';
  };
  twitter?: {
    thread?: boolean;
    poll?: {
      options: string[];
      duration: number;
    };
  };
  linkedin?: {
    article?: {
      title: string;
      body: string;
      coverImage?: string;
    };
    document?: string;
  };
  pinterest?: {
    board: string;
    link?: string;
    altText?: string;
  };
  whatsapp?: {
    broadcast?: boolean;
    groups?: string[];
  };
  telegram?: {
    channel?: string;
    groups?: string[];
  };
  discord?: {
    server: string;
    channel: string;
    embed?: {
      title?: string;
      description?: string;
      color?: string;
    };
  };
}

export interface ScheduledPost extends PostData {
  id: string;
  scheduledDate: Date;
  createdAt: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
}

export interface AnalyticsData {
  overview: {
    totalFollowers: number;
    totalPosts: number;
    totalEngagement: number;
    engagementRate: number;
    topPlatform: string;
    bestTimeToPost: string;
  };
  followerGrowth: {
    date: string;
    followers: number;
  }[];
  engagementByPlatform: {
    platform: string;
    engagement: number;
    posts: number;
  }[];
  postPerformance: {
    id: string;
    platform: string;
    date: string;
    engagement: number;
    reach: number;
    content: string;
  }[];
  bestPostingTimes: {
    hour: number;
    day: string;
    engagement: number;
  }[];
  contentTypePerformance: {
    type: 'image' | 'video' | 'text' | 'carousel';
    count: number;
    engagement: number;
    reach: number;
  }[];
}

export interface PlatformAnalytics {
  platform: string;
  followers: number;
  posts: number;
  reach: number;
  impressions: number;
  engagement: Engagement;
  topPost: {
    content: string;
    date: string;
    engagement: Engagement;
    media?: string[];
  };
  demographics?: {
    ageGroups: { range: string; percentage: number }[];
    genders: { gender: string; percentage: number }[];
    countries: { country: string; percentage: number }[];
  };
  growth: {
    rate: number;
    timeframe: string;
  };
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  currentDate: Date;
  selectedDate?: Date;
  filterPlatforms: string[];
  filterStatus: ('scheduled' | 'published' | 'draft' | 'failed')[];
}

export interface CalendarPost {
  id: string;
  title: string;
  date: Date;
  platforms: string[];
  status: 'scheduled' | 'published' | 'draft' | 'failed';
  color: string;
  content?: string;
  media?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  permissions: {
    canPost: boolean;
    canSchedule: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAnalytics: boolean;
  };
}

export interface ContentTemplate {
  id: string;
  name: string;
  content: string;
  media: MediaItem[];
  hashtags: string[];
  platforms: string[];
  category: string;
  usageCount: number;
  createdAt: Date;
  lastUsed?: Date;
}

export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  color: string;
  usageCount: number;
}

export interface MarketingSettings {
  timezone: string;
  defaultPlatforms: string[];
  autoSave: boolean;
  notificationPreferences: {
    postPublished: boolean;
    postFailed: boolean;
    analyticsReport: boolean;
    teamActivity: boolean;
  };
  aiSuggestions: boolean;
  contentLibrary: boolean;
  teamCollaboration: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  platforms: string[];
  posts: ScheduledPost[];
  budget?: number;
  goals: string[];
  status: 'active' | 'completed' | 'planned' | 'paused';
}

// Platform configurations
export const PLATFORM_CONFIGS = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'fileText',
    color: '#1877F2',
    characterLimit: 63206,
    supportedMedia: ['image', 'video', 'gif'],
    features: ['posts', 'stories', 'reels', 'shop', 'groups', 'events', 'messenger']
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    characterLimit: 2200,
    supportedMedia: ['image', 'video', 'carousel', 'reels'],
    features: ['posts', 'stories', 'reels', 'shop', 'igtv', 'guides']
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    characterLimit: 150,
    supportedMedia: ['video'],
    features: ['posts', 'shop', 'duet', 'stitch', 'sounds']
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    characterLimit: 5000,
    supportedMedia: ['video', 'thumbnail'],
    features: ['videos', 'shorts', 'playlists', 'livestream', 'premiere']
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'mapPin',
    color: '#BD081C',
    characterLimit: 500,
    supportedMedia: ['image', 'video'],
    features: ['pins', 'boards', 'idea-pins', 'shop', 'stories']
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'twitter',
    color: '#000000',
    characterLimit: 280,
    supportedMedia: ['image', 'video', 'gif'],
    features: ['tweets', 'threads', 'polls', 'spaces']
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    characterLimit: 3000,
    supportedMedia: ['image', 'video', 'document'],
    features: ['posts', 'articles', 'documents', 'polls', 'events']
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: 'messageCircle',
    color: '#25D366',
    characterLimit: 1024,
    supportedMedia: ['image', 'video', 'document'],
    features: ['status', 'broadcast', 'auto-reply', 'catalog']
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    color: '#0088CC',
    characterLimit: 4096,
    supportedMedia: ['image', 'video', 'document'],
    features: ['channels', 'groups', 'bots', 'stories']
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: 'gamepad2',
    color: '#5865F2',
    characterLimit: 2000,
    supportedMedia: ['image', 'video', 'gif'],
    features: ['servers', 'channels', 'embeds', 'webhooks']
  }
} as const;

// Mock data generator
export const generateMockPlatforms = (): Platform[] => [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'fileText',
    color: '#1877F2',
    connected: true,
    followers: 12500,
    engagement: 8.5,
    lastPost: {
      content: 'New collection arrived! Check out our latest skincare line',
      date: '2 hours ago',
      likes: 340,
      comments: 28,
      shares: 45
    },
    scheduledPosts: 5
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    connected: true,
    followers: 25300,
    engagement: 12.3,
    lastPost: {
      content: 'Glow up with our new skincare line',
      date: '5 hours ago',
      likes: 892,
      comments: 67
    },
    scheduledPosts: 8
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    connected: true,
    followers: 45600,
    engagement: 18.7,
    lastPost: {
      content: '5 skincare myths debunked! #skincare #beautytips',
      date: '1 day ago',
      likes: 2340,
      comments: 156,
      shares: 89
    },
    scheduledPosts: 3
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    connected: false,
    followers: 8900,
    engagement: 6.2,
    scheduledPosts: 2
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'mapPin',
    color: '#BD081C',
    connected: true,
    followers: 15700,
    engagement: 4.8,
    lastPost: {
      content: 'DIY face mask recipes you can make at home',
      date: '3 days ago',
      likes: 234,
      comments: 19
    },
    scheduledPosts: 6
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'twitter',
    color: '#000000',
    connected: true,
    followers: 8200,
    engagement: 3.4,
    lastPost: {
      content: 'Flash sale! 30% off all makeup today only',
      date: '4 hours ago',
      likes: 89,
      comments: 12,
      shares: 23
    },
    scheduledPosts: 4
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    connected: false,
    followers: 3200,
    engagement: 2.1,
    scheduledPosts: 1
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: 'messageCircle',
    color: '#25D366',
    connected: true,
    followers: 0, // Not applicable
    engagement: 0,
    scheduledPosts: 0
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    color: '#0088CC',
    connected: false,
    followers: 1200,
    engagement: 1.8,
    scheduledPosts: 0
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'gamepad2',
    color: '#5865F2',
    connected: true,
    followers: 3400,
    engagement: 5.2,
    scheduledPosts: 2
  }
];

export const generateMockScheduledPosts = (): ScheduledPost[] => [
  {
    id: '1',
    platforms: ['facebook', 'instagram'],
    content: 'Weekend special! Get 20% off all our best-selling products',
    media: [],
    hashtags: ['#weekendspecial', '#beauty', '#sale'],
    mentions: [],
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'scheduled',
    engagement: undefined,
    createdAt: new Date(),
    platformSpecific: {
      instagram: {
        firstComment: 'Don\'t miss out on this amazing deal!'
      }
    }
  },
  {
    id: '2',
    platforms: ['tiktok', 'instagram'],
    content: 'Morning routine for glowing skin',
    media: [],
    hashtags: ['#skincare', '#morningroutine', '#glowup'],
    mentions: [],
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    status: 'scheduled',
    engagement: undefined,
    createdAt: new Date(),
    platformSpecific: {
      tiktok: {
        sound: 'Trending beauty sound',
        allowDuet: true,
        allowStitch: false
      }
    }
  }
];
