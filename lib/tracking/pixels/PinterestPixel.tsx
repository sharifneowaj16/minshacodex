'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface PinterestPixelProps {
  tagId: string;
  enabled?: boolean;
}

export default function PinterestPixel({ tagId, enabled = true }: PinterestPixelProps) {
  if (!enabled || !tagId) return null;

  return (
    <>
      <Script
        id="pinterest-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
              n=window.pintrk;n.queue=[],n.version="3.0";var
              t=document.createElement("script");t.async=!0,t.src=e;var
              r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");

            pintrk('load', '${tagId}', {em: '<user_email_address>'});
            pintrk('page');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://ct.pinterest.com/v3/?event=init&tid=${tagId}&noscript=1`}
        />
      </noscript>
    </>
  );
}
