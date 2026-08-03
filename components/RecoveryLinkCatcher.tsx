'use client';

import { useEffect } from 'react';

/**
 * 홈으로 떨어진 비밀번호 재설정 링크를 재설정 화면으로 넘겨준다.
 *
 * Supabase 대시보드(Authentication → Users)에서 보내는 복구 메일은 되돌아올 주소를
 * **Site URL 그대로** 쓴다. 우리 콜백 라우트를 지정할 방법이 없어서, 링크를 누르면
 * 홈페이지에 토큰만 매달린 채 떨어지고 아무 일도 일어나지 않는다.
 *
 *   https://www.wnjpower.com/#access_token=...&type=recovery
 *
 * 토큰이 URL 프래그먼트(#)에 있어 서버로는 전송되지 않으므로, 이 판단은 반드시
 * 브라우저에서 해야 한다. 메일 템플릿을 바꾸면 근본적으로 해결되지만, 템플릿을
 * 건드리지 않아도 복구가 되도록 이 안전장치를 둔다.
 *
 * 평소 방문자에게는 아무 일도 하지 않는다(프래그먼트에 recovery 토큰이 있을 때만 동작).
 */
export default function RecoveryLinkCatcher() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    // 어드민 화면은 스스로 처리한다
    if (window.location.pathname.startsWith('/admin')) return;

    const params = new URLSearchParams(hash.slice(1));
    const type = params.get('type');

    // Supabase가 링크를 거절한 경우(만료·이미 사용)도 프래그먼트로 돌아온다
    if (params.get('error_code') || params.get('error')) {
      if (type === 'recovery' || params.get('error_code') === 'otp_expired') {
        window.location.replace('/admin/login?error=link_expired');
      }
      return;
    }

    if (type !== 'recovery' || !params.get('access_token')) return;

    // 프래그먼트를 그대로 넘긴다 — 재설정 화면이 이 토큰으로 세션을 만든다
    window.location.replace(`/admin/auth/reset-password${hash}`);
  }, []);

  return null;
}
