'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Eye, Phone, Inbox, TrendingUp, AlertCircle, Loader2, RefreshCw, ExternalLink,
} from 'lucide-react';
import BarChart, { InlineBar, CHART_COLORS } from './BarChart';
import { StaffExclusionToggle } from './StaffExclusion';
import { CHANNEL_LABELS, PAID_CHANNELS, type Channel } from '@/lib/analytics/attribution';
import { CTA_SLOT_LABELS, type CtaSlot } from '@/lib/cta/schema';

const RANGES = [
  { value: 'live',  label: '1시간' },
  { value: 'today', label: '오늘' },
  { value: '7d',    label: '7일' },
  { value: '30d',   label: '30일' },
] as const;

const POLL_MS = 15000;

interface Stats {
  range: string;
  rangeLabel: string;
  overview: {
    sessions: number; pageviews: number; phone_clicks: number;
    kakao_clicks: number; form_starts: number; leads: number; cta_clicks: number;
  } | null;
  live: { active_sessions: number; recent_events: number };
  byChannel: { channel: string; sessions: number; pageviews: number; phone_clicks: number; leads: number }[];
  byCampaign: { channel: string; campaign: string; term: string; sessions: number; phone_clicks: number; leads: number }[];
  topPaths: { path: string; pageviews: number; sessions: number }[];
  ctaPerformance: { slot: string; variant: string; impressions: number; clicks: number }[];
  timeseries: { bucket: string; sessions: number; pageviews: number; leads: number }[];
  byDevice: { device: string; browser: string; sessions: number }[];
  leadsByChannel: { channel: string; campaign: string; leads: number; won: number }[];
}

