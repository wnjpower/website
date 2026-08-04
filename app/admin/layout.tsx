import type { Metadata } from 'next';
import { blueprintFontClass } from '@/lib/fonts';
import '@/components/redesign/blueprint.css';
import '@/components/admin/admin.css';

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
 * 이 레이아웃이 하는 일은 테마를 씌우는 것뿐이다.
 *
 * 사이트 본문과 같은 1b 블루프린트 토큰을 여기서 켜므로, 로그인 화면·권한 없음
 * 화면·대시보드가 모두 같은 팔레트를 쓴다. 직전까지는 어드민만 옛 네이비
 * 팔레트에 남아 있어서, 사장님이 "사이트 보기"와 어드민을 오갈 때마다 다른
 * 제품처럼 보였다.
 *
 * 사이드바가 있는 셸은 (dashboard) 라우트 그룹 레이아웃이 담당한다.
 * 로그인 화면은 사이드바 없이 나와야 하기 때문이다. 라우트 그룹은 URL에
 * 나타나지 않으므로 주소는 그대로 /admin, /admin/content … 이다.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`blueprint-theme admin-theme ${blueprintFontClass}`}>{children}</div>
  );
}
