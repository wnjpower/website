import { NextResponse } from 'next/server';
import { VAPID_PUBLIC_KEY } from '@/lib/push/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * VAPID 공개키.
 *
 * 공개돼도 되는 값이다(브라우저가 구독을 만들 때 쓰는 서버 식별자일 뿐,
 * 이것만으로는 알림을 보낼 수 없다). 서비스워커가 구독을 재발급할 때
 * 환경변수를 읽을 방법이 없어 이 주소로 가져간다.
 */
export function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY || null });
}
