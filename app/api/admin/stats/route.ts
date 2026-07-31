import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 어드민 실시간 대시보드 데이터.
 *
 * 화면이 15초마다 이 주소를 다시 불러 숫자를 갱신한다. 집계는 전부 DB 함수가
 * 하고 여기서는 기간 계산과 형태 정리만 한다.
 */

export type Range = 'live' | 'today' | '7d' | '30d';

const RANGES: Record<Range, { hours: number; bucketMinutes: number; label: string }> = {
  live:  { hours: 1,        bucketMinutes: 5,    label: '최근 1시간' },
  today: { hours: 24,       bucketMinutes: 60,   label: '오늘 (24시간)' },
  '7d':  { hours: 24 * 7,   bucketMinutes: 360,  label: '최근 7일' },
  '30d': { hours: 24 * 30,  bucketMinutes: 1440, label: '최근 30일' },
};

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rangeParam = (req.nextUrl.searchParams.get('range') ?? 'today') as Range;
  const range = RANGES[rangeParam] ? rangeParam : 'today';
  const { hours, bucketMinutes, label } = RANGES[range];

  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  const args = { from_ts: from.toISOString(), to_ts: to.toISOString() };

  const db = createServerSupabase();

  // 하나가 실패해도 나머지는 보여준다. 대시보드가 통째로 빈 화면이 되는 것보다
  // "이 표만 비어 있다"가 원인 파악에 훨씬 낫다.
  const [
    overview, byChannel, byCampaign, topPaths, ctaPerf, timeseries, byDevice, live, leadsByChannel,
  ] = await Promise.all([
    db.rpc('analytics_overview', args),
    db.rpc('analytics_by_channel', args),
    db.rpc('analytics_by_campaign', args),
    db.rpc('analytics_top_paths', args),
    db.rpc('analytics_cta_performance', args),
    db.rpc('analytics_timeseries', { ...args, bucket_minutes: bucketMinutes }),
    db.rpc('analytics_by_device', args),
    db.rpc('analytics_live', { minutes: 5 }),
    db.rpc('leads_by_channel', args),
  ]);

  const firstError = [
    overview, byChannel, byCampaign, topPaths, ctaPerf, timeseries, byDevice, live, leadsByChannel,
  ].find((r) => r.error)?.error;

  if (firstError) {
    // 함수가 아직 배포되지 않은 경우(마이그레이션 전)를 화면이 구분할 수 있게 한다
    const missing = firstError.message.includes('does not exist') || firstError.code === 'PGRST202';
    return NextResponse.json(
      {
        error: missing ? 'functions_missing' : 'query_failed',
        message: firstError.message,
      },
      { status: missing ? 503 : 500 },
    );
  }

  return NextResponse.json({
    range,
    rangeLabel: label,
    from: from.toISOString(),
    to: to.toISOString(),
    overview: overview.data?.[0] ?? null,
    live: live.data?.[0] ?? { active_sessions: 0, recent_events: 0 },
    byChannel: byChannel.data ?? [],
    byCampaign: byCampaign.data ?? [],
    topPaths: topPaths.data ?? [],
    ctaPerformance: ctaPerf.data ?? [],
    timeseries: timeseries.data ?? [],
    byDevice: byDevice.data ?? [],
    leadsByChannel: leadsByChannel.data ?? [],
  });
}
