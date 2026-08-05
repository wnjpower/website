'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Eye, Phone, Inbox, TrendingUp, Loader2, RefreshCw, ExternalLink,
} from 'lucide-react';
import BarChart, { InlineBar, CHART_COLORS } from './BarChart';
import { StaffExclusionToggle } from './StaffExclusion';
import { Panel, Notice, Chip, Empty, StatTile, Segmented } from './ui';
import { CHANNEL_LABELS, PAID_CHANNELS, type Channel } from '@/lib/analytics/attribution';
import { ctaSlotLabel } from '@/lib/cta/schema';

const RANGES = [
  { value: 'live',  label: '1시간' },
  { value: 'today', label: '오늘' },
  { value: '7d',    label: '7일' },
  { value: '30d',   label: '30일' },
] as const;

type Range = (typeof RANGES)[number]['value'];

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

const ICON = { className: 'w-3.5 h-3.5', strokeWidth: 1.5 } as const;

export default function LiveDashboard() {
  const [range, setRange] = useState<Range>('today');
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
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 className="w-6 h-6 bp-spin" strokeWidth={1.5} />
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
    <div className="space-y-4">
      {/* ── 기간 선택 + 실시간 표시 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={range} options={RANGES} onChange={setRange} ariaLabel="집계 기간" />

        <div className="flex items-center gap-2">
          <StaffExclusionToggle />
          <span className="a-chip" style={{ padding: '6px 10px' }}>
            <span className="a-live-dot" aria-hidden />
            <span className="mono-num" style={{ fontSize: 13, color: 'var(--color-text)' }}>
              {stats.live.active_sessions}명
            </span>
            <span style={{ opacity: 0.7 }}>지금 접속 중</span>
          </span>
          <button
            onClick={() => void load(range)}
            aria-label="새로고침"
            className="a-btn a-btn--icon a-btn--sm"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── 핵심 지표 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <StatTile icon={<Users {...ICON} />} label="방문자" value={o.sessions.toLocaleString('ko-KR')} hint={stats.rangeLabel} />
        <StatTile icon={<Eye {...ICON} />} label="페이지뷰" value={o.pageviews.toLocaleString('ko-KR')} />
        <StatTile icon={<Phone {...ICON} />} label="전화 클릭" value={o.phone_clicks.toLocaleString('ko-KR')} />
        <StatTile icon={<Inbox {...ICON} />} label="견적문의" value={o.leads.toLocaleString('ko-KR')} />
        <StatTile
          icon={<TrendingUp {...ICON} />}
          label="전환율"
          value={`${conversionRate.toFixed(1)}%`}
          hint="전화+카톡+문의 ÷ 방문자"
        />
      </div>

      {/* ── 추이 (계열마다 축이 하나씩) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="방문자 추이">
          <BarChart data={buckets.map((b) => ({ label: b.label, value: b.sessions }))} color={CHART_COLORS.traffic} valueSuffix="명" />
        </Panel>
        <Panel title="견적문의 추이">
          <BarChart data={buckets.map((b) => ({ label: b.label, value: b.leads }))} color={CHART_COLORS.conversion} valueSuffix="건" />
        </Panel>
      </div>

      {/* ── 광고·유입 성과 ── */}
      <Panel
        title="유입 경로별 성과"
        note="광고를 계속 돌릴지 판단하는 표입니다. 방문자 대비 전화·문의 비율(전환율)이 높은 경로에 예산을 몰아주세요."
        flush
      >
        <ChannelTable rows={stats.byChannel} />
      </Panel>

      {stats.byCampaign.length > 0 && (
        <Panel
          title="캠페인별 성과"
          note="광고 링크에 utm_campaign을 넣으면 소재별로 나뉘어 집계됩니다."
          flush
        >
          <CampaignTable rows={stats.byCampaign} />
        </Panel>
      )}

      {/* ── CTA A/B ── */}
      <Panel
        title="CTA 버튼 성과"
        note="같은 자리의 A·B 문구 중 어느 쪽이 더 눌리는지 비교합니다. 노출 100회 미만은 아직 판단하기 이릅니다."
        action={
          <Link href="/admin/cta" className="a-link display whitespace-nowrap" style={{ fontSize: 14 }}>
            버튼 관리 →
          </Link>
        }
      >
        <CtaTable rows={stats.ctaPerformance} />
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="많이 본 페이지">
          <PathTable rows={stats.topPaths} />
        </Panel>
        <Panel
          title="기기·브라우저"
          note="카카오톡·네이버 인앱 브라우저 비중이 높으면 그 환경을 우선 점검해야 합니다."
        >
          <DeviceTable rows={stats.byDevice} />
        </Panel>
      </div>

      <p className="text-muted mono-num text-center" style={{ fontSize: 11.5 }}>
        {updatedAt ? `${updatedAt.toLocaleTimeString('ko-KR')} 기준 · 15초마다 자동 갱신` : ''}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Empty>{message}</Empty>
      </td>
    </tr>
  );
}

