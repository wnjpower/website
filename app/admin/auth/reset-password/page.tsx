'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, KeyRound } from 'lucide-react';
import { Notice, Field, CornerMarks } from '@/components/admin/ui';
import { createBrowserSupabase } from '@/lib/supabase-browser';

/**
 * 새 비밀번호 설정 화면.
 *
 * 여기 도달하는 경로가 둘이다.
 *  1) /admin/auth/callback 이 token_hash·code를 세션으로 바꾼 뒤 보내준 경우
 *  2) 메일 링크가 이 주소로 직접 오면서 토큰을 **URL 프래그먼트**(#access_token=…)로
 *     들고 온 경우. 프래그먼트는 서버로 전송되지 않아 라우트에서 처리할 수 없다.
 *     그래서 클라이언트인 이 화면이 직접 받아 세션으로 바꾼다.
 *
 * 세션이 없으면 아무 말 없이 실패하지 않고 «링크가 만료됐다»고 분명히 알린다.
 * 재설정은 안 그래도 사용자가 불안한 흐름이라, 조용한 실패가 가장 나쁘다.
 */

const MIN_LENGTH = 8;

type Phase = 'checking' | 'ready' | 'no-session' | 'done';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();

    void (async () => {
      // 1) 이미 세션이 있으면(콜백 라우트를 거쳐 왔으면) 그대로 진행
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setPhase('ready'); return; }

      // 2) 프래그먼트로 토큰이 왔는지 본다
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      const fragment = new URLSearchParams(hash);
      const accessToken = fragment.get('access_token');
      const refreshToken = fragment.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        // 주소창에 토큰이 남지 않게 지운다 (공유·기록으로 새는 것을 막는다)
        window.history.replaceState(null, '', window.location.pathname);
        setPhase(setErr ? 'no-session' : 'ready');
        return;
      }

      setPhase('no-session');
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.`);
      return;
    }
    if (password !== confirm) {
      setError('두 비밀번호가 서로 다릅니다.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(
          updateError.message.includes('should be different')
            ? '이전과 다른 비밀번호를 입력해 주세요.'
            : '비밀번호를 바꾸지 못했습니다. 링크가 만료됐을 수 있습니다.',
        );
        setSaving(false);
        return;
      }
      setPhase('done');
      setTimeout(() => { router.replace('/admin'); router.refresh(); }, 1500);
    } catch {
      setError('비밀번호를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 grid-field">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <p className="display" style={{ fontSize: 26, letterSpacing: '-.01em' }}>우앤주전력</p>
          <p className="display text-muted" style={{ fontSize: 12, letterSpacing: '.18em' }}>
            ADMIN CONSOLE
          </p>
          <p className="text-muted mt-1.5" style={{ fontSize: 13 }}>새 비밀번호 설정</p>
        </div>

        <div className="a-panel" style={{ padding: 22 }}>
          <CornerMarks />

          {phase === 'checking' && (
            <p className="text-muted flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-4 h-4 bp-spin" strokeWidth={1.5} /> 확인 중…
            </p>
          )}

          {phase === 'no-session' && (
            <div className="space-y-4">
              <Notice tone="warn">
                <span>
                  링크가 만료됐거나 이미 사용된 것 같습니다. 재설정 링크는 한 번만, 그리고 짧은 시간
                  안에만 쓸 수 있습니다.
                </span>
              </Notice>
              <Link href="/admin/login?reset=1" className="a-btn a-btn--solid a-btn--block">
                재설정 메일 다시 받기
              </Link>
            </div>
          )}

          {phase === 'done' && (
            <Notice tone="ok">
              <span>비밀번호를 바꿨습니다. 관리자 화면으로 이동합니다…</span>
            </Notice>
          )}

          {phase === 'ready' && (
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="새 비밀번호" htmlFor="password" help={`${MIN_LENGTH}자 이상`}>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bp-input"
                />
              </Field>

              <Field label="새 비밀번호 확인" htmlFor="confirm">
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bp-input"
                />
              </Field>

              {error && <Notice tone="err"><span>{error}</span></Notice>}

              <button type="submit" disabled={saving} className="a-btn a-btn--solid a-btn--block">
                {saving
                  ? <Loader2 className="w-5 h-5 bp-spin" strokeWidth={1.5} />
                  : <KeyRound className="w-5 h-5" strokeWidth={1.5} />}
                비밀번호 바꾸기
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
