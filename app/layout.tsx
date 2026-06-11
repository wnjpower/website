import type { Metadata } from "next";
import "./globals.css";
import SchemaOrg from "@/components/SchemaOrg";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "대구 전기공사 | 태양광 시공 | 우앤주전력 (대구 서구 평리동)",
  description:
    "대구·경북 전기공사 전문업체 우앤주전력. 전기공사업 면허, 태양광 발전설비 시공, 실내 인테리어 전기. 무료 견적 문의 053-525-0424",
  keywords: ["대구 전기공사", "대구 태양광", "인테리어 전기", "전기공사업", "우앤주전력", "대구 서구"],
  openGraph: {
    title: "대구 전기공사 | 태양광 시공 | 우앤주전력",
    description:
      "전기공사업 면허 / 태양광 발전설비 / 인테리어 전기 — 견적 무료 상담 053-525-0424",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wnj-electric.vercel.app",
    siteName: "우앤주전력",
    locale: "ko_KR",
    type: "website",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://wnj-electric.vercel.app"
  ),
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
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SchemaOrg />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
