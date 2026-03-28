'use client';

import FacebookPixel from './FacebookPixel';
import GoogleAnalytics from './GoogleAnalytics';
import GoogleTagManager from './GoogleTagManager';
import TikTokPixel from './TikTokPixel';
import SnapchatPixel from './SnapchatPixel';
import PinterestPixel from './PinterestPixel';
import TwitterPixel from './TwitterPixel';
import LinkedInPixel from './LinkedInPixel';
import RedditPixel from './RedditPixel';
import MicrosoftPixel from './MicrosoftPixel';
import HotjarPixel from './HotjarPixel';
import ClarityPixel from './ClarityPixel';
import MixpanelPixel from './MixpanelPixel';

export default function AllPixels() {
  // Read from environment variables
  const config = {
    facebook: {
      enabled: process.env.NEXT_PUBLIC_FB_PIXEL_ENABLED === 'true',
      pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
    },
    google: {
      enabled: process.env.NEXT_PUBLIC_GA_ENABLED === 'true',
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      tagManagerId: process.env.NEXT_PUBLIC_GTM_ID || '',
    },
    tiktok: {
      enabled: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED === 'true',
      pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',
    },
    snapchat: {
      enabled: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ENABLED === 'true',
      pixelId: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID || '',
    },
    pinterest: {
      enabled: process.env.NEXT_PUBLIC_PINTEREST_TAG_ENABLED === 'true',
      tagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || '',
    },
    twitter: {
      enabled: process.env.NEXT_PUBLIC_TWITTER_PIXEL_ENABLED === 'true',
      pixelId: process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID || '',
    },
    linkedin: {
      enabled: process.env.NEXT_PUBLIC_LINKEDIN_INSIGHT_ENABLED === 'true',
      partnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',
    },
    reddit: {
      enabled: process.env.NEXT_PUBLIC_REDDIT_PIXEL_ENABLED === 'true',
      pixelId: process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || '',
    },
    microsoft: {
      enabled: process.env.NEXT_PUBLIC_MS_UET_ENABLED === 'true',
      uetTagId: process.env.NEXT_PUBLIC_MS_UET_TAG_ID || '',
    },
    hotjar: {
      enabled: process.env.NEXT_PUBLIC_HOTJAR_ENABLED === 'true',
      siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || '',
    },
    clarity: {
      enabled: process.env.NEXT_PUBLIC_CLARITY_ENABLED === 'true',
      projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '',
    },
    mixpanel: {
      enabled: process.env.NEXT_PUBLIC_MIXPANEL_ENABLED === 'true',
      token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
    },
  };

  return (
    <>
      {/* Facebook Pixel */}
      <FacebookPixel
        pixelId={config.facebook.pixelId}
        enabled={config.facebook.enabled}
      />

      {/* Google Analytics 4 */}
      <GoogleAnalytics
        measurementId={config.google.measurementId}
        enabled={config.google.enabled && !!config.google.measurementId}
      />

      {/* Google Tag Manager */}
      <GoogleTagManager
        tagManagerId={config.google.tagManagerId}
        enabled={config.google.enabled && !!config.google.tagManagerId}
      />

      {/* TikTok Pixel */}
      <TikTokPixel
        pixelId={config.tiktok.pixelId}
        enabled={config.tiktok.enabled}
      />

      {/* Snapchat Pixel */}
      <SnapchatPixel
        pixelId={config.snapchat.pixelId}
        enabled={config.snapchat.enabled}
      />

      {/* Pinterest Tag */}
      <PinterestPixel
        tagId={config.pinterest.tagId}
        enabled={config.pinterest.enabled}
      />

      {/* Twitter/X Pixel */}
      <TwitterPixel
        pixelId={config.twitter.pixelId}
        enabled={config.twitter.enabled}
      />

      {/* LinkedIn Insight Tag */}
      <LinkedInPixel
        partnerId={config.linkedin.partnerId}
        enabled={config.linkedin.enabled}
      />

      {/* Reddit Pixel */}
      <RedditPixel
        pixelId={config.reddit.pixelId}
        enabled={config.reddit.enabled}
      />

      {/* Microsoft/Bing UET */}
      <MicrosoftPixel
        uetTagId={config.microsoft.uetTagId}
        enabled={config.microsoft.enabled}
      />

      {/* Hotjar - Heatmaps & Session Recording */}
      <HotjarPixel
        siteId={config.hotjar.siteId}
        enabled={config.hotjar.enabled}
      />

      {/* Microsoft Clarity - Heatmaps & Session Recording */}
      <ClarityPixel
        projectId={config.clarity.projectId}
        enabled={config.clarity.enabled}
      />

      {/* Mixpanel - Product Analytics */}
      <MixpanelPixel
        token={config.mixpanel.token}
        enabled={config.mixpanel.enabled}
      />
    </>
  );
}
