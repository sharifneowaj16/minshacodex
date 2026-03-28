/**
 * Geographical Tracking Types for Bangladesh
 */

export interface CustomerLocation {
  division?: string;
  district?: string;
  thana?: string;
  area?: string;
  village?: string;
  postalCode?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OrderLocation extends CustomerLocation {
  orderId: string;
  customerId: string;
  orderValue: number;
  orderDate: Date;
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface RegionalSales {
  location: string;
  type: 'division' | 'district' | 'thana' | 'area';
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  growth: number; // percentage
}

export interface TopCustomerByRegion {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  location: CustomerLocation;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  loyaltyPoints?: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  yearlyGiftEligible: boolean;
  yearlyGiftAwarded?: {
    year: number;
    giftName: string;
    giftValue: number;
    awardedDate: Date;
  };
}

export interface CampaignTargeting {
  id: string;
  name: string;
  targetLocations: {
    divisions?: string[];
    districts?: string[];
    thanas?: string[];
    areas?: string[];
  };
  estimatedReach: number;
  budget?: number;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
}
