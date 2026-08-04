'use client';

import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { Panel } from './ui';
import { analyzeSeo, GRADE_LABELS, type SeoInput, type CheckStatus } from '@/lib/seo/analyze';
import { SITE_URL } from '@/lib/site';

/**
 * 실시간 SEO 분석 패널 (RankMath·Yoast 방식).
 *
 * 글을 쓰는 동안 점수와 체크리스트가 즉시 갱신된다. 각 항목은 "무엇이 문제인가"가
 * 아니라 "무엇을 하면 되는가"로 적었다 — 사장님이 읽고 바로 고칠 수 있어야 한다.
 */
export default function SeoPanel({
  input,
  postPath,
}: {
  input: SeoInput;
  postPath: string;
}) {
  const report = useMemo(() => analyzeSeo(input), [input]);

  const color =
    report.grade === 'good' ? 'var(--a-ok)'
    : report.grade === 'ok' ? 'var(--a-warn)'
    : 'var(--a-err)';

  const sorted = [...report.checks].sort((a, b) => {
    const rank: Record<CheckStatus, number> = { bad: 0, warn: 1, good: 2 };
    return rank[a.status] - rank[b.status] || b.weight - a.weight;
  });

  const displayTitle = input.metaTitle || input.title || '제목을 입력하세요';
  const displayDesc =
    input.metaDescription ||
    '검색 결과에 보일 설명을 적어주세요. 비워두면 검색엔진이 본문에서 임의로 잘라 사용합니다.';

  return (
    <div className="space-y-3.5">
      {/* ── 점수 — 계기판 눈금 하나 ── */}
      <div className="a-panel a-panel-body">
        <div className="flex items-baseline justify-between mb-1">
          <span className="bp-label" style={{ marginBottom: 0 }}>SEO 점수</span>
          <span className="display" style={{ fontSize: 13, color }}>{GRADE_LABELS[report.grade]}</span>
        </div>
        <div className="flex items-end gap-1.5 mb-3">
          <span className="display mono-num" style={{ fontSize: 44, lineHeight: 1, color }}>
            {report.score}
          </span>
          <span className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>/ 100</span>
        </div>
        <div style={{ height: 4, background: 'rgba(29,31,32,0.1)' }}>
          <div style={{ height: '100%', width: `${report.score}%`, background: color }} />
        </div>
      </div>

      {/* ── 검색 결과 미리보기 ── */}
      <Panel title="검색 결과 미리보기">
        <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-bg)', padding: 13 }}>
          <p className="text-muted mono-num truncate" style={{ fontSize: 11.5, marginBottom: 3 }}>
            {SITE_URL.replace(/^https?:\/\//, '')}
            {postPath}
          </p>
          <p className="line-clamp-2 break-keep" style={{ fontSize: 17, lineHeight: 1.35, color: '#1a0dab', marginBottom: 3 }}>
            {displayTitle}
          </p>
          <p className="line-clamp-2 break-keep" style={{ fontSize: 13, lineHeight: 1.6 }}>
            {displayDesc}
          </p>
        </div>
        <p className="a-help mt-2">
          <Search className="w-3 h-3 inline-block mr-1" strokeWidth={1.5} />
          실제 검색 결과와 다르게 보일 수 있습니다. 검색엔진이 더 적합하다고 판단하면 본문에서 직접 문장을 가져다 씁니다.
        </p>
      </Panel>

      {/* ── 체크리스트 ── */}
      <Panel title="점검 항목" flush>
        <ul className="a-rows">
          {sorted.map((check) => (
            <li key={check.id} className="flex gap-2.5 px-4 py-2.5">
              <StatusIcon status={check.status} />
              <div className="min-w-0">
                <p
                  className="break-keep"
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    opacity: check.status === 'good' ? 0.6 : 1,
                    fontWeight: check.status === 'good' ? 400 : 500,
                  }}
                >
                  {check.label}
                </p>
                {check.hint && <p className="a-help mt-0.5">{check.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  const props = { className: 'w-4 h-4 flex-shrink-0 mt-0.5', strokeWidth: 1.5 } as const;
  if (status === 'good') {
    return <CheckCircle2 {...props} style={{ color: 'var(--a-ok)' }} aria-label="좋음" />;
  }
  if (status === 'warn') {
    return <AlertTriangle {...props} style={{ color: 'var(--a-warn)' }} aria-label="개선 권장" />;
  }
  return <XCircle {...props} style={{ color: 'var(--a-err)' }} aria-label="수정 필요" />;
}
