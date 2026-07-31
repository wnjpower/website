import webpush from 'web-push';
import { createServiceSupabase } from '@/lib/supabase-service';
import { COMPANY } from '@/lib/site';
import { VAPID_PUBLIC_KEY, type PushMessage } from './config';

/**
 * 웹 푸시 발송 — 등록된 사장님 기기 전부에 알림을 쏜다. **서버 전용**.
 *
 * 브라우저(크롬·엣지·사파리·삼성인터넷)가 각자의 푸시 서비스 주소를 발급하고,
 * 우리는 VAPID 키로 서명한 요청을 그 주소로 보낸다. 사이트가 닫혀 있어도
 * 기기에 알림이 뜨는 이유가 이것이다. 비용은 없다(브라우저 표준).
 *
 * 실패는 사이트 동작에 영향을 주면 안 된다. 여기서 예외를 던지지 않고
 * 결과만 돌려주며, 만료된 구독은 조용히 정리한다.
 */

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT ?? `mailto:${COMPANY.email}`;

/** 키가 없으면 알림 기능 전체가 꺼진다(사이트는 정상 동작). */
export const isPushConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

let vapidReady = false;
function ensureVapid(): void {
  if (vapidReady) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidReady = true;
}

/** 연속 실패가 이만큼 쌓이면 기기를 비활성화한다. 죽은 구독에 매번 시도하지 않기 위해서다. */
const MAX_FAILURES = 8;

/** 한 번에 시도할 기기 수 상한 — 사장님 기기 몇 대가 전부라 넉넉하다. */
const MAX_DEVICES = 20;

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  failure_count: number;
}

export interface SendResult {
  sent: number;
  failed: number;
  /** 보내지 못한 이유 (기기 0대·키 미설정 등). 성공 시 undefined */
  reason?: 'not_configured' | 'no_service_role' | 'no_devices' | 'query_failed';
}

export async function sendPush(message: PushMessage): Promise<SendResult> {
  if (!isPushConfigured) return { sent: 0, failed: 0, reason: 'not_configured' };

  const db = createServiceSupabase();
  if (!db) return { sent: 0, failed: 0, reason: 'no_service_role' };

  const { data, error } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, failure_count')
    .eq('active', true)
    .limit(MAX_DEVICES);

  if (error) {
    console.error('[push] 기기 목록 조회 실패', error.message);
    return { sent: 0, failed: 0, reason: 'query_failed' };
  }

  const subs = (data ?? []) as SubscriptionRow[];
  if (subs.length === 0) return { sent: 0, failed: 0, reason: 'no_devices' };

  ensureVapid();
  const payload = JSON.stringify(message);

  const succeeded: string[] = [];
  const expired: string[] = [];
  const failed: Array<{ id: string; count: number; error: string }> = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          {
            // 사장님이 즉시 봐야 하는 알림이다. 절전 대기열에 묶이지 않게 high로 보낸다.
            urgency: 'high',
            // 기기가 꺼져 있었다면 10분 안에만 의미가 있다. 그 뒤에 뜨는 알림은 혼란만 준다.
            TTL: 600,
            timeout: 8000,
          },
        );
        succeeded.push(sub.id);
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = 브라우저가 구독을 폐기했다(알림 권한 해제·앱 삭제·기기 초기화).
        // 다시 시도해도 영원히 실패하므로 목록에서 내린다.
        if (status === 404 || status === 410) {
          expired.push(sub.id);
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          failed.push({ id: sub.id, count: sub.failure_count + 1, error: msg.slice(0, 200) });
          console.error('[push] 발송 실패', status ?? '-', msg);
        }
      }
    }),
  );

  // 결과를 기기 행에 남긴다. 어드민 화면이 "이 기기는 알림이 안 가고 있다"를 보여준다.
  try {
    if (succeeded.length) {
      await db
        .from('push_subscriptions')
        .update({ last_success_at: new Date().toISOString(), failure_count: 0, last_error: null })
        .in('id', succeeded);
    }
    if (expired.length) {
      await db
        .from('push_subscriptions')
        .update({ active: false, last_error: '브라우저가 구독을 해제했습니다(만료).' })
        .in('id', expired);
    }
    for (const f of failed) {
      await db
        .from('push_subscriptions')
        .update({
          failure_count: f.count,
          last_error: f.error,
          active: f.count < MAX_FAILURES,
        })
        .eq('id', f.id);
    }
  } catch (e) {
    console.error('[push] 발송 결과 기록 실패', e);
  }

  return { sent: succeeded.length, failed: expired.length + failed.length };
}
