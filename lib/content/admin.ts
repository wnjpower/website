import 'server-only';
import { createServerSupabase } from '@/lib/supabase-server';
import { CONTENT_DEFAULTS, type ContentKey } from './schema';

type Obj = Record<string, unknown>;

/** 배열은 통째로 교체, 객체는 키 단위 병합 — lib/content/get.ts와 같은 규칙. */
function mergeDeep<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (typeof base === 'object' && base !== null) {
    if (typeof override !== 'object' || Array.isArray(override)) return base;
    const out: Obj = { ...(base as unknown as Obj) };
    for (const [k, v] of Object.entries(override as Obj)) {
      if (k in out) out[k] = mergeDeep(out[k], v);
    }
    return out as unknown as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}

export interface SectionState {
  /** 편집기에 채울 값 = 초안 > 발행본 > 기본값 */
  data: Obj;
  /** 발행되지 않은 수정이 남아 있는가 */
  hasDraft: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
}

/** 어드민에서 한 섹션의 현재 상태를 읽는다. */
export async function getSectionState(key: ContentKey): Promise<SectionState> {
  const base = CONTENT_DEFAULTS[key] as unknown as Obj;

  try {
    const db = await createServerSupabase();
    const [pub, draft] = await Promise.all([
      db.from('site_content').select('data, published_at').eq('key', key).maybeSingle(),
      db.from('site_drafts').select('data, updated_at').eq('key', key).maybeSingle(),
    ]);

    const published = mergeDeep(base, pub.data?.data);
    const hasDraftRow = Boolean(draft.data);
    const data = hasDraftRow ? mergeDeep(published, draft.data?.data) : published;

    // 초안이 있어도 발행본과 내용이 같으면 "발행 대기"가 아니다.
    // 발행 직후에는 두 값을 같게 맞추므로 이 비교로 배지가 남는 것을 막는다.
    const differs = hasDraftRow && JSON.stringify(data) !== JSON.stringify(published);

    return {
      data,
      hasDraft: differs,
      publishedAt: (pub.data?.published_at as string | undefined) ?? null,
      updatedAt: (draft.data?.updated_at as string | undefined) ?? null,
    };
  } catch {
    return { data: base, hasDraft: false, publishedAt: null, updatedAt: null };
  }
}

/** 목록 화면용 — 모든 섹션의 발행/초안 상태를 한 번에 읽는다. */
export async function getAllSectionStates(): Promise<
  Record<string, { hasDraft: boolean; publishedAt: string | null }>
> {
  const out: Record<string, { hasDraft: boolean; publishedAt: string | null }> = {};

  try {
    const db = await createServerSupabase();
    const [pub, drafts] = await Promise.all([
      db.from('site_content').select('key, data, published_at'),
      db.from('site_drafts').select('key, data'),
    ]);

    const pubMap = new Map((pub.data ?? []).map((r) => [r.key as string, r]));
    const draftMap = new Map((drafts.data ?? []).map((r) => [r.key as string, r]));

    for (const key of Object.keys(CONTENT_DEFAULTS) as ContentKey[]) {
      const base = CONTENT_DEFAULTS[key] as unknown as Obj;
      const publishedRow = pubMap.get(key);
      const draftRow = draftMap.get(key);

      const published = mergeDeep(base, publishedRow?.data);
      const draft = draftRow ? mergeDeep(published, draftRow.data) : published;

      out[key] = {
        hasDraft: Boolean(draftRow) && JSON.stringify(draft) !== JSON.stringify(published),
        publishedAt: (publishedRow?.published_at as string | undefined) ?? null,
      };
    }
  } catch {
    for (const key of Object.keys(CONTENT_DEFAULTS)) {
      out[key] = { hasDraft: false, publishedAt: null };
    }
  }

  return out;
}