export default function LiveDashboard() {
  const [range, setRange] = useState<string>('today');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<{ kind: string; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (r: string) => {
    try {
      const res = await fetch(`/api/admin/stats?range=${r}`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError({ kind: body.error ?? 'unknown', message: body.message ?? `오류 ${res.status}` });
        setStats(null);
        return;
      }
      setStats(await res.json());
      setError(null);
      setUpdatedAt(new Date());
    } catch (e) {
      setError({ kind: 'network', message: e instanceof Error ? e.message : '네트워크 오류' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load(range);
    const timer = setInterval(() => void load(range), POLL_MS);
    return () => clearInterval(timer);
  }, [range, load]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) return <ErrorPanel error={error} onRetry={() => void load(range)} />;
  if (!stats) return null;

  const o = stats.overview ?? {
    sessions: 0, pageviews: 0, phone_clicks: 0, kakao_clicks: 0, form_starts: 0, leads: 0, cta_clicks: 0,
  };
  const contacts = o.phone_clicks + o.kakao_clicks + o.leads;
  const conversionRate = o.sessions > 0 ? (contacts / o.sessions) * 100 : 0;

  const buckets = stats.timeseries.map((t) => ({
    label: formatBucket(t.bucket, stats.range),
    sessions: t.sessions,
    leads: t.leads,
  }));

  return (
    <div className="space-y-5">
      {/* ── 기간 선택 + 실시간 표시 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                range === r.value ? 'bg-brand text-white' : 'text-slate-500 hover:text-brand'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <StaffExclusionToggle />
          <span className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="font-semibold text-ink tabular-nums">{stats.live.active_sessions}명</span>
            <span className="text-slate-400">지금 접속 중</span>
          </span>
          <button
            onClick={() => void load(range)}
            aria-label="새로고침"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-brand"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 핵심 지표 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile icon={Users} label="방문자" value={o.sessions} hint={stats.rangeLabel} />
        <StatTile icon={Eye} label="페이지뷰" value={o.pageviews} />
        <StatTile icon={Phone} label="전화 클릭" value={o.phone_clicks} accent />
        <StatTile icon={Inbox} label="견적문의" value={o.leads} accent />
        <StatTile
          icon={TrendingUp}
          label="전환율"
          value={conversionRate}
          format={(v) => `${v.toFixed(1)}%`}
          hint="전화+카톡+문의 ÷ 방문자"
        />
      </div>

      {/* ── 추이 (계열마다 축이 하나씩) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="방문자 추이">
          <BarChart data={buckets.map((b) => ({ label: b.label, value: b.sessions }))} color={CHART_COLORS.traffic} valueSuffix="명" />
        </Card>
        <Card title="견적문의 추이">
          <BarChart data={buckets.map((b) => ({ label: b.label, value: b.leads }))} color={CHART_COLORS.conversion} valueSuffix="건" />
        </Card>
      </div>

      {/* ── 광고·유입 성과 ── */}
      <Card
        title="유입 경로별 성과"
        subtitle="광고를 계속 돌릴지 판단하는 표입니다. 방문자 대비 전화·문의 비율(전환율)이 높은 경로에 예산을 몰아주세요."
      >
        <ChannelTable rows={stats.byChannel} />
      </Card>

      {stats.byCampaign.length > 0 && (
        <Card title="캠페인별 성과" subtitle="광고 링크에 utm_campaign을 넣으면 소재별로 나뉘어 집계됩니다.">
          <CampaignTable rows={stats.byCampaign} />
        </Card>
      )}

      {/* ── CTA A/B ── */}
      <Card
        title="CTA 버튼 성과"
        subtitle="같은 자리의 A·B 문구 중 어느 쪽이 더 눌리는지 비교합니다. 노출 100회 미만은 아직 판단하기 이릅니다."
        action={
          <Link href="/admin/cta" className="text-sm font-semibold text-brand hover:underline whitespace-nowrap">
            버튼 관리 →
          </Link>
        }
      >
        <CtaTable rows={stats.ctaPerformance} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="많이 본 페이지">
          <PathTable rows={stats.topPaths} />
        </Card>
        <Card title="기기·브라우저" subtitle="카카오톡·네이버 인앱 브라우저 비중이 높으면 그 환경을 우선 점검해야 합니다.">
          <DeviceTable rows={stats.byDevice} />
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center tabular-nums">
        {updatedAt ? `${updatedAt.toLocaleTimeString('ko-KR')} 기준 · 15초마다 자동 갱신` : ''}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  format,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
  format?: (v: number) => string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent ? 'text-signal' : 'text-slate-400'}`} />
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <p className="text-2xl sm:text-[1.75rem] font-bold text-ink tabular-nums leading-none">
        {format ? format(value) : value.toLocaleString('ko-KR')}
      </p>
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5 leading-relaxed break-keep">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

const th = 'px-3 py-2 text-left text-xs font-bold text-slate-500 whitespace-nowrap';
const td = 'px-3 py-2.5 text-sm text-ink';
const tdNum = `${td} text-right tabular-nums whitespace-nowrap`;

function ChannelTable({ rows }: { rows: Stats['byChannel'] }) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className={th}>유입 경로</th>
            <th className={`${th} w-28`}>방문자</th>
            <th className={`${th} text-right`}>전화</th>
            <th className={`${th} text-right`}>문의</th>
            <th className={`${th} text-right`}>전환율</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && <EmptyRow colSpan={5} message="아직 방문 기록이 없습니다" />}
          {rows.map((r) => {
            const contacts = r.phone_clicks + r.leads;
            const rate = r.sessions > 0 ? (contacts / r.sessions) * 100 : 0;
            const isPaid = PAID_CHANNELS.includes(r.channel as Channel);
            return (
              <tr key={r.channel}>
                <td className={td}>
                  <span className="font-semibold">{CHANNEL_LABELS[r.channel as Channel] ?? r.channel}</span>
                  {isPaid && (
                    <span className="ml-2 text-[0.6875rem] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      유료
                    </span>
                  )}
                </td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums w-10 text-right">{r.sessions}</span>
                    <InlineBar value={r.sessions} max={max} color={CHART_COLORS.traffic} />
                  </div>
                </td>
                <td className={tdNum}>{r.phone_clicks}</td>
                <td className={tdNum}>{r.leads}</td>
                <td className={`${tdNum} font-bold ${rate >= 5 ? 'text-green-700' : 'text-slate-600'}`}>
                  {rate.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CampaignTable({ rows }: { rows: Stats['byCampaign'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className={th}>캠페인</th>
            <th className={th}>경로</th>
            <th className={`${th} text-right`}>방문자</th>
            <th className={`${th} text-right`}>전화</th>
            <th className={`${th} text-right`}>문의</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={`${r.campaign}-${r.term}-${i}`}>
              <td className={td}>
                <span className="font-semibold">{r.campaign}</span>
                {r.term && <span className="block text-xs text-slate-400">{r.term}</span>}
              </td>
              <td className={`${td} text-slate-500`}>{CHANNEL_LABELS[r.channel as Channel] ?? r.channel}</td>
              <td className={tdNum}>{r.sessions}</td>
              <td className={tdNum}>{r.phone_clicks}</td>
              <td className={`${tdNum} font-bold`}>{r.leads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CtaTable({ rows }: { rows: Stats['ctaPerformance'] }) {
  // 같은 자리끼리 묶어야 A와 B를 나란히 비교할 수 있다
  const bySlot = new Map<string, Stats['ctaPerformance']>();
  for (const row of rows) {
    const list = bySlot.get(row.slot) ?? [];
    list.push(row);
    bySlot.set(row.slot, list);
  }

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">아직 버튼 노출 기록이 없습니다</p>;
  }

  return (
    <div className="space-y-4">
      {Array.from(bySlot.entries()).map(([slot, variants]) => {
        const best = variants.reduce((b, v) => {
          const rate = v.impressions > 0 ? v.clicks / v.impressions : 0;
          const bestRate = b.impressions > 0 ? b.clicks / b.impressions : 0;
          return rate > bestRate ? v : b;
        }, variants[0]);
        const meaningful = variants.length > 1 && variants.every((v) => v.impressions >= 100);

        return (
          <div key={slot}>
            <p className="text-sm font-bold text-ink mb-1.5">
              {CTA_SLOT_LABELS[slot as CtaSlot] ?? slot}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className={th}>변형</th>
                    <th className={`${th} text-right`}>노출</th>
                    <th className={`${th} text-right`}>클릭</th>
                    <th className={`${th} text-right`}>클릭률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.map((v) => {
                    const rate = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0;
                    const isWinner = meaningful && v.variant === best.variant;
                    return (
                      <tr key={v.variant}>
                        <td className={td}>
                          <span className="font-mono font-bold">{v.variant}</span>
                          {isWinner && (
                            <span className="ml-2 text-[0.6875rem] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                              우세
                            </span>
                          )}
                        </td>
                        <td className={tdNum}>{v.impressions.toLocaleString('ko-KR')}</td>
                        <td className={tdNum}>{v.clicks.toLocaleString('ko-KR')}</td>
                        <td className={`${tdNum} font-bold`}>{rate.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {variants.length > 1 && !meaningful && (
              <p className="text-xs text-slate-400 mt-1.5">
                노출이 아직 적어 우열을 판단하기 이릅니다 (변형별 100회 이상 권장).
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PathTable({ rows }: { rows: Stats['topPaths'] }) {
  const max = Math.max(...rows.map((r) => r.pageviews), 1);
  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="py-6 text-center text-sm text-slate-400">기록 없음</p>}
      {rows.slice(0, 10).map((r) => (
        <div key={r.path} className="flex items-center gap-3">
          <a
            href={r.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 text-sm text-ink hover:text-brand truncate inline-flex items-center gap-1"
          >
            {r.path}
            <ExternalLink className="w-3 h-3 text-slate-300 flex-shrink-0" />
          </a>
          <div className="w-24 flex-shrink-0">
            <InlineBar value={r.pageviews} max={max} color={CHART_COLORS.traffic} />
          </div>
          <span className="text-sm tabular-nums text-slate-600 w-12 text-right flex-shrink-0">
            {r.pageviews}
          </span>
        </div>
      ))}
    </div>
  );
}

const BROWSER_LABELS: Record<string, string> = {
  kakaotalk: '카카오톡 인앱', naver_app: '네이버 앱', instagram: '인스타그램',
  facebook: '페이스북', line: '라인', samsung: '삼성 인터넷', whale: '웨일',
  chrome: '크롬', safari: '사파리', edge: '엣지', firefox: '파이어폭스', other: '기타',
};
const DEVICE_LABELS: Record<string, string> = { mobile: '모바일', tablet: '태블릿', desktop: 'PC' };

function DeviceTable({ rows }: { rows: Stats['byDevice'] }) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="py-6 text-center text-sm text-slate-400">기록 없음</p>}
      {rows.slice(0, 10).map((r, i) => (
        <div key={`${r.device}-${r.browser}-${i}`} className="flex items-center gap-3">
          <span className="flex-1 min-w-0 text-sm text-ink truncate">
            {DEVICE_LABELS[r.device] ?? r.device}
            <span className="text-slate-400"> · {BROWSER_LABELS[r.browser] ?? r.browser}</span>
          </span>
          <div className="w-24 flex-shrink-0">
            <InlineBar value={r.sessions} max={max} color={CHART_COLORS.traffic} />
          </div>
          <span className="text-sm tabular-nums text-slate-600 w-12 text-right flex-shrink-0">{r.sessions}</span>
        </div>
      ))}
    </div>
  );
}

function ErrorPanel({
  error,
  onRetry,
}: {
  error: { kind: string; message: string };
  onRetry: () => void;
}) {
  const isMissing = error.kind === 'functions_missing';
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h2 className="font-bold text-amber-900 mb-1">
            {isMissing ? '분석 기능이 아직 준비되지 않았습니다' : '데이터를 불러오지 못했습니다'}
          </h2>
          <p className="text-sm text-amber-800 leading-relaxed break-keep">
            {isMissing ? (
              <>
                Supabase에 집계 함수가 아직 설치되지 않았습니다. SQL 편집기에서{' '}
                <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">supabase/admin-schema.sql</code>과{' '}
                <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">supabase/analytics-functions.sql</code>을
                실행하면 바로 동작합니다.
              </>
            ) : (
              error.message
            )}
          </p>
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

/** 구간 시작 시각을 기간에 맞는 짧은 라벨로 만든다. */
function formatBucket(iso: string, range: string): string {
  const d = new Date(iso);
  if (range === 'live' || range === 'today') {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}
