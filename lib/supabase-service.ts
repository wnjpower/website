import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * service_role Supabase 클라이언트 — **서버 전용**.
 *
 * 이 앱은 원래 service_role 키를 쓰지 않는다. 어드민조차 로그인 사용자의 JWT로
 * RLS를 통과하게 두는 편이 안전하기 때문이다. 딱 하나 예외가 실시간 알림이다.
 *
 * 알림을 보낼 시점의 요청 주체는 "버튼을 누른 방문자"다. 방문자는 로그인하지
 * 않았으니 어드민 JWT가 없고, 그렇다고 익명에게 push_subscriptions SELECT를
 * 열어주면 사장님 기기의 푸시 주소가 공개된다. 그래서 이 경로만 RLS를 우회한다.
 *
 * 사용 범위를 좁게 유지할 것:
 *   - lib/push/*  (알림 발송)
 * 그 외 조회는 지금처럼 lib/supabase-server.ts(로그인 JWT)를 쓴다.
 *
 * 키가 없으면 null을 돌려준다. 알림 기능만 조용히 꺼지고 사이트는 정상 동작한다.
 */

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasServiceRole = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

export function createServiceSupabase(): SupabaseClient | null {
  // 번들러 설정 실수로 클라이언트에 딸려 들어가는 사고를 런타임에서 막는다.
  if (typeof window !== 'undefined') {
    throw new Error('service_role 클라이언트는 서버에서만 쓸 수 있습니다.');
  }
  if (!url || !serviceKey) return null;

  cached ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
