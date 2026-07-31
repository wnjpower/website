import type { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/site';

/**
 * 웹앱 매니페스트.
 *
 * 있어야 하는 이유는 아이폰 때문이다. 아이폰 사파리는 사이트를 **홈 화면에
 * 추가한 상태(PWA)**에서만 웹 푸시 알림을 허용한다(iOS 16.4+). 매니페스트가
 * 없으면 홈 화면 추가는 되지만 앱처럼 실행되지 않아 알림 권한을 요청할 수 없다.
 * 안드로이드·PC 크롬은 매니페스트 없이도 알림이 되지만, 설치형으로 띄워두면
 * 사장님이 어드민을 앱처럼 열 수 있어 함께 이득이다.
 *
 * start_url은 '/'로 둔다. 일반 방문자가 설치하는 경우도 있어서 어드민을
 * 시작 화면으로 삼지 않는다. 알림을 누르면 어드민이 바로 열리므로 문제없다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY.name,
    short_name: '우앤주전력',
    description: '대구·경북 전기공사 · 배전반 · 태양광 — 주식회사 우앤주전력',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ko',
    background_color: '#ffffff',
    // app/layout.tsx의 viewport.themeColor와 같은 값으로 유지할 것
    theme_color: '#0F2E4D',
    icons: [
      {
        src: '/images/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
