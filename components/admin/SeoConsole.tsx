'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, AlertCircle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Panel, Empty, ResultNote } from './ui';
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
    <div className="space-y-3.5">
      {message && <ResultNote ok={message.ok} text={message.text} />}

      {/* ── 자동 제출 안내 ── */}
      <Panel title="자동 제출은 이미 켜져 있습니다">
        <ul className="space-y-2.5" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
          <li className="flex gap-2 break-keep">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: 'var(--a-ok)' }} />
            <span>
              <strong>글을 발행하거나 홈 문구를 발행할 때마다</strong> 네이버 서치어드바이저와 Bing에
              자동으로 알립니다 (IndexNow).
            </span>
          </li>
          <li className="flex gap-2 break-keep">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: 'var(--a-ok)' }} />
            <span>
              사이트맵(<Mono>/sitemap.xml</Mono>)에도 새 글이 자동으로 들어가고, 수정 시각이 정확히 반영됩니다.
            </span>
          </li>
          <li className="flex gap-2 break-keep">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: 'var(--a-warn)' }} />
            <span>
              <strong>구글은 IndexNow를 지원하지 않습니다.</strong> 구글용 공식 즉시 색인 API는
              채용공고·방송에만 열려 있어 일반 페이지에는 쓸 수 없습니다. 대신 사이트맵의 수정 시각을
              정확히 유지하는 것이 표준적인 방법이고, 그렇게 되어 있습니다. 처음 한 번은 서치콘솔에서
              사이트맵을 직접 등록해 주세요.
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
      </Panel>

      {/* ── 수동 제출 ── */}
      <Panel
        title="직접 제출하기"
        note="내용을 크게 고쳤는데 검색 결과가 그대로일 때 눌러보세요. 같은 주소를 하루에 여러 번 제출하면 오히려 무시될 수 있으니 필요할 때만 사용하세요."
      >
        <div className="max-h-64 overflow-y-auto mb-4" style={{ border: '1px solid var(--color-divider)' }}>
          {knownPaths.map((path) => (
            <label
              key={path}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer a-row-hover"
            >
              <input
                type="checkbox"
                checked={selected.includes(path)}
                onChange={() => toggle(path)}
                className="bp-check"
              />
              <span className="mono-num truncate" style={{ fontSize: 13 }}>{path}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={isPending || selected.length === 0}
            className="a-btn a-btn--solid"
          >
            {isPending
              ? <Loader2 className="w-4 h-4 bp-spin" strokeWidth={1.5} />
              : <Send className="w-4 h-4" strokeWidth={1.5} />}
            선택한 {selected.length}개 주소 제출
          </button>
          <button
            onClick={() => setSelected(selected.length === knownPaths.length ? [] : knownPaths)}
            className="a-link display"
            style={{ fontSize: 14 }}
          >
            {selected.length === knownPaths.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>
      </Panel>

      {/* ── 제출 이력 ── */}
      <Panel title="제출 이력" flush>
        {pings.length === 0 ? (
          <Empty>아직 제출 기록이 없습니다.</Empty>
        ) : (
          <ul className="a-rows">
            {pings.map((ping) => (
              <li key={ping.id} className="flex items-start gap-3 px-4 py-3">
                {ping.ok ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: 'var(--a-ok)' }} />
                ) : (
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: 'var(--a-err)' }} />
                )}
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 13.5, fontWeight: 500 }}>
                    {TARGET_LABELS[ping.target] ?? ping.target}
                    <span className="text-muted" style={{ fontWeight: 400 }}>
                      {' '}{ping.urls.length}개 주소
                      {ping.status !== null && ` · 응답 ${ping.status}`}
                    </span>
                  </p>
                  <p className="text-muted mono-num truncate" style={{ fontSize: 11.5 }}>{ping.urls.join(', ')}</p>
                  {!ping.ok && ping.response && (
                    <p className="break-all mt-0.5" style={{ fontSize: 11.5, color: 'var(--a-err)' }}>
                      {ping.response}
                    </p>
                  )}
                </div>
                <span className="mono-num text-muted whitespace-nowrap" style={{ fontSize: 11.5 }}>
                  {new Date(ping.created_at).toLocaleString('ko-KR', {
                    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="mono-num"
      style={{ background: 'var(--color-neutral-100)', padding: '1px 5px', fontSize: 12.5 }}
    >
      {children}
    </code>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="a-btn a-btn--sm">
      {label}
      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
    </a>
  );
}
