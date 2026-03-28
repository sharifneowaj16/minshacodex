/**
 * Universal Tracking Manager
 * Centralized system to manage all tracking platforms
 */

import { TrackingEvent, TrackingEventData, AllPlatformsConfig, CustomerSession } from '@/types/tracking';
import {
  ensureStoredTrackingDeviceId,
  getStoredTrackingDeviceId,
  setStoredTrackingDeviceId,
} from '@/lib/tracking/device';

// Extend Window interface for tracking platform globals
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
    ttq: { track: (...args: any[]) => void };
    snaptr: (...args: any[]) => void;
    pintrk: (...args: any[]) => void;
    twq: (...args: any[]) => void;
    _linkedin_data_partner_ids: string[];
    lintrk: (...args: any[]) => void;
    rdt: (...args: any[]) => void;
    uetq: any[];
    mixpanel: { track: (...args: any[]) => void };
  }
}

class TrackingManager {
  private config: AllPlatformsConfig;
  private sessionData: CustomerSession | null = null;
  private initialized = false;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load tracking configuration from environment variables and settings
   */
  private loadConfig(): AllPlatformsConfig {
    return {
      facebook: {
        enabled: !!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
        accessToken: process.env.FACEBOOK_CONVERSION_API_TOKEN,
        testEventCode: process.env.FACEBOOK_TEST_EVENT_CODE,
      },
      google: {
        enabled: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
        measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
        tagManagerId: process.env.NEXT_PUBLIC_GTM_ID,
        adsConversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
        adsConversionLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
      },
      tiktok: {
        enabled: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
        pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',
      },
      snapchat: {
        enabled: !!process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID,
        pixelId: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID || '',
      },
      pinterest: {
        enabled: !!process.env.NEXT_PUBLIC_PINTEREST_TAG_ID,
        tagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || '',
      },
      twitter: {
        enabled: !!process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID,
        pixelId: process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID || '',
      },
      linkedin: {
        enabled: !!process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
        partnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',
      },
      reddit: {
        enabled: !!process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID,
        pixelId: process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || '',
      },
      microsoft: {
        enabled: !!process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID,
        uetTagId: process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID || '',
      },
      hotjar: {
        enabled: !!process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
        siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || '',
      },
      clarity: {
        enabled: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
        projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '',
      },
      mixpanel: {
        enabled: !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
        token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
      },
    };
  }

  /**
   * Initialize tracking session
   */
  initSession(): void {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = this.getOrCreateDeviceId();

    this.sessionData = {
      sessionId: this.generateSessionId(),
      deviceId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      referrer: document.referrer,
      landingPage: window.location.href,
      currentPage: window.location.href,
      utmParams: {
        source: urlParams.get('utm_source') || undefined,
        medium: urlParams.get('utm_medium') || undefined,
        campaign: urlParams.get('utm_campaign') || undefined,
        term: urlParams.get('utm_term') || undefined,
        content: urlParams.get('utm_content') || undefined,
      },
      device: {
        type: this.getDeviceType(),
        os: this.getOS(),
        browser: this.getBrowser(),
      },
    };

    // Store UTM params in localStorage for attribution
    if (this.sessionData.utmParams?.source) {
      localStorage.setItem('first_touch_utm', JSON.stringify(this.sessionData.utmParams));
    }
    localStorage.setItem('last_touch_utm', JSON.stringify(this.sessionData.utmParams));

    this.initialized = true;

    // Async DB sync — fire-and-forget, no UI blocking
    this.syncSessionToDB(deviceId, this.sessionData.utmParams);
  }

