'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn, AlertCircle, MailCheck, ArrowLeft } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

/** 콜백 라우트가 실패를 넘겨줄 때 쓰는 문구 */
const LINK_ERRORS: Record<string, string> = {
  link_expired: '재설정 링크가 만료됐거나 이미 사용됐습니다. 아래에서 다시 받아 주세요.',
  link_device:
    '링크를 요청한 기기와 다른 기기에서 열었습니다. 재설정을 요청한 브라우저에서 링크를 열거나, 이 기기에서 다시 요청해 주세요.',
  link_invalid: '링크 정보가 올바르지 않습니다. 아래에서 재설정 메일을 다시 받아 주세요.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** 비밀번호 재설정 모드 — 콜백이 실패를 돌려보냈거나 ?reset=1 로 들어온 경우 자동으로 켠다 */
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  const linkError = params.get('error');

  useEffect(() => {
    if (linkError || params.get('reset') === '1') {
      setResetMode(true);
      if (linkError && LINK_ERRORS[linkError]) setError(LINK_ERRORS[linkError]);
    }
  }, [linkError, params]);

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('가입한 이메일 주소를 입력해 주세요.');
      return;
    }

    setResetting(true);
    try {
      const supabase = createBrowserSupabase();
      /*
       * redirectTo는 Supabase 대시보드의 Redirect URLs 허용목록에 있어야 한다.
       * 없으면 Supabase가 Site URL로 되돌려버려서 링크가 엉뚱한 데로 간다.
       */
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/auth/reset-password`,
      });
      // 성공/실패를 구분해 보여주지 않는다. 구분하면 가입된 이메일을 캐낼 수 있다.
      setResetSent(true);
    } catch {
      setResetSent(true);
    } finally {
      setResetting(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        // 원인을 자세히 알려주면 계정 존재 여부를 캐낼 수 있다. 한 문장으로 통일한다.
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      // 서버 컴포넌트가 새 세션 쿠키를 보도록 강제로 다시 읽어온다
      router.replace(next);
      router.refresh();
    } catch {
      setError('로그인 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.');
      setLoading(false);
    }
  }

  // ── 비밀번호 재설정 ──
  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-brand tracking-tight">우앤주전력</p>
            <p className="text-sm text-slate-500 mt-1">비밀번호 재설정</p>
          </div>

          {resetSent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <p className="flex gap-2 items-start rounded-lg bg-green-50 border border-green-200 px-3.5 py-3 text-sm text-green-800 break-keep">
                <MailCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                가입된 계정이라면 재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인해 주세요.
              </p>
              <p className="text-sm text-slate-500 break-keep">
                링크는 한 번만, 짧은 시간 안에만 쓸 수 있습니다. 되도록 <b>이 기기에서</b> 링크를 열어 주세요.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); setError(null); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand"
              >
                <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <form
              onSubmit={onReset}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
            >
              <p className="text-sm text-slate-500 break-keep">
                가입한 이메일로 재설정 링크를 보내드립니다.
              </p>

              <div>
                <label htmlFor="reset-email" className="block text-sm font-semibold text-ink mb-1.5">
                  이메일
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="wnj-2023@naver.com"
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
                disabled={resetting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3.5 text-base transition-colors disabled:opacity-60"
              >
                {resetting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MailCheck className="w-5 h-5" />}
                재설정 메일 받기
              </button>

              <button
                type="button"
                onClick={() => { setResetMode(false); setError(null); }}
                className="w-full inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-brand"
              >
                <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand tracking-tight">우앤주전력</p>
          <p className="text-sm text-slate-500 mt-1">홈페이지 관리자</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          {!configured && (
            <p className="flex gap-2 items-start rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Supabase 환경변수가 설정되지 않았습니다. 배포 환경에서 확인해 주세요.
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="wnj-2023@naver.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          {error && (
            <p className="flex gap-2 items-start rounded-lg bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3.5 text-base transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            로그인
          </button>

          <button
            type="button"
            onClick={() => { setResetMode(true); setError(null); }}
            className="w-full py-1 text-sm font-semibold text-slate-500 hover:text-brand"
          >
            비밀번호를 잊으셨나요?
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          계정은 관리자만 발급할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
