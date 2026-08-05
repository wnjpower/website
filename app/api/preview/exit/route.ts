import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export const dynamic = 'force-dynamic';

/** 미리보기 모드를 끄고 실제 사이트로 돌아간다. */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();

  const raw = req.nextUrl.searchParams.get('path') ?? '/';
  const path = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  const target = req.nextUrl.clone();
  target.pathname = path;
  target.search = '';
  return NextResponse.redirect(target);
}
