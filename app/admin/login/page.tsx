'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn, MailCheck, ArrowLeft } from 'lucide-react';
import { Notice, Field } from '@/components/admin/ui';
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

/** 로그인·재설정 화면 공통 껍데기 — 페이지 바탕 위에 놓인 흰 카드 한 장.
    바탕에 .sheet(흰 면)를 깔면 카드와 같은 색이 되어 카드가 사라진다. */
function AuthShell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <p className="display" style={{ fontSize: 26, letterSpacing: '-.01em' }}>우앤주전력</p>
          <p className="display text-muted" style={{ fontSize: 12, letterSpacing: '.18em' }}>
            ADMIN CONSOLE
          </p>
          <p className="text-muted mt-1.5" style={{ fontSize: 13 }}>{subtitle}</p>
        </div>
        <div className="a-panel" style={{ padding: 22 }}>
          {children}
        </div>
      </div>
    </div>
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
      <AuthShell subtitle="비밀번호 재설정">
        {resetSent ? (
          <div className="space-y-4">
            <Notice tone="ok">
              <span>가입된 계정이라면 재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인해 주세요.</span>
            </Notice>
            <p className="text-muted break-keep" style={{ fontSize: 13, lineHeight: 1.65 }}>
              링크는 한 번만, 짧은 시간 안에만 쓸 수 있습니다. 되도록 <b>이 기기에서</b> 링크를 열어 주세요.
            </p>
            <button
              onClick={() => { setResetMode(false); setResetSent(false); setError(null); }}
              className="a-btn a-btn--block"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> 로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <form onSubmit={onReset} className="space-y-4">
            <p className="text-muted break-keep" style={{ fontSize: 13 }}>
              가입한 이메일로 재설정 링크를 보내드립니다.
            </p>

            <Field label="이메일" htmlFor="reset-email">
              <input
                id="reset-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bp-input"
                placeholder="wnj-2023@naver.com"
              />
            </Field>

            {error && <Notice tone="err"><span>{error}</span></Notice>}

            <button type="submit" disabled={resetting} className="a-btn a-btn--solid a-btn--block">
              {resetting
                ? <Loader2 className="w-5 h-5 bp-spin" strokeWidth={1.5} />
                : <MailCheck className="w-5 h-5" strokeWidth={1.5} />}
              재설정 메일 받기
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(false); setError(null); }}
              className="a-btn a-btn--ghost a-btn--block a-btn--sm"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> 로그인으로 돌아가기
            </button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="홈페이지 관리자">
      <form onSubmit={onSubmit} className="space-y-4">
        {!configured && (
          <Notice tone="warn">
            <span>Supabase 환경변수가 설정되지 않았습니다. 배포 환경에서 확인해 주세요.</span>
          </Notice>
        )}

        <Field label="이메일" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bp-input"
            placeholder="wnj-2023@naver.com"
          />
        </Field>

        <Field label="비밀번호" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bp-input"
          />
        </Field>

        {error && <Notice tone="err"><span>{error}</span></Notice>}

        <button type="submit" disabled={loading} className="a-btn a-btn--solid a-btn--block">
          {loading
            ? <Loader2 className="w-5 h-5 bp-spin" strokeWidth={1.5} />
            : <LogIn className="w-5 h-5" strokeWidth={1.5} />}
          로그인
        </button>

        <button
          type="button"
          onClick={() => { setResetMode(true); setError(null); }}
          className="a-btn a-btn--ghost a-btn--block a-btn--sm"
        >
          비밀번호를 잊으셨나요?
        </button>
      </form>

      <p className="a-help text-center mt-5">계정은 관리자만 발급할 수 있습니다.</p>
    </AuthShell>
  );
}
