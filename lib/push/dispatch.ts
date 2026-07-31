import { createServiceSupabase } from '@/lib/supabase-service';
import { CHANNEL_LABELS, type Channel } from '@/lib/analytics/attribution';
import { CTA_SLOT_LABELS, type CtaSlot } from '@/lib/cta/schema';
import { sendPush, isPushConfigured } from './send';
import {
  DEFAULT_SETTINGS,
  isNotifyType,
  type NotificationSettings,
  type NotifyType,
  type PushMessage,
} from './config';

/**
 * "이 클릭을 사장님께 알릴 것인가" 판단 + 알림 문구 작성. **서버 전용**.
 *
 * 알림은 많을수록 좋은 게 아니다. 한 사람이 버튼을 여러 번 누르거나 한밤중에
 * 지나가는 클릭까지 전부 울리면, 사장님은 며칠 안에 알림을 꺼버린다.
 * 그러면 정작 중요한 견적문의도 놓친다. 그래서 세 겹으로 거른다.
 *
 *   1) 종류      — 어드민에서 켠 이벤트만
 *   2) 방해금지  — 설정한 시간대에는 보내지 않는다(견적문의 접수는 예외)
 *   3) 반복 억제 — 같은 방문자·같은 종류는 설정한 간격 안에 한 번만
 */

const DEVICE_LABELS: Record<string, string> = {
  mobile:  '휴대폰',
  tablet:  '태블릿',
  desktop: 'PC',
};

/** 한국시간 기준 현재 '시' (0~23) */
function seoulHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(now),
  );
}

/** 한국시간 HH:MM */
export function seoulTime(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
}

/** 방해금지 시간대인가. 22~7처럼 자정을 넘는 구간도 처리한다. */
export function isQuietNow(settings: NotificationSettings, now: Date = new Date()): boolean {
  const { quietStart, quietEnd } = settings;
  if (quietStart === null || quietEnd === null) return false;
  if (quietStart === quietEnd) return false; // 구간 길이 0 — 방해금지 없음으로 본다

  const h = seoulHour(now);
  return quietStart < quietEnd
    ? h >= quietStart && h < quietEnd
    : h >= quietStart || h < quietEnd; // 자정을 넘는 구간
}

/** DB 행 → 앱에서 쓰는 설정 형태. 행이 없거나 값이 이상하면 기본값으로 떨어진다. */
export function normalizeSettings(row: unknown): NotificationSettings {
  const r = (row ?? {}) as Record<string, unknown>;
  const types = Array.isArray(r.types) ? r.types.filter(isNotifyType) : DEFAULT_SETTINGS.types;
  const interval = typeof r.min_interval_minutes === 'number' ? r.min_interval_minutes : DEFAULT_SETTINGS.minIntervalMinutes;
  const quietStart = typeof r.quiet_start === 'number' ? r.quiet_start : null;
  const quietEnd   = typeof r.quiet_end   === 'number' ? r.quiet_end   : null;

  return {
    enabled: r.enabled !== false,
    types,
    minIntervalMinutes: Math.min(Math.max(interval, 0), 1440),
    quietStart,
    quietEnd,
  };
}

export async function loadSettings(): Promise<NotificationSettings> {
  const db = createServiceSupabase();
  if (!db) return DEFAULT_SETTINGS;

  const { data, error } = await db
    .from('notification_settings')
    .select('enabled, types, min_interval_minutes, quiet_start, quiet_end')
    .eq('id', true)
    .maybeSingle();

  // 설정 테이블이 아직 없거나 조회에 실패하면 기본값으로 동작한다.
  // 알림이 통째로 멈추는 것보다, 기본 설정으로라도 뜨는 편이 낫다.
  if (error) return DEFAULT_SETTINGS;
  return normalizeSettings(data);
}

/**
 * 방금 들어온 이벤트 종류들 중 실제로 알릴 것만 고른다.
 *
 * ⚠️ events 테이블에 INSERT 하기 **전에** 호출해야 한다. 넣고 나서 조회하면
 * 방금 넣은 행이 "이미 알린 적 있음"으로 잡혀 첫 알림부터 막힌다.
 */
export async function pickNotifiableTypes(
  sessionId: string,
  types: NotifyType[],
): Promise<NotifyType[]> {
  if (!isPushConfigured || types.length === 0) return [];

  const settings = await loadSettings();
  if (!settings.enabled) return [];

  const quiet = isQuietNow(settings);
  const candidates = [...new Set(types)].filter((t) => {
    if (!settings.types.includes(t)) return false;
    // 견적문의 접수는 방해금지에도 보낸다 — 놓치면 그대로 매출 손실이다.
    if (quiet && t !== 'lead') return false;
    return true;
  });
  if (candidates.length === 0) return [];
  if (settings.minIntervalMinutes <= 0) return candidates;

  const db = createServiceSupabase();
  if (!db) return [];

  const since = new Date(Date.now() - settings.minIntervalMinutes * 60 * 1000).toISOString();
  const { data, error } = await db
    .from('events')
    .select('type')
    .eq('session_id', sessionId)
    .in('type', candidates)
    .gte('created_at', since)
    .limit(50);

  // 조회에 실패하면 억제를 포기하고 보낸다. 중복 알림이 무알림보다 낫다.
  if (error) return candidates;

  const seen = new Set((data ?? []).map((r) => (r as { type: string }).type));
  return candidates.filter((t) => !seen.has(t));
}

