import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';
import { hasServiceRole } from '@/lib/supabase-service';
import { isPushConfigured } from '@/lib/push/send';
import { normalizeSettings } from '@/lib/push/dispatch';
import { NOTIFY_TYPES, VAPID_PUBLIC_KEY } from '@/lib/push/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 어드민 알림 설정 화면의 데이터 소스.
 *
 *  GET — 설정·등록된 기기·환경변수 준비 상태
 *  PUT — 설정 저장
 *
 * 조회·저장 모두 로그인 사용자의 JWT로 나간다. 즉 RLS(is_admin())가 최종
 * 방어선이며, 여기 검사가 뚫려도 남의 데이터가 새지 않는다.
 * (service_role은 발송 경로에서만 쓴다 — lib/supabase-service.ts)
 */

interface DeviceRow {
  id: string;
  endpoint: string;
  label: string | null;
  device: string | null;
  active: boolean;
  failure_count: number;
  last_error: string | null;
  last_success_at: string | null;
  created_at: string;
}

function isTableMissing(message: string, code?: string): boolean {
  return message.includes('does not exist') || code === 'PGRST205' || code === '42P01';
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = await createServerSupabase();

  const [settingsRes, devicesRes] = await Promise.all([
    db.from('notification_settings')
      .select('enabled, types, min_interval_minutes, quiet_start, quiet_end')
      .eq('id', true)
      .maybeSingle(),
    db.from('push_subscriptions')
      .select('id, endpoint, label, device, active, failure_count, last_error, last_success_at, created_at')
      .order('created_at', { ascending: true }),
  ]);

  const failure = settingsRes.error ?? devicesRes.error;
  if (failure && isTableMissing(failure.message, failure.code)) {
    // 마이그레이션(supabase/push-schema.sql) 전 상태 — 화면이 안내를 띄운다
    return NextResponse.json({ error: 'table_missing', message: failure.message }, { status: 503 });
  }

  const devices = ((devicesRes.data ?? []) as DeviceRow[]).map((d) => ({
    id: d.id,
    label: d.label,
    device: d.device,
    active: d.active,
    failureCount: d.failure_count,
    lastError: d.last_error,
    lastSuccessAt: d.last_success_at,
    createdAt: d.created_at,
    // 브라우저가 자기 구독 주소와 대조해 "이 기기"를 표시한다.
    // 전체 endpoint를 내려보낼 이유는 없으므로 뒤쪽 일부만 준다.
    endpointTail: d.endpoint.slice(-24),
  }));

  return NextResponse.json({
    settings: normalizeSettings(settingsRes.data),
    devices,
    publicKey: VAPID_PUBLIC_KEY || null,
    /** 환경변수까지 갖춰져 실제로 발송 가능한 상태인가 */
    ready: isPushConfigured && hasServiceRole,
    vapidConfigured: isPushConfigured,
    serviceRoleConfigured: hasServiceRole,
  });
}

const SettingsSchema = z.object({
  enabled: z.boolean(),
  types: z.array(z.enum(NOTIFY_TYPES)).max(NOTIFY_TYPES.length),
  minIntervalMinutes: z.number().int().min(0).max(1440),
  quietStart: z.number().int().min(0).max(23).nullable(),
  quietEnd:   z.number().int().min(0).max(23).nullable(),
});

export async function PUT(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  const s = parsed.data;
  // 한쪽만 설정된 방해금지 구간은 의미가 없다. 둘 다 있을 때만 저장한다.
  const quietComplete = s.quietStart !== null && s.quietEnd !== null;

  const db = await createServerSupabase();
  const { error } = await db.from('notification_settings').upsert(
    {
      id: true,
      enabled: s.enabled,
      types: s.types,
      min_interval_minutes: s.minIntervalMinutes,
      quiet_start: quietComplete ? s.quietStart : null,
      quiet_end:   quietComplete ? s.quietEnd   : null,
      updated_by:  admin.id,
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.error('[push] 설정 저장 실패', error.message);
    const missing = isTableMissing(error.message, error.code);
    return NextResponse.json(
      { error: missing ? 'table_missing' : 'save_failed', message: error.message },
      { status: missing ? 503 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
