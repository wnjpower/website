'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Check, AlertCircle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { submitUrlsToSearchEngines } from '@/app/admin/actions';

export interface PingRow {
  id: number;
  created_at: string;
  target: string;
  urls: string[];
  ok: boolean;
  status: number | null;
  response: string | null;
}

const TARGET_LABELS: Record<string, string> = {
  indexnow: 'IndexNow (Bing·Yandex 등)',
  naver:    '네이버 서치어드바이저',
  google:   '구글',
};

export default function SeoConsole({
  pings,
  knownPaths,
  keyFileUrl,
}: {
  pings: PingRow[];
  knownPaths: string[];
  keyFileUrl: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['/']);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(path: string) {
    setSelected((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  }

  function submit() {
    startTransition(async () => {
      const result = await submitUrlsToSearchEngines(selected);
      setMessage(result.ok ? { ok: true, text: result.message ?? '제출했습니다.' } : { ok: false, text: result.error });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {message && (
        <p
          className={`flex gap-2 items-start rounded-lg px-4 py-3 text-sm ${
            message.ok
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.ok ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {message.text}
        </p>
      )}

      {/* ── 자동 제출 안내 ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-ink mb-2">자동 제출은 이미 켜져 있습니다</h2>
        <ul className="space-y-2 text-sm text-slate-600 leading-relaxed break-keep">
          <li className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-ink">글을 발행하거나 홈 문구를 발행할 때마다</strong>{' '}
              네이버 서치어드바이저와 Bing에 자동으로 알립니다 (IndexNow).
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              사이트맵(<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">/sitemap.xml</code>)에도
              새 글이 자동으로 들어가고, 수정 시각이 정확히 반영됩니다.
            </span>
          </li>
          <li className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-ink">구글은 IndexNow를 지원하지 않습니다.</strong>{' '}
              구글용 공식 즉시 색인 API는 채용공고·방송에만 열려 있어 일반 페이지에는 쓸 수 없습니다.
              대신 사이트맵의 수정 시각을 정확히 유지하는 것이 표준적인 방법이고, 그렇게 되어 있습니다.
              처음 한 번은 서치콘솔에서 사이트맵을 직접 등록해 주세요.
            </span>
          </li>
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <ExternalLinkButton href="https://searchadvisor.naver.com/" label="네이버 서치어드바이저" />
          <ExternalLinkButton href="https://search.google.com/search-console" label="구글 서치콘솔" />
          <ExternalLinkButton href="/sitemap.xml" label="사이트맵 확인" />
          <ExternalLinkButton href="/feed.xml" label="RSS 피드" />
          <ExternalLinkButton href={keyFileUrl} label="IndexNow 키 파일" />
        </div>
      </div>

      {/* ── 수동 제출 ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-ink mb-1">직접 제출하기</h2>
        <p className="text-sm text-slate-500 mb-4 break-keep">
          내용을 크게 고쳤는데 검색 결과가 그대로일 때 눌러보세요. 같은 주소를 하루에 여러 번 제출하면
          오히려 무시될 수 있으니 필요할 때만 사용하세요.
        </p>

        <div className="space-y-1.5 mb-4 max-h-64 overflow-y-auto">
          {knownPaths.map((path) => (
            <label
              key={path}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(path)}
                onChange={() => toggle(path)}
                className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-sm font-mono text-slate-600 truncate">{path}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={isPending || selected.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold px-5 py-2.5 text-[0.9375rem] transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            선택한 {selected.length}개 주소 제출
          </button>
          <button
            onClick={() => setSelected(selected.length === knownPaths.length ? [] : knownPaths)}
            className="text-sm font-semibold text-slate-500 hover:text-brand"
          >
            {selected.length === knownPaths.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>
      </div>

      {/* ── 제출 이력 ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <h2 className="px-5 py-3.5 font-bold text-ink border-b border-slate-200 bg-slate-50">제출 이력</h2>
        {pings.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">아직 제출 기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pings.map((ping) => (
              <li key={ping.id} className="flex items-start gap-3 px-5 py-3.5">
                {ping.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {TARGET_LABELS[ping.target] ?? ping.target}
                    <span className="ml-2 font-normal text-slate-400">
                      {ping.urls.length}개 주소
                      {ping.status !== null && ` · 응답 ${ping.status}`}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 truncate font-mono">{ping.urls.join(', ')}</p>
                  {!ping.ok && ping.response && (
                    <p className="text-xs text-red-600 mt-0.5 break-all">{ping.response}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                  {new Date(ping.created_at).toLocaleString('ko-KR', {
                    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
    >
      {label}
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
