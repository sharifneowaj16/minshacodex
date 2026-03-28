'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface RedditPixelProps {
  pixelId: string;
  enabled?: boolean;
}

export default function RedditPixel({ pixelId, enabled = true }: RedditPixelProps) {
  if (!enabled || !pixelId) return null;

  return (
    <>
      <Script
        id="reddit-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);

            rdt('init','${pixelId}', {"optOut":false,"useDecimalCurrencyValues":true});
            rdt('track', 'PageVisit');
          `,
        }}
      />
    </>
  );
}
