import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SchemaOrg from "@/components/SchemaOrg";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ClickTracking from "@/components/ClickTracking";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "대구·경북 공장 전기공사 | 수전설비·배전반 설치 | 우앤주전력",
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
  // 홈에도 canonical을 명시한다. 없으면 apex·www가 별도 URL로 색인될 수 있다.
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  verification: {
    other: {
      'naver-site-verification': ['f7b584dc796aff64d9a1fe441b6d9df228316a23'],
    },
  },
  metadataBase: new URL(SITE_URL),
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
        <GoogleAnalytics />
        <ClickTracking />
        <SchemaOrg />
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
