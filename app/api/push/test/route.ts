import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase-server';
import { sendPush } from '@/lib/push/send';
import { seoulTime } from '@/lib/push/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 시험 알림 발송.
 *
 * 알림 기능은 "설정을 다 했는데 정작 안 온다"가 가장 흔한 실패다.
 * 권한·구독·VAPID 키·푸시 서비스 중 어디가 막혔는지는 실제로 한 번
 * 쏴보는 것 말고 확인할 방법이 없어서, 어드민에 시험 버튼을 둔다.
 */
export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const result = await sendPush({
    title: '알림 시험 — 정상 동작합니다',
    body: `이 알림이 보이면 설정이 끝난 것입니다.\n${seoulTime()}`,
    url: '/admin/notifications',
    tag: 'wnj-test',
    type: 'test',
  });

  return NextResponse.json(result);
}
