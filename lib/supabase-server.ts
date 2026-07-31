import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

/**
 * 로그인 세션이 붙은 서버용 Supabase 클라이언트.
 *
 * 어드민의 모든 DB 접근은 이 클라이언트를 탄다. service_role 키가 아니라
 * 로그인한 사용자의 JWT로 접근하므로, DB의 RLS(is_admin())가 그대로 최종
 * 방어선이 된다. 즉 앱 코드에 구멍이 나도 관리자가 아닌 사람은 아무것도 못 읽는다.
 *
 * 서버 컴포넌트에서는 쿠키를 쓸 수 없다(응답 헤더가 이미 나간 뒤일 수 있음).
 * 그래서 setAll은 실패를 삼킨다 — 세션 갱신은 middleware가 담당한다.
 */
export function createServerSupabase(): SupabaseClient {
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 서버 컴포넌트에서 호출된 경우. middleware가 갱신하므로 무시해도 안전하다.
        }
      },
    },
  });
}

/** 로그인한 관리자. 관리자가 아니거나 비로그인이면 null. */
export async function getAdminUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
} | null> {
  const supabase = createServerSupabase();

  // getUser()는 Auth 서버에 토큰을 검증받는다. getSession()은 쿠키를 그대로
  // 믿기 때문에 인가 판단에 쓰면 안 된다.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id, email, name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) return null;
  return { id: user.id, email: admin.email ?? user.email ?? '', name: admin.name ?? null };
}
