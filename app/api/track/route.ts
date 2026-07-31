import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { parseAttribution, parseUserAgent, EMPTY_ATTRIBUTION } from '@/lib/analytics/attribution';
import { STAFF_COOKIE, STAFF_EXCLUDED } from '@/lib/analytics/staff';
import { pickNotifiableTypes, notifyEvent } from '@/lib/push/dispatch';
import { isNotifyType, type NotifyType } from '@/lib/push/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 자체 분석 이벤트 수집기.
 *
 * 개인정보는 받지도 저장하지도 않는다. IP는 기록하지 않고, 방문자 식별은
 * 미들웨어가 심은 임의 세션 ID뿐이다. 유입 경로(UTM·채널)는 서버가 쿠키에서
 * 읽는다 — 클라이언트가 보낸 값을 그대로 믿으면 조작된 성과 데이터가 쌓인다.
 */

const ALLOWED_TYPES = new Set([
  'pageview',
  'cta_impression',
  'cta_click',
  'phone_click',
  'kakao_click',
  'form_start',
  'lead',
  'scroll_depth',
]);

const MAX_BATCH = 20;

interface IncomingEvent {
  type?: unknown;
  path?: unknown;
  ctaId?: unknown;
  variant?: unknown;
  label?: unknown;
  value?: unknown;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim().slice(0, max);
  return s.length ? s : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  // 수집이 실패해도 사이트는 아무 영향을 받으면 안 된다.
  // 어떤 경로로 나가든 204를 돌려주고, 문제는 서버 로그로만 남긴다.
  const noContent = new NextResponse(null, { status: 204 });

  if (!isSupabaseConfigured) return noContent;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return noContent;
  }

  const list: IncomingEvent[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { events?: unknown })?.events)
      ? ((payload as { events: IncomingEvent[] }).events)
      : [payload as IncomingEvent];

  if (list.length === 0) return noContent;

  // 내부 인원(관리자) 방문은 집계하지 않는다.
  // 사장님이 사이트를 확인할수록 방문자 수가 늘고 전환율이 낮게 보이는데,
  // 트래픽이 적은 초기일수록 이 왜곡이 크다.
  // '0'은 관리자가 "내 방문도 집계"를 직접 켠 상태다. '1'일 때만 버린다.
  if (req.cookies.get(STAFF_COOKIE)?.value === STAFF_EXCLUDED) return noContent;

  const sessionId = req.cookies.get('wnj_sid')?.value;
  if (!sessionId || !/^[a-f0-9]{32}$/.test(sessionId)) return noContent;

  const attribution =
    parseAttribution(req.cookies.get('wnj_attr')?.value) ?? EMPTY_ATTRIBUTION;
  const { device, browser, os } = parseUserAgent(req.headers.get('user-agent') ?? '');

  // 어드민 화면은 집계 대상이 아니다.
  // 클라이언트(Tracker)에서 이미 막지만, 큐에 남아 있던 이벤트가 뒤늦게 넘어오거나
  // 누군가 직접 호출하는 경우가 있어 서버에서도 한 번 더 거른다. 이 숫자가 오염되면
  // 전환율 판단이 통째로 틀어지므로 방어를 두 겹 둔다.
  const isAdminPath = (p: string | null) => Boolean(p && p.startsWith('/admin'));

  const rows = list
    .slice(0, MAX_BATCH)
    .map((e) => {
      const type = str(e.type, 30);
      if (!type || !ALLOWED_TYPES.has(type)) return null;
      if (isAdminPath(str(e.path, 300))) return null;

      const ctaId = str(e.ctaId, 64);
      const value = typeof e.value === 'number' && Number.isFinite(e.value) ? e.value : null;

      return {
        type,
        session_id: sessionId,
        path: str(e.path, 300),
        referrer_host: attribution.referrerHost,
        channel: attribution.channel,
        utm_source:   attribution.utmSource,
        utm_medium:   attribution.utmMedium,
        utm_campaign: attribution.utmCampaign,
        utm_term:     attribution.utmTerm,
        utm_content:  attribution.utmContent,
        device,
        browser,
        os,
        // 기본 CTA는 'default:slot' 형태라 uuid가 아니다. uuid가 아니면 컬럼을
        // 비우고 label에 남긴다(uuid 컬럼에 문자열을 넣으면 INSERT 전체가 깨진다).
        cta_id:  ctaId && UUID_RE.test(ctaId) ? ctaId : null,
        variant: str(e.variant, 10),
        label:   str(e.label, 80) ?? (ctaId && !UUID_RE.test(ctaId) ? ctaId.slice(0, 80) : null),
        value,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return noContent;

  /*
   * 사장님 기기로 보낼 알림을 고른다 — INSERT 하기 전에.
   *
   * 반복 억제("같은 방문자가 30분 안에 또 눌렀나")를 events 테이블로 판단하는데,
   * 지금 들어온 행을 먼저 넣어 버리면 그 행이 "이미 알린 적 있음"으로 잡혀
   * 첫 알림부터 막힌다. 순서를 바꾸지 말 것.
   */
  const notifyCandidates = rows
    .map((r) => r.type)
    .filter(isNotifyType)
    // 견적문의(lead) 알림은 /api/quote가 보낸다. 거기엔 고객 이름·연락처가 있어
    // 훨씬 쓸모 있는 알림이 되고, 여기서 같이 보내면 같은 문의로 두 번 울린다.
    .filter((t) => t !== 'lead');

  const allowed = notifyCandidates.length
    ? await pickNotifiableTypes(sessionId, notifyCandidates)
    : [];

  try {
    const { error } = await supabase.from('events').insert(rows);
    if (error) console.error('[track] insert 실패', error.message);
  } catch (e) {
    console.error('[track] insert 예외', e);
  }

  /*
   * 알림 발송. 응답을 기다리게 만들지만(서버리스는 응답 후 실행이 끊긴다)
   * 클라이언트는 sendBeacon으로 보내고 결과를 기다리지 않으므로 체감 지연이 없다.
   * 한 번에 두 건까지만 보낸다 — 한 요청에 여러 종류가 섞여도 알림이 쏟아지지 않게.
   */
  if (allowed.length) {
    const sent = new Set<NotifyType>();
    for (const type of allowed.slice(0, 2)) {
      if (sent.has(type)) continue;
      sent.add(type);
      const row = rows.find((r) => r.type === type);
      await notifyEvent(
        {
          type,
          label:   row?.label ?? null,
          path:    row?.path ?? null,
          channel: attribution.channel,
          device,
        },
        sessionId,
      );
    }
  }

  return noContent;
}