  /**
   * Sync device ID and UTM params to database
   */
  private async syncSessionToDB(
    deviceId: string,
    utmParams: CustomerSession['utmParams']
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    const hasUtmSource = !!utmParams?.source;
    const payload: Record<string, unknown> = { deviceId };

    if (hasUtmSource) {
      // Only send firstTouchUtm when there's actually a UTM source
      payload.firstTouchUtm = utmParams;
    }
    // Always update lastTouchUtm
    payload.lastTouchUtm = utmParams;

    try {
      const response = await fetch('/api/tracking-device', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
        });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const canonicalDeviceId =
          data && typeof data.deviceId === 'string' ? data.deviceId : null;

        if (canonicalDeviceId) {
          setStoredTrackingDeviceId(canonicalDeviceId);
          if (this.sessionData && this.sessionData.deviceId === deviceId) {
            this.sessionData.deviceId = canonicalDeviceId;
          }
        }
      }
    } catch {
      // Silently fail — localStorage still has the data
    }
  }

  /**
   * Track event across all enabled platforms
   */
  track(event: TrackingEvent, data?: TrackingEventData): void {
    if (!this.initialized) {
      this.initSession();
    }

    // Add event to session
    if (this.sessionData) {
      this.sessionData.events.push({
        event,
        timestamp: Date.now(),
        data,
      });
      this.sessionData.lastActivity = Date.now();
    }

    // Enrich data with UTM params
    const enrichedData = {
      ...data,
      ...this.sessionData?.utmParams,
    };

    // Track on all enabled platforms
    if (this.config.facebook.enabled) {
      this.trackFacebook(event, enrichedData);
    }
    if (this.config.google.enabled) {
      this.trackGoogle(event, enrichedData);
    }
    if (this.config.tiktok.enabled) {
      this.trackTikTok(event, enrichedData);
    }
    if (this.config.snapchat.enabled) {
      this.trackSnapchat(event, enrichedData);
    }
    if (this.config.pinterest.enabled) {
      this.trackPinterest(event, enrichedData);
    }
    if (this.config.twitter.enabled) {
      this.trackTwitter(event, enrichedData);
    }
    if (this.config.linkedin.enabled) {
      this.trackLinkedIn(event, enrichedData);
    }
    if (this.config.reddit.enabled) {
      this.trackReddit(event, enrichedData);
    }
    if (this.config.microsoft.enabled) {
      this.trackMicrosoft(event, enrichedData);
    }
    if (this.config.mixpanel.enabled) {
      this.trackMixpanel(event, enrichedData);
    }

    // Send to server for storage and analysis
    this.sendToServer(event, enrichedData);
  }

  /**
   * Track on Facebook Pixel
   */
  private trackFacebook(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.fbq) return;

    const fbEvent = this.mapToFacebookEvent(event);
    window.fbq('track', fbEvent, data as Record<string, any>);
  }

  /**
   * Track on Google Analytics 4
   */
  private trackGoogle(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.gtag) return;

    const gaEvent = this.mapToGoogleEvent(event);
    window.gtag('event', gaEvent, data);
  }

  /**
   * Track on TikTok Pixel
   */
  private trackTikTok(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.ttq) return;

    const ttEvent = this.mapToTikTokEvent(event);
    window.ttq.track(ttEvent, data);
  }

  /**
   * Track on Snapchat Pixel
   */
  private trackSnapchat(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.snaptr) return;

    const snapEvent = this.mapToSnapchatEvent(event);
    window.snaptr('track', snapEvent, data);
  }

  /**
   * Track on Pinterest Tag
   */
  private trackPinterest(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.pintrk) return;

    const pinterestEvent = this.mapToPinterestEvent(event);
    window.pintrk('track', pinterestEvent, data);
  }

  /**
   * Track on Twitter Pixel
   */
  private trackTwitter(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.twq) return;

    const twitterEvent = this.mapToTwitterEvent(event);
    window.twq('track', twitterEvent, data);
  }

  /**
   * Track on LinkedIn Insight Tag
   */
  private trackLinkedIn(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window._linkedin_data_partner_ids) return;

    const linkedInEvent = this.mapToLinkedInEvent(event);
    window.lintrk('track', { conversion_id: linkedInEvent });
  }

  /**
   * Track on Reddit Pixel
   */
  private trackReddit(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.rdt) return;

    const redditEvent = this.mapToRedditEvent(event);
    window.rdt('track', redditEvent, data);
  }

  /**
   * Track on Microsoft/Bing UET
   */
  private trackMicrosoft(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.uetq) return;

    const msEvent = this.mapToMicrosoftEvent(event);
    window.uetq.push('event', msEvent, data);
  }

  /**
   * Track on Mixpanel
   */
  private trackMixpanel(event: TrackingEvent, data?: TrackingEventData): void {
    if (typeof window === 'undefined' || !window.mixpanel) return;

    window.mixpanel.track(event, data);
  }

  /**
   * Send tracking data to server for storage and analysis
   */
  private async sendToServer(event: TrackingEvent, data?: TrackingEventData): Promise<void> {
    try {
      await fetch('/api/tracking/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          session: this.sessionData,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to send tracking event to server:', error);
    }
  }

  /**
   * Event mapping functions
   */
  private mapToFacebookEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'PageView',
      ViewContent: 'ViewContent',
      Search: 'Search',
      AddToCart: 'AddToCart',
      AddToWishlist: 'AddToWishlist',
      InitiateCheckout: 'InitiateCheckout',
      AddPaymentInfo: 'AddPaymentInfo',
      Purchase: 'Purchase',
      Lead: 'Lead',
      CompleteRegistration: 'CompleteRegistration',
      Subscribe: 'Subscribe',
      StartTrial: 'StartTrial',
      SubmitApplication: 'SubmitApplication',
      Contact: 'Contact',
    };
    return mapping[event];
  }

  private mapToGoogleEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'page_view',
      ViewContent: 'view_item',
      Search: 'search',
      AddToCart: 'add_to_cart',
      AddToWishlist: 'add_to_wishlist',
      InitiateCheckout: 'begin_checkout',
      AddPaymentInfo: 'add_payment_info',
      Purchase: 'purchase',
      Lead: 'generate_lead',
      CompleteRegistration: 'sign_up',
      Subscribe: 'subscribe',
      StartTrial: 'start_trial',
      SubmitApplication: 'submit_application',
      Contact: 'contact',
    };
    return mapping[event];
  }

  private mapToTikTokEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'ViewContent',
      ViewContent: 'ViewContent',
      Search: 'Search',
      AddToCart: 'AddToCart',
      AddToWishlist: 'AddToWishlist',
      InitiateCheckout: 'InitiateCheckout',
      AddPaymentInfo: 'AddPaymentInfo',
      Purchase: 'CompletePayment',
      Lead: 'SubmitForm',
      CompleteRegistration: 'CompleteRegistration',
      Subscribe: 'Subscribe',
      StartTrial: 'StartTrial',
      SubmitApplication: 'SubmitForm',
      Contact: 'Contact',
    };
    return mapping[event];
  }

  private mapToSnapchatEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'PAGE_VIEW',
      ViewContent: 'VIEW_CONTENT',
      Search: 'SEARCH',
      AddToCart: 'ADD_CART',
      AddToWishlist: 'ADD_TO_WISHLIST',
      InitiateCheckout: 'START_CHECKOUT',
      AddPaymentInfo: 'ADD_BILLING',
      Purchase: 'PURCHASE',
      Lead: 'SIGN_UP',
      CompleteRegistration: 'SIGN_UP',
      Subscribe: 'SUBSCRIBE',
      StartTrial: 'START_TRIAL',
      SubmitApplication: 'SUBMIT_APPLICATION',
      Contact: 'CONTACT',
    };
    return mapping[event];
  }

  private mapToPinterestEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'pagevisit',
      ViewContent: 'viewcategory',
      Search: 'search',
      AddToCart: 'addtocart',
      AddToWishlist: 'watchvideo',
      InitiateCheckout: 'checkout',
      AddPaymentInfo: 'addpaymentinfo',
      Purchase: 'checkout',
      Lead: 'lead',
      CompleteRegistration: 'signup',
      Subscribe: 'signup',
      StartTrial: 'watchvideo',
      SubmitApplication: 'lead',
      Contact: 'custom',
    };
    return mapping[event];
  }

  private mapToTwitterEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'PageView',
      ViewContent: 'ViewContent',
      Search: 'Search',
      AddToCart: 'AddToCart',
      AddToWishlist: 'AddToWishlist',
      InitiateCheckout: 'InitiateCheckout',
      AddPaymentInfo: 'AddPaymentInfo',
      Purchase: 'Purchase',
      Lead: 'tw-o8wu4-ofh3r',
      CompleteRegistration: 'tw-o8wu4-ofh3s',
      Subscribe: 'Subscribe',
      StartTrial: 'StartTrial',
      SubmitApplication: 'SubmitApplication',
      Contact: 'Contact',
    };
    return mapping[event];
  }

  private mapToLinkedInEvent(event: TrackingEvent): string {
    return '12345'; // Replace with actual conversion ID from LinkedIn
  }

  private mapToRedditEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'PageVisit',
      ViewContent: 'ViewContent',
      Search: 'Search',
      AddToCart: 'AddToCart',
      AddToWishlist: 'AddToWishlist',
      InitiateCheckout: 'Purchase',
      AddPaymentInfo: 'AddPaymentInfo',
      Purchase: 'Purchase',
      Lead: 'Lead',
      CompleteRegistration: 'SignUp',
      Subscribe: 'SignUp',
      StartTrial: 'Custom',
      SubmitApplication: 'Lead',
      Contact: 'Custom',
    };
    return mapping[event];
  }

  private mapToMicrosoftEvent(event: TrackingEvent): string {
    const mapping: Record<TrackingEvent, string> = {
      PageView: 'page_view',
      ViewContent: 'view_item',
      Search: 'search',
      AddToCart: 'add_to_cart',
      AddToWishlist: 'add_to_wishlist',
      InitiateCheckout: 'begin_checkout',
      AddPaymentInfo: 'add_payment_info',
      Purchase: 'purchase',
      Lead: 'generate_lead',
      CompleteRegistration: 'sign_up',
      Subscribe: 'subscribe',
      StartTrial: 'start_trial',
      SubmitApplication: 'submit_application',
      Contact: 'contact',
    };
    return mapping[event];
  }

  /**
   * Utility functions
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';

    let deviceId = getStoredTrackingDeviceId();
    if (!deviceId) {
      deviceId = ensureStoredTrackingDeviceId();
      // Register new device in DB (fire-and-forget)
      fetch('/api/tracking-device', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deviceId }),
      })
        .then(async (response) => {
          if (!response.ok) {
            return;
          }

          const data = await response.json().catch(() => null);
          const canonicalDeviceId =
            data && typeof data.deviceId === 'string' ? data.deviceId : null;

          if (canonicalDeviceId) {
            setStoredTrackingDeviceId(canonicalDeviceId);
            if (this.sessionData && this.sessionData.deviceId === deviceId) {
              this.sessionData.deviceId = canonicalDeviceId;
            }
          }
        })
        .catch(() => {
          // Silently fail - localStorage still has the deviceId
        // Silently fail — localStorage still has the deviceId
      });
    }
    return deviceId;
  }

  /**
   * Restore UTM data from DB into localStorage
   * Call this on user login to recover cross-device UTM history
   */
  async restoreFromDB(): Promise<void> {
    if (typeof window === 'undefined') return;

    const deviceId = getStoredTrackingDeviceId();
    if (!deviceId) return;

    try {
      const res = await fetch(
        `/api/tracking-device?deviceId=${encodeURIComponent(deviceId)}`,
        { credentials: 'include' }
      );
      if (!res.ok) return;

      const { deviceId: canonicalDeviceId, firstTouchUtm, lastTouchUtm } =
        await res.json();

      if (typeof canonicalDeviceId === 'string') {
        setStoredTrackingDeviceId(canonicalDeviceId);
      }

      if (firstTouchUtm && !localStorage.getItem('first_touch_utm')) {
        localStorage.setItem('first_touch_utm', JSON.stringify(firstTouchUtm));
      }
      if (lastTouchUtm) {
        localStorage.setItem('last_touch_utm', JSON.stringify(lastTouchUtm));
      }
    } catch {
      // Silently fall back to localStorage
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getOS(): string {
    if (typeof window === 'undefined') return 'Unknown';

    const ua = navigator.userAgent;
    if (ua.indexOf('Win') !== -1) return 'Windows';
    if (ua.indexOf('Mac') !== -1) return 'MacOS';
    if (ua.indexOf('Linux') !== -1) return 'Linux';
    if (ua.indexOf('Android') !== -1) return 'Android';
    if (ua.indexOf('iOS') !== -1) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(): string {
    if (typeof window === 'undefined') return 'Unknown';

    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') !== -1) return 'Firefox';
    if (ua.indexOf('Chrome') !== -1) return 'Chrome';
    if (ua.indexOf('Safari') !== -1) return 'Safari';
    if (ua.indexOf('Edge') !== -1) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get current session data
   */
  getSession(): CustomerSession | null {
    return this.sessionData;
  }

  /**
   * Get platform configuration
   */
  getConfig(): AllPlatformsConfig {
    return this.config;
  }
}

// Export singleton instance
export const trackingManager = new TrackingManager();

// Convenience functions
export const track = (event: TrackingEvent, data?: TrackingEventData) => {
  trackingManager.track(event, data);
};

export const initTracking = () => {
  trackingManager.initSession();
};
