'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';
import { invalidateContent } from '@/lib/content/get';
import { invalidateCtas } from '@/lib/cta/get';
import { CONTENT_DEFAULTS, type ContentKey } from '@/lib/content/schema';
import { CTA_SLOTS, type CtaSlot } from '@/lib/cta/schema';
import { LEAD_STATUSES } from '@/lib/leads';
import { pingPaths } from '@/lib/indexnow';
import { AEO_ENGINES, type AeoEngine } from '@/lib/seo/aeo';

/*
 * 서버 액션은 브라우저에서 직접 호출할 수 있는 엔드포인트다.
 * 모든 액션이 첫 줄에서 관리자 여부를 확인한다. DB의 RLS가 최종 방어선이지만,
 * 여기서 막아야 "권한 없음" 대신 의미 있는 메시지를 돌려줄 수 있다.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('관리자 권한이 필요합니다.');
  return user;
}

// ─────────────────────────────────────────────
//  콘텐츠 — 초안 저장 / 발행
// ─────────────────────────────────────────────

export async function saveDraft(key: string, data: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    if (!(key in CONTENT_DEFAULTS)) return { ok: false, error: '알 수 없는 섹션입니다.' };

    const db = await createServerSupabase();
    const { error } = await db
      .from('site_drafts')
      .upsert({ key, data, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/content', 'layout');
    return { ok: true, message: '임시 저장했습니다. 아직 사이트에는 반영되지 않았습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '저장에 실패했습니다.' };
  }
}

export async function publishSection(key: string, data: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    if (!(key in CONTENT_DEFAULTS)) return { ok: false, error: '알 수 없는 섹션입니다.' };

    const db = await createServerSupabase();
    const now = new Date().toISOString();

    // 발행 = 초안을 발행본으로 승격. 초안도 같은 값으로 맞춰 두어야
    // 미리보기와 실제 사이트가 어긋나지 않는다.
    const [{ error: pubError }, { error: draftError }] = await Promise.all([
      db.from('site_content').upsert(
        { key, data, published_by: user.id, published_at: now },
        { onConflict: 'key' },
      ),
      db.from('site_drafts').upsert(
        { key, data, updated_by: user.id, updated_at: now },
        { onConflict: 'key' },
      ),
    ]);

    if (pubError)   return { ok: false, error: pubError.message };
    if (draftError) return { ok: false, error: draftError.message };

    // 캐시를 즉시 버려 방문자가 다음 요청부터 새 문구를 본다
    invalidateContent();
    revalidatePath('/', 'layout');

    // 홈 문구가 바뀌었으니 검색엔진에 알린다 (실패해도 발행은 성공)
    void pingPaths(['/']).catch(() => {});

    return { ok: true, message: '발행했습니다. 사이트에 바로 반영됩니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '발행에 실패했습니다.' };
  }
}

/** 초안을 버리고 현재 발행본 상태로 되돌린다. */
export async function discardDraft(key: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = await createServerSupabase();
    const { error } = await db.from('site_drafts').delete().eq('key', key);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/content', 'layout');
    return { ok: true, message: '수정 중이던 내용을 취소했습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '취소에 실패했습니다.' };
  }
}

/** 기본값(코드에 들어 있는 원래 문구)으로 되돌린다. */
export async function resetSection(key: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!(key in CONTENT_DEFAULTS)) return { ok: false, error: '알 수 없는 섹션입니다.' };

    const db = await createServerSupabase();
    await Promise.all([
      db.from('site_content').delete().eq('key', key),
      db.from('site_drafts').delete().eq('key', key),
    ]);

    invalidateContent();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content', 'layout');
    return { ok: true, message: '기본 문구로 되돌렸습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '되돌리기에 실패했습니다.' };
  }
}

// ─────────────────────────────────────────────
//  CTA
// ─────────────────────────────────────────────

export interface CtaInput {
  id?: string;
  slot: string;
  variant: string;
  label: string;
  sublabel?: string | null;
  href: string;
  icon?: string | null;
  weight: number;
  active: boolean;
  note?: string | null;
}

export async function saveCta(input: CtaInput): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!CTA_SLOTS.includes(input.slot as CtaSlot)) {
      return { ok: false, error: '알 수 없는 버튼 위치입니다.' };
    }
    if (!input.label.trim()) return { ok: false, error: '버튼 문구를 입력하세요.' };
    if (!input.href.trim())  return { ok: false, error: '링크를 입력하세요.' };

    const db = await createServerSupabase();
    const row = {
      slot:     input.slot,
      variant:  input.variant.trim().toUpperCase().slice(0, 10) || 'A',
      label:    input.label.trim(),
      sublabel: input.sublabel?.trim() || null,
      href:     input.href.trim(),
      icon:     input.icon || null,
      weight:   Math.max(0, Math.min(1000, Math.round(input.weight))),
      active:   input.active,
      note:     input.note?.trim() || null,
    };

    const { error } = input.id
      ? await db.from('ctas').update(row).eq('id', input.id)
      : await db.from('ctas').insert(row);

    if (error) {
      // 같은 자리에 같은 이름의 변형을 두 개 만들면 A/B 집계가 섞인다
      if (error.code === '23505') {
        return { ok: false, error: `이 위치에 '${row.variant}' 변형이 이미 있습니다. 다른 이름을 쓰세요.` };
      }
      return { ok: false, error: error.message };
    }

    invalidateCtas();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/cta');
    return { ok: true, message: '버튼을 저장했습니다. 사이트에 바로 반영됩니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '저장에 실패했습니다.' };
  }
}

