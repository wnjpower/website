import type { Metadata } from 'next';

/** 어드민은 검색엔진에 절대 노출되면 안 된다. robots.ts에서도 /admin을 막는다. */
export const metadata: Metadata = {
  title: '관리자 | 우앤주전력',
  robots: { index: false, follow: false, nocache: true },
};

/*
 * 어드민은 항상 최신 데이터를 보여야 한다. 캐시된 화면을 보고 "저장이 안 됐다"고
 * 오해하는 것이 이 화면에서 가장 흔한 사고다.
 */
export const dynamic = 'force-dynamic';

/*
 * 이 레이아웃은 일부러 비어 있다.
 * 로그인 화면(/admin/login)은 사이드바 없이 나와야 하므로, 인증 검사와 셸은
 * (dashboard) 라우트 그룹 레이아웃이 담당한다. 라우트 그룹은 URL에 나타나지 않으므로
 * 주소는 그대로 /admin, /admin/content … 이다.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
