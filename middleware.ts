import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  buildAttribution,
  serializeAttribution,
} from '@/lib/analytics/attribution';

/**
 * 미들웨어가 맡는 일은 두 가지다.
 *
 *  1) 방문자 식별 + 유입 경로 기록 (모든 공개 페이지)
 *     세션 쿠키를 여기서 심어야 서버 렌더링 시점에 이미 세션을 알 수 있다.
 *     그래야 CTA A/B 변형을 서버에서 확정해 내려보낼 수 있고, 화면이 그려진 뒤
 *     버튼이 바뀌는 깜빡임(FOUC)이 생기지 않는다.
 *
 *  2) 어드민 보호 (/admin/*)
 *     비로그인 접근을 로그인 화면으로 돌린다. 실제 데이터 접근 권한은
 *     DB의 RLS(is_admin())가 최종 판정하므로, 여기는 1차 관문일 뿐이다.
 */

const SID_COOKIE   = 'wnj_sid';
const ATTR_COOKIE  = 'wnj_attr';        // 최종 비직접 유입 (광고 성과 귀속 기준)
const FIRST_COOKIE = 'wnj_attr_first';  // 최초 유입 (참고용)

const SESSION_MAX_AGE = 30 * 60;          // 30분 — 이 시간 안의 활동을 한 세션으로 본다
const ATTR_MAX_AGE    = 90 * 24 * 60 * 60; // 90일

function newSessionId(): string {
  // crypto.randomUUID는 Edge 런타임에서 사용 가능하다
  return crypto.randomUUID().replace(/-/g, '');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    return handleAdmin(request);
  }

  /*
   * API 요청에는 방문자 쿠키를 건드리지 않는다.
   * 예컨대 폼 제출(/api/quote)의 referer는 우리 사이트라 '직접 유입'으로 잡히는데,
   * 여기서 최초 유입 쿠키를 새로 심으면 랜딩 경로가 /api/quote로 기록돼
   * 광고 성과 리포트가 오염된다. 쿠키는 사람이 보는 페이지에서만 갱신한다.
   */
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return handleVisitor(request);
}

/** 공개 페이지 — 세션·유입 쿠키만 갱신하고 통과시킨다. */
function handleVisitor(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // ── 세션 쿠키 (30분 롤링) ──
  const sid = request.cookies.get(SID_COOKIE)?.value;
  const sessionId = sid && /^[a-f0-9]{32}$/.test(sid) ? sid : newSessionId();
  response.cookies.set(SID_COOKIE, sessionId, {
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // 클라이언트 트래커가 읽어야 한다
    secure: request.nextUrl.protocol === 'https:',
  });

  // ── 유입 경로 ──
  // referrer가 우리 도메인이면 사이트 내부 이동이므로 유입으로 치지 않는다.
  const rawReferrer = request.headers.get('referer');
  const selfHost = request.nextUrl.hostname;
  const referrer =
    rawReferrer && !rawReferrer.includes(selfHost) ? rawReferrer : null;

  const attribution = buildAttribution(request.nextUrl, referrer);
  const cookieOptions = {
    maxAge: ATTR_MAX_AGE,
    path: '/',
    sameSite: 'lax' as const,
    httpOnly: false,
    secure: request.nextUrl.protocol === 'https:',
  };

  // 직접 유입은 기존 귀속을 덮어쓰지 않는다.
  // 광고를 보고 들어왔다가 나중에 주소를 직접 쳐서 문의하는 흐름이 흔한데,
  // 여기서 덮어쓰면 그 리드가 '직접 유입'으로 잡혀 광고 성과가 사라진다.
  // (GA와 같은 last non-direct click 기준)
  if (attribution.channel !== 'direct') {
    response.cookies.set(ATTR_COOKIE, serializeAttribution(attribution), cookieOptions);
  }
  if (!request.cookies.get(FIRST_COOKIE)) {
    response.cookies.set(FIRST_COOKIE, serializeAttribution(attribution), cookieOptions);
  }

  return response;
}

/** 어드민 — 로그인 세션을 갱신하고 비로그인은 돌려보낸다. */
async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 로그인 화면과 인증 콜백은 열려 있어야 한다
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname.startsWith('/admin/auth');

  let response = NextResponse.next({ request });

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 미설정 상태에서 어드민에 들어오면 무한 리다이렉트 대신
  // 로그인 화면이 안내를 띄우도록 통과시킨다.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // 이 호출이 만료된 액세스 토큰을 갱신하고 위 setAll로 쿠키를 다시 심는다.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublicAdminRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === '/admin/login') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/admin';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 정적 자산과 이미지 최적화 요청은 건너뛴다.
     * 확장자가 붙은 경로(.png/.txt/.xml 등)도 제외해 IndexNow 키 파일이나
     * sitemap 요청에 불필요한 쿠키가 붙지 않게 한다.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
};
