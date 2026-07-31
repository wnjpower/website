'use client';

import { createBrowserClient } from '@supabase/ssr';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

/**
 * 브라우저용 Supabase 클라이언트 — 어드민 로그인/로그아웃과
 * 이미지 업로드(Storage)에만 쓴다. 공개 사이트는 이 클라이언트를 부르지 않는다.
 *
 * 세션은 쿠키에 저장된다(@supabase/ssr 기본). 그래야 서버 컴포넌트와
 * middleware가 같은 세션을 본다.
 */
export function createBrowserSupabase() {
  return createBrowserClient(url, anonKey);
}
