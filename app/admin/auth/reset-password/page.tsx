'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, KeyRound, AlertCircle, Check } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand tracking-tight">우앤주전력</p>
          <p className="text-sm text-slate-500 mt-1">새 비밀번호 설정</p>
        </div>

        {phase === 'checking' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> 확인 중…
          </div>
        )}

        {phase === 'no-session' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <p className="flex gap-2 items-start rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3 text-sm text-amber-900 break-keep">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              링크가 만료됐거나 이미 사용된 것 같습니다. 재설정 링크는 한 번만, 그리고 짧은 시간 안에만 쓸 수 있습니다.
            </p>
            <Link
              href="/admin/login?reset=1"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3.5 text-base transition-colors"
            >
              재설정 메일 다시 받기
            </Link>
          </div>
        )}

        {phase === 'done' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="flex gap-2 items-start rounded-lg bg-green-50 border border-green-200 px-3.5 py-3 text-sm text-green-800">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              비밀번호를 바꿨습니다. 관리자 화면으로 이동합니다…
            </p>
          </div>
        )}

        {phase === 'ready' && (
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
                새 비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
              <p className="text-xs text-slate-500 mt-1.5">{MIN_LENGTH}자 이상</p>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-ink mb-1.5">
                새 비밀번호 확인
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            {error && (
              <p className="flex gap-2 items-start rounded-lg bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700 break-keep">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3.5 text-base transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
              비밀번호 바꾸기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
