import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SchemaOrg from "@/components/SchemaOrg";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Tracker from "@/components/analytics/Tracker";
import { SITE_URL } from "@/lib/site";

/**
 * 홈의 title·description은 app/page.tsx의 generateMetadata가 어드민 값으로 덮는다.
 * 여기 있는 값은 그 외 페이지의 기본값이자, DB를 못 읽을 때의 안전망이다.
 */
export const metadata: Metadata = {
  title: {
    default: "대구·경북 공장 전기공사 | 수전설비·배전반 설치 | 우앤주전력",
    template: "%s | 우앤주전력",
  },
  description:
    "대구·경북 공장 전기공사 전문. 신축·증축·수전설비·계약전력 증설·배전반 설계·설치. 인테리어 전기. 무료 견적 053-525-0424",
  keywords: ["대구 공장 전기공사", "경북 공장 전기", "수전설비 공사", "계약전력 증설", "배전반 설치", "분전반 설치", "동력설비 공사", "전기공사업", "우앤주전력", "대구 서구"],
  openGraph: {
    title: "대구·경북 공장 전기공사 | 수전설비·배전반 설치 | 우앤주전력",
    description:
      "공장 신축·증축·증설 / 수전설비·계약전력 증설 / 배전반 설계·설치 — 전기공사업 면허 법인, 무료 견적 053-525-0424",
    url: SITE_URL,
    siteName: "우앤주전력",
    locale: "ko_KR",
    type: "website",
  },
  // OG·트위터 이미지는 app/opengraph-image.tsx에서 자동 주입된다
  twitter: {
    card: "summary_large_image",
    title: "대구·경북 공장 전기공사 | 수전설비·배전반 설치 | 우앤주전력",
    description:
      "공장 신축·증축·증설 / 수전설비·계약전력 증설 / 배전반 설계·설치 — 전기공사업 면허 법인, 무료 견적 053-525-0424",
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    // 네이버·구글이 스니펫·이미지를 최대한 활용하도록 명시한다.
    // 지정하지 않으면 검색사가 임의로 짧게 자르는 경우가 있다.
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  verification: {
    other: {
      'naver-site-verification': ['f7b584dc796aff64d9a1fe441b6d9df228316a23'],
    },
  },
  metadataBase: new URL(SITE_URL),
  formatDetection: { telephone: true, address: false, email: false },
};

/**
 * viewportFit: 'cover' — 아이폰 노치·홈 인디케이터 영역까지 배경을 채운다.
 * 하단 고정 CTA 바는 globals.css에서 safe-area-inset-bottom을 더해 가려지지 않게 했다.
 * maximumScale을 두지 않는 이유: 확대를 막으면 저시력 사용자가 본문을 읽을 수 없다.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F2E4D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <head>
        {/* Pretendard Variable 웹폰트 CDN */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* JS 비활성 시 스크롤 등장 요소를 항상 보이도록 폴백 */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {/*
          구형 브라우저 안내. 평소에는 CSS가 display:none으로 감춰 두고,
          color-mix를 지원하지 않는 브라우저(Safari 16.3 이하 / Chrome 110 이하 등)
          에서만 나타난다. 그런 환경에서는 레이아웃이 깨지므로, 깨진 화면을
          말없이 보여주는 대신 전화로 바로 연결될 길을 준다.
        */}
        <div className="legacy-browser-notice">
          브라우저 버전이 오래되어 화면이 정상적으로 보이지 않을 수 있습니다.
          최신 브라우저로 열어주시거나{' '}
          <a href="tel:010-8552-9994">010-8552-9994</a> 로 전화 주세요.
        </div>

        <GoogleAnalytics />
        {/*
          Tracker는 useSearchParams를 쓴다. Suspense로 감싸지 않으면 이 훅이
          트리 전체를 클라이언트 렌더로 끌어내려 정적 최적화가 통째로 깨진다.
        */}
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <SchemaOrg />
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
