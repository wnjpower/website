'use client';

import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '7XRHSS9V0F';

export default function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}

export function gtagEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === 'undefined' || !GA_ID) return;
  // @ts-expect-error gtag is injected by the Script above
  window.gtag?.('event', eventName, params);
}
