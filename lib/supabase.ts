import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** 브라우저/서버 공용 anon 클라이언트. RLS로 보호됨. */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

/** 서버 전용 — service_role. Route Handler에서만 사용. 클라이언트 번들에 절대 import 금지. */
export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
};
