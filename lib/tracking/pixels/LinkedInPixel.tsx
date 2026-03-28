'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface LinkedInPixelProps {
  partnerId: string;
  enabled?: boolean;
}

export default function LinkedInPixel({ partnerId, enabled = true }: LinkedInPixelProps) {
  if (!enabled || !partnerId) return null;

  return (
    <>
      <Script
        id="linkedin-insight"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            _linkedin_partner_id = "${partnerId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `,
        }}
      />
      <Script
        id="linkedin-insight-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);})(window.lintrk);
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif`}
        />
      </noscript>
    </>
  );
}
