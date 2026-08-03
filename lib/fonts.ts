import { Barlow, Barlow_Condensed } from 'next/font/google';

/**
 * 1b 블루프린트 디자인의 라틴 표시 서체.
 *
 * 이관 스펙(§2)은 Barlow / Barlow Condensed / IBM Plex Sans KR 세 벌을 지정하지만
 * 한글 폴백은 이미 전역으로 싣고 있는 Pretendard를 쓴다. 한글 웹폰트는 용량이
 * 커서(수 MB) 두 벌을 동시에 받게 하면 모바일 첫 화면이 눈에 띄게 느려지는데,
 * 이 디자인에서 한글이 담당하는 역할은 본문 가독성이고 그건 Pretendard로 충분하다.
 * 디자인의 인상을 만드는 응축형 라틴 서체(Barlow Condensed)만 정확히 가져온다.
 *
 * CDN <link> 대신 next/font를 쓰는 이유: 폰트 파일이 자체 호스팅되어 외부 요청이
 * 사라지고, 빌드 시점에 크기를 알 수 있어 폰트 교체로 인한 레이아웃 이동이 없다.
 */

export const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-barlow',
});

export const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-barlow-condensed',
});

/** 블루프린트 테마 루트에 붙이는 클래스 — 폰트 변수 + 토큰 스코프 */
export const blueprintFontClass = `${barlow.variable} ${barlowCondensed.variable}`;
