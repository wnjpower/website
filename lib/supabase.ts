import { createClient } from '@supabase/supabase-js';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase 프로젝트가 아직 설정되지 않은 동안 다른 코드가 이 값으로 분기 처리함. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * anon(publishable) 클라이언트. RLS 정책 + GRANT로 INSERT만 허용된다.
 *
 * 이 앱은 service_role 키를 쓰지 않는다. DB 접근이 견적문의 INSERT 한 건뿐이고
 * 조회는 Supabase 대시보드에서 하기 때문이다. 서버에 비밀 키를 하나라도 덜 두는 편이
 * 안전해서, 쓰이지 않던 supabaseAdmin()(service_role 클라이언트)은 제거했다.
 * 관리자 조회 기능을 만들 때 서버 전용 모듈로 다시 추가할 것.
 */
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder',
  { auth: { persistSession: false } },
);
