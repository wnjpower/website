import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { draftMode } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CONTENT_DEFAULTS, type SiteContent, type ContentKey } from './schema';

export const CONTENT_TAG = 'site-content';

type Json = Record<string, unknown>;

/**
 * DB에 저장된 값을 기본값 위에 덮는다.
 *
 * 객체는 키 단위로 파고들고, 배열과 원시값은 통째로 교체한다.
 * 배열을 병합하지 않는 이유: 어드민에서 목록은 항상 전체가 한 번에 저장되므로
 * 항목을 지웠는데 기본값이 되살아나는 사고를 막아야 한다.
 */
function mergeDeep<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;

  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (typeof base === 'object' && base !== null) {
    if (typeof override !== 'object' || Array.isArray(override)) return base;
    const out: Json = { ...(base as unknown as Json) };
    for (const [k, v] of Object.entries(override as Json)) {
      // 기본값에 없는 키는 버린다. 스키마에서 필드를 없앤 뒤에도 옛 값이
      // 남아 화면에 흘러드는 것을 막는다.
      if (k in out) out[k] = mergeDeep(out[k], v);
    }
    return out as unknown as T;
  }

  return (typeof override === typeof base ? override : base) as T;
}

function applyRows(rows: { key: string; data: unknown }[] | null): SiteContent {
  const result = { ...CONTENT_DEFAULTS } as SiteContent;
  if (!rows) return result;
  for (const row of rows) {
    const key = row.key as ContentKey;
    if (!(key in result)) continue;
    (result as Record<string, unknown>)[key] = mergeDeep(
      CONTENT_DEFAULTS[key],
      row.data,
    );
  }
  return result;
}

/**
 * 발행본. revalidateTag(CONTENT_TAG)로만 무효화되므로 방문자가 몰려도
 * DB를 반복해서 때리지 않는다. 어드민에서 "발행"을 누르면 즉시 갱신된다.
 */
const getPublishedContent = unstable_cache(
  async (): Promise<SiteContent> => {
    if (!isSupabaseConfigured) return { ...CONTENT_DEFAULTS } as SiteContent;
    try {
      const { data, error } = await supabase.from('site_content').select('key, data');
      if (error) {
        console.error('[content] 발행본 조회 실패 — 기본값 사용', error.message);
        return { ...CONTENT_DEFAULTS } as SiteContent;
      }
      return applyRows(data);
    } catch (e) {
      console.error('[content] 발행본 조회 예외 — 기본값 사용', e);
      return { ...CONTENT_DEFAULTS } as SiteContent;
    }
  },
  ['site-content-published'],
  { tags: [CONTENT_TAG], revalidate: 3600 },
);

/** 초안 — 어드민 미리보기 전용. 로그인 세션이 필요하므로 캐시하지 않는다. */
async function getDraftContent(): Promise<SiteContent> {
  const { createServerSupabase } = await import('@/lib/supabase-server');
  const published = await getPublishedContent();
  try {
    const db = await createServerSupabase();
    const { data, error } = await db.from('site_drafts').select('key, data');
    if (error || !data) return published;

    const result = { ...published };
    for (const row of data) {
      const key = row.key as ContentKey;
      if (!(key in result)) continue;
      (result as Record<string, unknown>)[key] = mergeDeep(result[key], row.data);
    }
    return result;
  } catch {
    return published;
  }
}

/**
 * 페이지에서 쓰는 진입점.
 * 어드민 미리보기(draftMode)면 초안을, 아니면 발행본을 준다.
 */
export async function getSiteContent(): Promise<SiteContent> {
  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    // draftMode()를 쓸 수 없는 컨텍스트(정적 생성 등) — 발행본으로 간다
  }
  return isDraft ? getDraftContent() : getPublishedContent();
}

/** 발행본 캐시를 즉시 버린다. 저장/발행 직후에 호출한다. */
export function invalidateContent(): void {
  revalidateTag(CONTENT_TAG);
}

export { CONTENT_DEFAULTS };
export type { SiteContent, ContentKey };
