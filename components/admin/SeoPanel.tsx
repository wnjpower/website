'use client';

import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
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

  const gradeColor =
    report.grade === 'good' ? 'text-green-700 bg-green-50 border-green-200'
    : report.grade === 'ok' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';

  const barColor =
    report.grade === 'good' ? 'bg-green-600'
    : report.grade === 'ok' ? 'bg-amber-500'
    : 'bg-red-500';

  const sorted = [...report.checks].sort((a, b) => {
    const rank: Record<CheckStatus, number> = { bad: 0, warn: 1, good: 2 };
    return rank[a.status] - rank[b.status] || b.weight - a.weight;
  });

  const displayTitle = input.metaTitle || input.title || '제목을 입력하세요';
  const displayDesc =
    input.metaDescription ||
    '검색 결과에 보일 설명을 적어주세요. 비워두면 검색엔진이 본문에서 임의로 잘라 사용합니다.';

  return (
    <div className="space-y-4">
      {/* ── 점수 ── */}
      <div className={`rounded-xl border p-4 ${gradeColor}`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-bold">SEO 점수</span>
          <span className="text-sm font-semibold">{GRADE_LABELS[report.grade]}</span>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-bold tabular-nums leading-none">{report.score}</span>
          <span className="text-sm mb-1">/ 100</span>
        </div>
        <div className="h-2 rounded-full bg-white/70 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${report.score}%` }}
          />
        </div>
      </div>

      {/* ── 검색 결과 미리보기 ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-ink mb-3">
          <Search className="w-4 h-4 text-slate-400" />
          검색 결과 미리보기
        </p>
        <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50">
          <p className="text-xs text-slate-500 truncate mb-1">
            {SITE_URL.replace(/^https?:\/\//, '')}
            {postPath}
          </p>
          <p className="text-[1.0625rem] text-[#1a0dab] leading-snug mb-1 line-clamp-2 break-keep">
            {displayTitle}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 break-keep">
            {displayDesc}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          실제 검색 결과와 다르게 보일 수 있습니다. 검색엔진이 더 적합하다고 판단하면 본문에서 직접 문장을 가져다 씁니다.
        </p>
      </div>

      {/* ── 체크리스트 ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <p className="px-4 py-3 text-sm font-bold text-ink border-b border-slate-200 bg-slate-50">
          점검 항목
        </p>
        <ul className="divide-y divide-slate-100">
          {sorted.map((check) => (
            <li key={check.id} className="flex gap-2.5 px-4 py-3">
              <StatusIcon status={check.status} />
              <div className="min-w-0">
                <p
                  className={`text-sm leading-snug break-keep ${
                    check.status === 'good' ? 'text-slate-500' : 'text-ink font-medium'
                  }`}
                >
                  {check.label}
                </p>
                {check.hint && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed break-keep">{check.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'good') {
    return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-label="좋음" />;
  }
  if (status === 'warn') {
    return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-label="개선 권장" />;
  }
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-label="수정 필요" />;
}