export interface EventContext {
  type: NotifyType;
  /** cta_click이면 슬롯 키, 전화·카톡이면 눌린 위치 */
  label?: string | null;
  path?: string | null;
  channel?: string | null;
  device?: string | null;
}

function contextLine(ctx: EventContext): string {
  const parts: string[] = [];

  const channel = ctx.channel && ctx.channel in CHANNEL_LABELS
    ? CHANNEL_LABELS[ctx.channel as Channel]
    : null;
  if (channel) parts.push(channel);

  if (ctx.device && DEVICE_LABELS[ctx.device]) parts.push(DEVICE_LABELS[ctx.device]);
  if (ctx.path) parts.push(ctx.path);
  parts.push(seoulTime());

  return parts.join(' · ');
}

/** 클릭 이벤트 → 알림 문구. 제목만 봐도 무슨 일이 일어났는지 알 수 있게 쓴다. */
export function buildEventMessage(ctx: EventContext, sessionId: string): PushMessage {
  const slotLabel =
    ctx.label && ctx.label in CTA_SLOT_LABELS
      ? CTA_SLOT_LABELS[ctx.label as CtaSlot]
      : ctx.label ?? null;

  const titles: Record<NotifyType, string> = {
    lead:        '새 견적문의가 접수됐습니다',
    phone_click: '전화 버튼을 눌렀습니다',
    kakao_click: '카카오톡 상담 버튼을 눌렀습니다',
    cta_click:   slotLabel ? `버튼 클릭 — ${slotLabel}` : '버튼을 눌렀습니다',
    form_start:  '견적폼 작성을 시작했습니다',
  };

  const bodies: Record<NotifyType, string> = {
    lead:        '어드민 견적문의에서 내용을 확인하세요.',
    phone_click: '곧 전화가 걸려올 수 있습니다.',
    kakao_click: '카카오톡 채널로 문의가 올 수 있습니다.',
    cta_click:   '방문자가 사이트에서 행동을 시작했습니다.',
    form_start:  '작성 중 이탈할 수 있는 단계입니다.',
  };

  return {
    title: titles[ctx.type],
    body: `${bodies[ctx.type]}\n${contextLine(ctx)}`,
    url: ctx.type === 'lead' ? '/admin/leads' : '/admin',
    // 같은 방문자의 같은 종류 알림은 쌓지 않고 최신 것으로 대체한다
    tag: `wnj-${ctx.type}-${sessionId.slice(0, 12)}`,
    type: ctx.type,
  };
}

/** 클릭 알림 발송. 실패해도 예외를 던지지 않는다. */
export async function notifyEvent(ctx: EventContext, sessionId: string): Promise<void> {
  try {
    await sendPush(buildEventMessage(ctx, sessionId));
  } catch (e) {
    console.error('[push] 이벤트 알림 실패', e);
  }
}

export interface LeadContext {
  name: string;
  phone: string;
  categoryLabel: string;
  companyName?: string | null;
  region?: string | null;
  channel?: string | null;
}

/**
 * 견적문의 접수 알림.
 *
 * 반복 억제·방해금지를 적용하지 않는다. 폼이 실제로 제출된 순간은 하루에
 * 몇 건 나오지 않고, 놓치면 곧바로 매출 손실이라 언제나 즉시 알린다.
 */
export async function notifyLead(lead: LeadContext): Promise<boolean> {
  if (!isPushConfigured) return false;

  try {
    const settings = await loadSettings();
    if (!settings.enabled || !settings.types.includes('lead')) return false;

    const who = lead.companyName ? `${lead.companyName} ${lead.name}` : lead.name;
    const detail = [lead.categoryLabel, lead.region].filter(Boolean).join(' · ');
    const channel =
      lead.channel && lead.channel in CHANNEL_LABELS
        ? CHANNEL_LABELS[lead.channel as Channel]
        : null;

    const result = await sendPush({
      title: `새 견적문의 — ${who}`,
      body: [lead.phone, detail, channel, seoulTime()].filter(Boolean).join('\n'),
      url: '/admin/leads',
      tag: `wnj-lead-${Date.now()}`,
      type: 'lead',
    });
    return result.sent > 0;
  } catch (e) {
    console.error('[push] 견적문의 알림 실패', e);
    return false;
  }
}
