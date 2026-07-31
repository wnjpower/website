import 'server-only';
import { SITE_URL } from '@/lib/site';

/**
 * IndexNow — 새 글·수정된 페이지를 검색엔진에 즉시 알린다.
 *
 * 네이버 서치어드바이저가 2023년 7월부터 IndexNow를 지원한다. 로봇이 찾아올 때까지
 * 기다리지 않고 우리가 먼저 알리므로, 발행 직후 색인까지의 시간이 크게 줄어든다.
 * Bing·Yandex·Seznam도 같은 프로토콜을 쓴다.
 *
 * [구글은?]
 * 구글은 IndexNow에 참여하지 않는다. 공식 Indexing API도 채용공고(JobPosting)와
 * 방송(BroadcastEvent)에만 허용돼 있어 일반 페이지에는 쓸 수 없다.
 * 그래서 구글용 경로는 "sitemap의 lastmod를 정확히 유지하는 것"이다.
 * app/sitemap.ts가 글 수정 시각을 그대로 lastmod로 내보내므로, 구글이
 * 사이트맵을 다시 읽을 때 변경을 바로 알아챈다.
 *
 * 키 파일: public/{key}.txt — 이 파일이 접근 가능해야 제출이 승인된다.
 * 키를 바꾸려면 환경변수와 public 폴더의 파일 이름·내용을 함께 바꿔야 한다.
 */

const DEFAULT_KEY = '7cc4061689dcd8a0e0b037335893d356';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? DEFAULT_KEY;

/** 제출 대상. 공용 엔드포인트가 참여사에 전파하지만, 네이버는 직접도 함께 보낸다. */
const ENDPOINTS: { target: string; url: string }[] = [
  { target: 'indexnow', url: 'https://api.indexnow.org/IndexNow' },
  { target: 'naver',    url: 'https://searchadvisor.naver.com/indexnow' },
];

export interface PingResult {
  target: string;
  ok: boolean;
  status: number | null;
  response: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'www.wnjpower.com';
  }
}

/**
 * 절대 URL 목록을 제출한다. 한 번에 최대 10,000건까지 가능하지만
 * 실제로는 방금 바뀐 몇 건만 보내는 것이 정상적인 사용법이다.
 */
export async function submitToIndexNow(urls: string[]): Promise<PingResult[]> {
  const host = hostOf(SITE_URL);

  // 우리 도메인 URL만 남긴다. 다른 호스트가 섞이면 요청 전체가 거부된다.
  const urlList = Array.from(
    new Set(urls.filter((u) => u.startsWith(SITE_URL))),
  ).slice(0, 10000);

  if (urlList.length === 0) return [];

  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  return Promise.all(
    ENDPOINTS.map(async ({ target, url }): Promise<PingResult> => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
          // 색인 제출이 느리다고 발행이 막히면 안 된다
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        });

        const text = (await res.text().catch(() => '')).slice(0, 500);

        /*
         * 200 OK       — 접수됨
         * 202 Accepted — 접수됐으나 키 검증 대기 (정상)
         * 400/403/422  — 키 파일 문제. 아래 message로 원인이 드러난다.
         * 429          — 너무 잦은 제출
         */
        return {
          target,
          ok: res.status === 200 || res.status === 202,
          status: res.status,
          response: text || res.statusText,
        };
      } catch (e) {
        return {
          target,
          ok: false,
          status: null,
          response: e instanceof Error ? e.message : '알 수 없는 오류',
        };
      }
    }),
  );
}

/** 발행/수정된 페이지 경로들을 절대 URL로 바꿔 제출하고 결과를 기록한다. */
export async function pingPaths(paths: string[]): Promise<PingResult[]> {
  const urls = paths.map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`));
  const results = await submitToIndexNow(urls);

  // 제출 이력은 어드민 '검색엔진' 화면에서 확인한다.
  // 기록 실패가 발행을 막으면 안 되므로 조용히 넘어간다.
  try {
    const { createServerSupabase } = await import('@/lib/supabase-server');
    const db = createServerSupabase();
    await db.from('index_pings').insert(
      results.map((r) => ({
        target: r.target,
        urls,
        ok: r.ok,
        status: r.status,
        response: r.response.slice(0, 500),
      })),
    );
  } catch (e) {
    console.error('[indexnow] 이력 기록 실패', e);
  }

  return results;
}
