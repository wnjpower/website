import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        /*
         * /admin — 관리자 화면. 색인되면 로그인 페이지가 검색 결과에 뜬다.
         * 로그인 없이는 아무것도 못 보므로 정보 유출은 아니지만, 검색 품질을 깎는다.
         * (실제 접근 차단은 middleware + RLS가 담당한다. robots는 크롤러에게 하는 부탁일 뿐이다)
         */
        disallow: ['/api/', '/_next/', '/admin'],
      },
      {
        // 네이버 검색로봇. 별도 규칙이 없으면 위 '*' 규칙을 따르지만,
        // 명시해 두면 서치어드바이저 진단에서 상태가 분명하게 보인다.
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