const numCell = { textAlign: 'right', whiteSpace: 'nowrap' } as const;

function ChannelTable({ rows }: { rows: Stats['byChannel'] }) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div className="bp-table-scroll">
      <table className="bp-table" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 18 }}>유입 경로</th>
            <th style={{ width: 130 }}>방문자</th>
            <th style={numCell}>전화</th>
            <th style={numCell}>문의</th>
            <th style={{ ...numCell, paddingRight: 18 }}>전환율</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={5} message="아직 방문 기록이 없습니다" />}
          {rows.map((r) => {
            const contacts = r.phone_clicks + r.leads;
            const rate = r.sessions > 0 ? (contacts / r.sessions) * 100 : 0;
            const isPaid = PAID_CHANNELS.includes(r.channel as Channel);
            return (
              <tr key={r.channel}>
                <td style={{ paddingLeft: 18, fontWeight: 500 }}>
                  {CHANNEL_LABELS[r.channel as Channel] ?? r.channel}
                  {isPaid && (
                    <Chip tone="warn" className="ml-2">
                      유료
                    </Chip>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="mono-num w-9 text-right">{r.sessions}</span>
                    <InlineBar value={r.sessions} max={max} color={CHART_COLORS.traffic} />
                  </div>
                </td>
                <td className="mono-num" style={numCell}>{r.phone_clicks}</td>
                <td className="mono-num" style={numCell}>{r.leads}</td>
                <td
                  className="mono-num"
                  style={{
                    ...numCell,
                    paddingRight: 18,
                    fontWeight: 700,
                    color: rate >= 5 ? 'var(--color-accent-700)' : undefined,
                  }}
                >
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
    <div className="bp-table-scroll">
      <table className="bp-table" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 18 }}>캠페인</th>
            <th>경로</th>
            <th style={numCell}>방문자</th>
            <th style={numCell}>전화</th>
            <th style={{ ...numCell, paddingRight: 18 }}>문의</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.campaign}-${r.term}-${i}`}>
              <td style={{ paddingLeft: 18, fontWeight: 500 }}>
                {r.campaign}
                {r.term && (
                  <span className="text-muted block" style={{ fontSize: 12 }}>
                    {r.term}
                  </span>
                )}
              </td>
              <td className="text-muted">{CHANNEL_LABELS[r.channel as Channel] ?? r.channel}</td>
              <td className="mono-num" style={numCell}>{r.sessions}</td>
              <td className="mono-num" style={numCell}>{r.phone_clicks}</td>
              <td className="mono-num" style={{ ...numCell, paddingRight: 18, fontWeight: 700 }}>{r.leads}</td>
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
    return <Empty>아직 버튼 노출 기록이 없습니다</Empty>;
  }

  /*
   * 변형이 하나뿐인 자리는 «비교»할 것이 없다. 그런 자리마다 표를 따로 그리면
   * 한 줄짜리 표가 열 몇 개 쌓여서, 정작 실험 중인 자리가 묻힌다.
   * 단일 문구는 한 표에 모으고, 실험 중인 자리만 아래에 따로 펼친다.
   */
  const single = Array.from(bySlot.values())
    .filter((v) => v.length === 1)
    .map((v) => v[0])
    .sort((a, b) => b.impressions - a.impressions);
  const experiments = Array.from(bySlot.entries()).filter(([, v]) => v.length > 1);

  return (
    <div className="space-y-6">
      {single.length > 0 && (
        <div>
          <p className="bp-label">단일 문구 — 실험 중이 아닌 자리</p>
          <div className="bp-table-scroll">
            <table className="bp-table" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th>자리</th>
                  <th style={numCell}>노출</th>
                  <th style={numCell}>클릭</th>
                  <th style={numCell}>클릭률</th>
                </tr>
              </thead>
              <tbody>
                {single.map((r) => {
                  const rate = r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0;
                  return (
                    <tr key={r.slot}>
                      <td style={{ fontWeight: 500 }}>{ctaSlotLabel(r.slot)}</td>
                      <td className="mono-num" style={numCell}>{r.impressions.toLocaleString('ko-KR')}</td>
                      <td className="mono-num" style={numCell}>{r.clicks.toLocaleString('ko-KR')}</td>
                      <td className="mono-num" style={{ ...numCell, fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {experiments.map(([slot, variants]) => {
        const best = variants.reduce((b, v) => {
          const rate = v.impressions > 0 ? v.clicks / v.impressions : 0;
          const bestRate = b.impressions > 0 ? b.clicks / b.impressions : 0;
          return rate > bestRate ? v : b;
        }, variants[0]);
        const meaningful = variants.every((v) => v.impressions >= 100);

        return (
          <div key={slot}>
            <p className="display flex items-center gap-2" style={{ fontSize: 15, marginBottom: 4 }}>
              {ctaSlotLabel(slot)}
              <Chip tone="outline">A/B 실험 중</Chip>
            </p>
            <div className="bp-table-scroll">
              <table className="bp-table" style={{ minWidth: 420 }}>
                <thead>
                  <tr>
                    <th>변형</th>
                    <th style={numCell}>노출</th>
                    <th style={numCell}>클릭</th>
                    <th style={numCell}>클릭률</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    const rate = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0;
                    const isWinner = meaningful && v.variant === best.variant;
                    return (
                      <tr key={v.variant}>
                        <td>
                          <span className="display" style={{ fontSize: 15 }}>{v.variant}</span>
                          {isWinner && (
                            <Chip tone="ok" className="ml-2">
                              우세
                            </Chip>
                          )}
                        </td>
                        <td className="mono-num" style={numCell}>{v.impressions.toLocaleString('ko-KR')}</td>
                        <td className="mono-num" style={numCell}>{v.clicks.toLocaleString('ko-KR')}</td>
                        <td className="mono-num" style={{ ...numCell, fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!meaningful && (
              <p className="a-help mt-1.5">
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
  if (rows.length === 0) return <Empty>기록 없음</Empty>;
  return (
    <div className="space-y-2">
      {rows.slice(0, 10).map((r) => (
        <div key={r.path} className="flex items-center gap-3">
          <a
            href={r.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 truncate inline-flex items-center gap-1 a-link"
            style={{ fontSize: 13.5 }}
          >
            {r.path}
            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" strokeWidth={1.5} />
          </a>
          <div className="w-24 flex-shrink-0">
            <InlineBar value={r.pageviews} max={max} color={CHART_COLORS.traffic} />
          </div>
          <span className="mono-num w-11 text-right flex-shrink-0" style={{ fontSize: 13.5 }}>
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
  if (rows.length === 0) return <Empty>기록 없음</Empty>;
  return (
    <div className="space-y-2">
      {rows.slice(0, 10).map((r, i) => (
        <div key={`${r.device}-${r.browser}-${i}`} className="flex items-center gap-3">
          <span className="flex-1 min-w-0 truncate" style={{ fontSize: 13.5 }}>
            {DEVICE_LABELS[r.device] ?? r.device}
            <span className="text-muted"> · {BROWSER_LABELS[r.browser] ?? r.browser}</span>
          </span>
          <div className="w-24 flex-shrink-0">
            <InlineBar value={r.sessions} max={max} color={CHART_COLORS.traffic} />
          </div>
          <span className="mono-num w-11 text-right flex-shrink-0" style={{ fontSize: 13.5 }}>
            {r.sessions}
          </span>
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
    <Notice
      tone="warn"
      title={isMissing ? '분석 기능이 아직 준비되지 않았습니다' : '데이터를 불러오지 못했습니다'}
      action={
        <button onClick={onRetry} className="a-btn a-btn--sm">
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          다시 시도
        </button>
      }
    >
      {isMissing ? (
        <p>
          Supabase에 집계 함수가 아직 설치되지 않았습니다. SQL 편집기에서{' '}
          <code>supabase/admin-schema.sql</code>과 <code>supabase/analytics-functions.sql</code>을
          실행하면 바로 동작합니다.
        </p>
      ) : (
        <p>{error.message}</p>
      )}
    </Notice>
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
