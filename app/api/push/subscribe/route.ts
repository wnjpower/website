import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';
import { createServiceSupabase } from '@/lib/supabase-service';
import { parseUserAgent } from '@/lib/analytics/attribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 알림 받을 기기 등록 / 해제.
 *
 * 등록은 관리자만 할 수 있다. 예외가 하나 있는데, 브라우저가 구독을 스스로
 * 갱신했을 때 서비스워커가 보내오는 재등록이다. 이때는 로그인 세션이 없지만
 * "이미 등록된 기기의 옛 endpoint를 알고 있다"는 사실이 곧 본인 증명이 된다.
 * (endpoint는 브라우저와 서버만 아는 값이다)
 */

const SubscriptionSchema = z.object({
  endpoint: z.string().url().min(20).max(1000),
  keys: z.object({
    p256dh: z.string().min(10).max(200),
    auth:   z.string().min(5).max(100),
  }),
});

const BodySchema = z.object({
  subscription: SubscriptionSchema,
  label:       z.string().trim().min(1).max(40).optional(),
  oldEndpoint: z.string().max(1000).optional(),
});

/** UA에서 사람이 알아볼 기기 이름을 만든다 — '아이폰 · Safari' 처럼 */
function describeDevice(ua: string): { label: string; device: string } {
  const { device, browser, os } = parseUserAgent(ua);

  const osLabel: Record<string, string> = {
    ios: '아이폰·아이패드', android: '안드로이드', windows: '윈도우 PC',
    macos: '맥', linux: '리눅스', other: '기기',
  };
  const browserLabel: Record<string, string> = {
    chrome: '크롬', edge: '엣지', safari: '사파리', firefox: '파이어폭스',
    samsung: '삼성인터넷', whale: '웨일', kakaotalk: '카카오톡', naver_app: '네이버앱',
    instagram: '인스타그램', facebook: '페이스북', line: '라인', other: '브라우저',
  };

  return {
    label: `${osLabel[os] ?? '기기'} · ${browserLabel[browser] ?? '브라우저'}`,
    device,
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  const { subscription, label, oldEndpoint } = parsed.data;
  const userAgent = req.headers.get('user-agent') ?? '';
  const described = describeDevice(userAgent);

  const row = {
    endpoint:      subscription.endpoint,
    p256dh:        subscription.keys.p256dh,
    auth:          subscription.keys.auth,
    label:         label ?? described.label,
    device:        described.device,
    user_agent:    userAgent.slice(0, 300),
    // 다시 등록했다는 것은 이 기기로 알림을 받겠다는 뜻이다.
    // 이전에 실패가 쌓여 꺼져 있었다면 여기서 되살아난다.
    active:        true,
    failure_count: 0,
    last_error:    null,
  };

  const admin = await getAdminUser();

  if (admin) {
    const db = await createServerSupabase();
    const { error } = await db
      .from('push_subscriptions')
      .upsert({ ...row, created_by: admin.id }, { onConflict: 'endpoint' });

    if (error) {
      console.error('[push] 기기 등록 실패', error.message);
      const missing = error.message.includes('does not exist') || error.code === 'PGRST205';
      return NextResponse.json(
        { error: missing ? 'table_missing' : 'insert_failed', message: error.message },
        { status: missing ? 503 : 500 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  // ── 서비스워커의 자동 재등록 ──
  if (!oldEndpoint) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = createServiceSupabase();
  if (!db) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: existing } = await db
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', oldEndpoint)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { error } = await db
    .from('push_subscriptions')
    .update(row)
    .eq('id', (existing as { id: string }).id);

  if (error) {
    console.error('[push] 기기 재등록 실패', error.message);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, rotated: true });
}

/** 기기 해제 — endpoint(이 브라우저 스스로) 또는 id(목록에서 삭제) */
export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { endpoint?: unknown; id?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // 본문 없이 호출되면 아래에서 400으로 떨어진다
  }

  const db = await createServerSupabase();
  const query = db.from('push_subscriptions').delete();

  if (typeof body.id === 'string' && body.id.length > 0) {
    const { error } = await query.eq('id', body.id);
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.endpoint === 'string' && body.endpoint.length > 0) {
    const { error } = await query.eq('endpoint', body.endpoint);
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'validation' }, { status: 400 });
}
