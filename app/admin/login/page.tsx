'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

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

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

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
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          계정은 관리자만 발급할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
