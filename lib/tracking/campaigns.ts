import type { CampaignAttribution } from '@/types/tracking';
import {
  ensureStoredTrackingDeviceId,
  setStoredTrackingDeviceId,
} from '@/lib/tracking/device';

/**
 * Campaign Tracking & Attribution System
 *
 * Handles UTM parameters, multi-touch attribution, and campaign performance tracking
 */

export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
}

export interface Campaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  revenue?: number;
  status: 'active' | 'paused' | 'completed';
}

export class CampaignTracker {
  // Debounce timer for touchpoints sync (called on every page load)
  private static touchpointSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private static SYNC_DELAY_MS = 4000;

  /**
   * Extract UTM parameters from URL
   */
  static getUTMParams(url?: string): UTMParameters {
    const searchParams = new URLSearchParams(
      url ? new URL(url).search : window.location.search
    );

    return {
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
      utm_term: searchParams.get('utm_term') || undefined,
      utm_content: searchParams.get('utm_content') || undefined,
      utm_id: searchParams.get('utm_id') || undefined,
    };
  }

  /**
   * Store first-touch attribution (never overwrite) + async DB sync
   */
  static setFirstTouch(utm: UTMParameters): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem('first_touch_attribution');
    if (!existing && Object.keys(utm).some(k => utm[k as keyof UTMParameters])) {
      const touch = { ...utm, timestamp: Date.now() };
      localStorage.setItem('first_touch_attribution', JSON.stringify(touch));
      // Sync immediately — first-touch is critical and written only once
      this.syncToDB({ firstTouch: touch });
    }
  }

  /**
   * Store last-touch attribution (always update) + async DB sync
   */
  static setLastTouch(utm: UTMParameters): void {
    if (typeof window === 'undefined') return;

    if (Object.keys(utm).some(k => utm[k as keyof UTMParameters])) {
      const touch = { ...utm, timestamp: Date.now() };
      localStorage.setItem('last_touch_attribution', JSON.stringify(touch));
      // Sync immediately — last-touch is important for conversion attribution
      this.syncToDB({ lastTouch: touch });
    }
  }

  /**
   * Get first-touch attribution
   */
  static getFirstTouch(): (UTMParameters & { timestamp: number }) | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem('first_touch_attribution');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get last-touch attribution
   */
  static getLastTouch(): (UTMParameters & { timestamp: number }) | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem('last_touch_attribution');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Store touchpoint for multi-touch attribution + debounced DB sync
   */
  static addTouchpoint(utm: UTMParameters): void {
    if (typeof window === 'undefined') return;

    if (!Object.keys(utm).some(k => utm[k as keyof UTMParameters])) return;

    const touchpoints = this.getTouchpoints();
    touchpoints.push({ ...utm, timestamp: Date.now() });

    // Keep only last 10 touchpoints
    const limited = touchpoints.slice(-10);
    localStorage.setItem('touchpoints', JSON.stringify(limited));

    // Debounced sync — touchpoints can be added frequently on page loads
    if (this.touchpointSyncTimer) clearTimeout(this.touchpointSyncTimer);
    this.touchpointSyncTimer = setTimeout(() => {
      this.syncToDB({ touchpoints: limited });
    }, this.SYNC_DELAY_MS);
  }

  /**
   * Get all touchpoints
   */
  static getTouchpoints(): Array<UTMParameters & { timestamp: number }> {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem('touchpoints');
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get campaign attribution model
   */
  static getAttribution(model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay'): CampaignAttribution | null {
    if (typeof window === 'undefined') return null;

    const firstTouch = this.getFirstTouch();
    const lastTouch = this.getLastTouch();
    const touchpoints = this.getTouchpoints();

    if (!firstTouch && !lastTouch) return null;

    switch (model) {
      case 'first_touch':
        return firstTouch ? {
          model: 'first_touch',
          touchpoints: [firstTouch],
          attribution: { [this.getTouchpointKey(firstTouch)]: 1.0 },
        } : null;

      case 'last_touch':
        return lastTouch ? {
          model: 'last_touch',
          touchpoints: [lastTouch],
          attribution: { [this.getTouchpointKey(lastTouch)]: 1.0 },
        } : null;

      case 'linear':
        if (touchpoints.length === 0) return null;
        const linearWeight = 1.0 / touchpoints.length;
        return {
          model: 'linear',
          touchpoints,
          attribution: touchpoints.reduce((acc, tp) => {
            const key = this.getTouchpointKey(tp);
            acc[key] = (acc[key] || 0) + linearWeight;
            return acc;
          }, {} as Record<string, number>),
        };

      case 'time_decay':
        if (touchpoints.length === 0) return null;
        const now = Date.now();
        const weights = touchpoints.map(tp => {
          const ageInDays = (now - tp.timestamp) / (1000 * 60 * 60 * 24);
          return Math.exp(-ageInDays / 7); // 7-day half-life
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        return {
          model: 'time_decay',
          touchpoints,
          attribution: touchpoints.reduce((acc, tp, i) => {
            const key = this.getTouchpointKey(tp);
            acc[key] = (acc[key] || 0) + (weights[i] / totalWeight);
            return acc;
          }, {} as Record<string, number>),
        };

      default:
        return null;
    }
  }

  /**
   * Create unique key for touchpoint
   */
  private static getTouchpointKey(utm: UTMParameters): string {
    return `${utm.utm_source || 'direct'}/${utm.utm_medium || 'none'}/${utm.utm_campaign || 'none'}`;
  }

  /**
   * Calculate ROAS (Return on Ad Spend)
   */
  static calculateROAS(revenue: number, spent: number): number {
    if (spent === 0) return 0;
    return revenue / spent;
  }

  /**
   * Calculate CPA (Cost Per Acquisition)
   */
  static calculateCPA(spent: number, conversions: number): number {
    if (conversions === 0) return 0;
    return spent / conversions;
  }

  /**
   * Calculate CTR (Click-Through Rate)
   */
  static calculateCTR(clicks: number, impressions: number): number {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  }

  /**
   * Calculate Conversion Rate
   */
  static calculateConversionRate(conversions: number, clicks: number): number {
    if (clicks === 0) return 0;
    return (conversions / clicks) * 100;
  }

  /**
   * Persist attribution data to database (async, fire-and-forget)
   */
  static async syncToDB(payload: {
    firstTouch?: Record<string, unknown>;
    lastTouch?: Record<string, unknown>;
    touchpoints?: unknown[];
  }): Promise<void> {
    if (typeof window === 'undefined') return;

    const deviceId = ensureStoredTrackingDeviceId();

    try {
      const response = await fetch('/api/campaign-attribution', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deviceId, ...payload }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && typeof data.deviceId === 'string') {
          setStoredTrackingDeviceId(data.deviceId);
        }
      }
    } catch {
      // Silently fail — localStorage still has the data
    }
  }

  /**
   * Load attribution from DB and restore into localStorage
   * Call this on app init or user login
   */
  static async loadFromDB(deviceId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const res = await fetch(
        `/api/campaign-attribution?deviceId=${encodeURIComponent(deviceId)}`,
        { credentials: 'include' }
      );
      if (!res.ok) return;

      const {
        deviceId: canonicalDeviceId,
        firstTouch,
        lastTouch,
        touchpoints,
      } = await res.json();

      if (typeof canonicalDeviceId === 'string') {
        setStoredTrackingDeviceId(canonicalDeviceId);
      }

      // Only restore if localStorage doesn't already have a value (preserve local data)
      if (firstTouch && !localStorage.getItem('first_touch_attribution')) {
        localStorage.setItem('first_touch_attribution', JSON.stringify(firstTouch));
      }
      if (lastTouch) {
        // Always restore last-touch from DB (DB may be fresher from another device)
        const local = localStorage.getItem('last_touch_attribution');
        const localTs = local ? JSON.parse(local).timestamp : 0;
        if (lastTouch.timestamp > localTs) {
          localStorage.setItem('last_touch_attribution', JSON.stringify(lastTouch));
        }
      }
      if (Array.isArray(touchpoints) && touchpoints.length > 0) {
        const local = localStorage.getItem('touchpoints');
        const localTps: Array<{ timestamp: number }> = local ? JSON.parse(local) : [];
        // Merge: keep all unique touchpoints, sorted by time, max 10
        const merged = [...localTps, ...touchpoints]
          .filter((tp, idx, arr) =>
            arr.findIndex(t => t.timestamp === tp.timestamp) === idx
          )
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-10);
        localStorage.setItem('touchpoints', JSON.stringify(merged));
      }
    } catch {
      // Silently fall back to localStorage
    }
  }

  /**
   * Clear all attribution data from localStorage
   */
  static clearAttribution(): void {
    if (typeof window === 'undefined') return;
    if (this.touchpointSyncTimer) clearTimeout(this.touchpointSyncTimer);
    localStorage.removeItem('first_touch_attribution');
    localStorage.removeItem('last_touch_attribution');
    localStorage.removeItem('touchpoints');
  }
}

/**
 * Initialize campaign tracking on page load
 */
export function initCampaignTracking(): void {
  if (typeof window === 'undefined') return;

  const utm = CampaignTracker.getUTMParams();

  // Store attribution data
  CampaignTracker.setFirstTouch(utm);
  CampaignTracker.setLastTouch(utm);
  CampaignTracker.addTouchpoint(utm);
}

/**
 * Get campaign data for conversion events
 */
export function getCampaignData(): {
  firstTouch: (UTMParameters & { timestamp: number }) | null;
  lastTouch: (UTMParameters & { timestamp: number }) | null;
  currentUTM: UTMParameters;
  attribution: CampaignAttribution | null;
} {
  return {
    firstTouch: CampaignTracker.getFirstTouch(),
    lastTouch: CampaignTracker.getLastTouch(),
    currentUTM: CampaignTracker.getUTMParams(),
    attribution: CampaignTracker.getAttribution('linear'),
  };
}
