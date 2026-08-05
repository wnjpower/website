import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 이메일 링크(비밀번호 재설정·초대·이메일 확인)를 세션으로 바꾸는 곳.
 *
 * middleware가 예전부터 `/admin/auth`를 비로그인 통과 경로로 열어 두고 있었는데
 * 정작 이 라우트가 없었다. 그래서 재설정 메일의 링크가 도착할 데가 없었다.
 *
 * 링크 형식이 세 가지라 전부 받는다. 메일 템플릿을 바꾸든 안 바꾸든,
 * 어드민에서 요청했든 Supabase 대시보드에서 보냈든 동작하게 하기 위해서다.
 *
 *  1) ?token_hash=...&type=recovery
 *     템플릿이 {{ .TokenHash }}를 쓸 때. **기기를 가리지 않는다** —
 *     PC에서 요청하고 폰에서 링크를 열어도 된다. 권장 형식.
 *  2) ?code=...
 *     PKCE. 링크를 «요청한 그 브라우저»에서 열어야 한다(검증자가 그 브라우저에만 있다).
 *  3) #access_token=...  (URL 프래그먼트)
 *     서버로 전송되지 않으므로 여기서 처리할 수 없다.
 *     reset-password 화면이 클라이언트에서 직접 받는다.
 */

/** 열어줄 수 있는 이동 경로 — 오픈 리다이렉트를 막는다 */
const SAFE_NEXT = /^\/admin(?:\/[A-Za-z0-9\-_/]*)?$/;

/** Vercel 프록시 뒤에서는 nextUrl.origin이 내부 주소일 수 있다 */
function siteOrigin(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  return host ? `${proto}://${host}` : req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const origin = siteOrigin(req);
  const params = req.nextUrl.searchParams;

  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  const nextParam = params.get('next');

  const fallback = type === 'recovery' ? '/admin/auth/reset-password' : '/admin';
  const next = nextParam && SAFE_NEXT.test(nextParam) ? nextParam : fallback;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/admin/login?error=${reason}`, origin));

  // Supabase가 링크를 거절한 경우(만료·이미 사용) 그대로 되돌려준다
  if (params.get('error') || params.get('error_code')) {
    return fail('link_expired');
  }

  const supabase = await createServerSupabase();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (error) {
      console.error('[auth] verifyOtp 실패', error.message);
      return fail('link_expired');
    }
    return NextResponse.redirect(new URL(next, origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // 대개 "다른 기기·브라우저에서 링크를 열었다"는 뜻이다. 이 경우만 따로 안내한다.
      console.error('[auth] exchangeCodeForSession 실패', error.message);
      return fail('link_device');
    }
    return NextResponse.redirect(new URL(next, origin));
  }

  return fail('link_invalid');
}