export async function deleteCta(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = await createServerSupabase();
    const { error } = await db.from('ctas').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };

    invalidateCtas();
    revalidatePath('/', 'layout');
    revalidatePath('/admin/cta');
    return { ok: true, message: '버튼을 삭제했습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '삭제에 실패했습니다.' };
  }
}

// ─────────────────────────────────────────────
//  견적문의 처리 상태
// ─────────────────────────────────────────────

export async function updateLead(
  id: number,
  patch: { status?: string; memo?: string },
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const update: Record<string, string> = {};
    if (patch.status) {
      if (!(LEAD_STATUSES as readonly string[]).includes(patch.status)) {
        return { ok: false, error: '알 수 없는 상태입니다.' };
      }
      update.status = patch.status;
    }
    if (patch.memo !== undefined) update.memo = patch.memo.slice(0, 2000);

    if (Object.keys(update).length === 0) return { ok: true };

    const db = await createServerSupabase();
    const { error } = await db.from('quotes').update(update).eq('id', id);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/leads');
    return { ok: true, message: '저장했습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '저장에 실패했습니다.' };
  }
}

// ─────────────────────────────────────────────
//  AEO 추적 — 키워드
// ─────────────────────────────────────────────

export interface AeoKeywordInput {
  id?: string;
  keyword: string;
  question: string;
  targetPath?: string | null;
  priority: number;
  active: boolean;
  note?: string | null;
}

export async function saveAeoKeyword(input: AeoKeywordInput): Promise<ActionResult> {
  try {
    await requireAdmin();

    const keyword = input.keyword.trim();
    if (!keyword) return { ok: false, error: '키워드를 입력하세요.' };
    if (keyword.length > 100) return { ok: false, error: '키워드가 너무 깁니다 (100자 이내).' };

    const row = {
      keyword,
      question: input.question.trim().slice(0, 300),
      // 빈 문자열을 넣으면 «루트 경로»와 구분되지 않는다. 자동 선택은 null이다.
      target_path: input.targetPath?.trim() || null,
      priority: Math.max(0, Math.min(1000, Math.round(input.priority))),
      active: input.active,
      note: input.note?.trim() || null,
    };

    const db = await createServerSupabase();
    const { error } = input.id
      ? await db.from('aeo_keywords').update(row).eq('id', input.id)
      : await db.from('aeo_keywords').insert(row);

    if (error) {
      // 같은 키워드를 두 번 등록하면 진단이 갈리고 관찰 기록도 나뉜다
      if (error.code === '23505') {
        return { ok: false, error: `"${keyword}"는 이미 추적 중입니다.` };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/aeo');
    return { ok: true, message: '저장했습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '저장에 실패했습니다.' };
  }
}

export async function deleteAeoKeyword(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = await createServerSupabase();
    // 관찰 기록은 on delete cascade로 함께 지워진다
    const { error } = await db.from('aeo_keywords').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/aeo');
    return { ok: true, message: '키워드와 관찰 기록을 지웠습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '삭제에 실패했습니다.' };
  }
}

// ─────────────────────────────────────────────
//  AEO 추적 — 관찰 기록
// ─────────────────────────────────────────────

export interface AeoObservationInput {
  keywordId: string;
  engine: string;
  cited: boolean;
  snippet?: string | null;
  note?: string | null;
  /** 관찰 시각. 나중에 몰아서 입력할 수 있어 직접 지정할 수 있게 둔다 */
  observedAt?: string | null;
}

export async function recordAeoObservation(input: AeoObservationInput): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    if (!AEO_ENGINES.includes(input.engine as AeoEngine)) {
      return { ok: false, error: '알 수 없는 답변엔진입니다.' };
    }

    const db = await createServerSupabase();
    const { error } = await db.from('aeo_observations').insert({
      keyword_id: input.keywordId,
      engine: input.engine,
      cited: input.cited,
      snippet: input.snippet?.trim().slice(0, 2000) || null,
      note: input.note?.trim().slice(0, 1000) || null,
      observed_at: input.observedAt || new Date().toISOString(),
      created_by: user.id,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/aeo');
    return {
      ok: true,
      message: input.cited ? '인용됨으로 기록했습니다.' : '인용 안 됨으로 기록했습니다.',
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '기록에 실패했습니다.' };
  }
}

export async function deleteAeoObservation(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = await createServerSupabase();
    const { error } = await db.from('aeo_observations').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/aeo');
    return { ok: true, message: '기록을 지웠습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '삭제에 실패했습니다.' };
  }
}

// ─────────────────────────────────────────────
//  색인 수동 제출
// ─────────────────────────────────────────────

export async function submitUrlsToSearchEngines(paths: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (paths.length === 0) return { ok: false, error: '제출할 주소가 없습니다.' };

    const results = await pingPaths(paths);
    const okCount = results.filter((r) => r.ok).length;

    revalidatePath('/admin/seo');

    if (okCount === 0) {
      const reason = results[0]?.response ?? '응답 없음';
      return { ok: false, error: `제출이 거부되었습니다: ${reason}` };
    }
    return { ok: true, message: `${okCount}곳에 제출했습니다. (총 ${paths.length}개 주소)` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '제출에 실패했습니다.' };
  }
}

export type { ContentKey };
