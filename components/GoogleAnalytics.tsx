'use client';

import Script from 'next/script';

// GA4 측정 ID는 항상 'G-'로 시작한다. 환경변수에 접두어 없이 입력돼도
// 동작하도록 보정한다. (접두어가 빠지면 gtag가 조용히 실패한다)
const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-7XRHSS9V0F';
const GA_ID = RAW_GA_ID && !RAW_GA_ID.startsWith('G-') ? `G-${RAW_GA_ID}` : RAW_GA_ID;

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
