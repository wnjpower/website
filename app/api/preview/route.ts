import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { getAdminUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 미리보기 진입점.
 *
 * 드래프트 모드를 켜면 페이지가 발행본 대신 초안(site_drafts)을 읽는다.
 * 관리자만 켤 수 있으므로, 발행 전 문구가 외부에 노출되지 않는다.
 *
 * 어드민 편집 화면의 iframe이 이 주소를 연다.
 */
export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: '관리자만 미리보기를 열 수 있습니다.' }, { status: 401 });
  }

  // 오픈 리다이렉트 방지 — 우리 사이트 내부 경로만 허용한다.
  // '//evil.com'도 상대경로처럼 보이지만 브라우저는 외부로 보낸다.
  const raw = req.nextUrl.searchParams.get('path') ?? '/';
  const path = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  draftMode().enable();

  const target = req.nextUrl.clone();
  target.pathname = path.split('#')[0].split('?')[0];
  target.search = '';
  // 캐시된 화면이 뜨면 방금 저장한 내용이 안 보인다
  target.searchParams.set('_p', Date.now().toString(36));

  const hash = path.includes('#') ? `#${path.split('#')[1]}` : '';
  return NextResponse.redirect(`${target.toString()}${hash}`);
}
