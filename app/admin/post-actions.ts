'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';
import { invalidatePosts, postPath, POST_TYPES, type PostType } from '@/lib/posts';
import { analyzeSeo } from '@/lib/seo/analyze';
import { pingPaths } from '@/lib/indexnow';
import type { ActionResult } from './actions';

export interface PostInput {
  id?: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  coverAlt: string;
  status: 'draft' | 'published';
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  noindex: boolean;
  meta?: Record<string, unknown>;
}

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('관리자 권한이 필요합니다.');
  return user;
}

/** 제목에서 주소를 만든다. 한글은 그대로 두면 인코딩돼 읽기 어려우므로 제거한다. */
export async function suggestSlug(title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[가-힣]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // 한글만 있는 제목은 영문 주소를 만들 수 없다. 날짜 기반으로 대체한다.
  if (!base || base.length < 3) {
    const d = new Date();
    return `post-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return base.slice(0, 80);
}

export async function savePost(input: PostInput): Promise<ActionResult & { id?: string }> {
  try {
    const user = await requireAdmin();

    if (!POST_TYPES.includes(input.type as PostType)) {
      return { ok: false, error: '알 수 없는 게시판입니다.' };
    }
    if (!input.title.trim()) return { ok: false, error: '제목을 입력하세요.' };

    const slug = input.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { ok: false, error: '주소는 영문 소문자·숫자·하이픈만 쓸 수 있습니다. 예: daegu-factory-cost' };
    }

    // 저장 시점의 SEO 점수를 함께 기록해 목록에서 한눈에 보이게 한다
    const report = analyzeSeo({
      title: input.title,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      slug,
      body: input.body,
      focusKeyword: input.focusKeyword,
      coverAlt: input.coverAlt,
    });

    const db = createServerSupabase();
    const isPublishing = input.status === 'published';

    const row: Record<string, unknown> = {
      type: input.type,
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim() || null,
      body: input.body,
      cover_image: input.coverImage || null,
      cover_alt: input.coverAlt.trim() || null,
      status: input.status,
      author: user.name ?? null,
      focus_keyword: input.focusKeyword.trim() || null,
      meta_title: input.metaTitle.trim() || null,
      meta_description: input.metaDescription.trim() || null,
      seo_score: report.score,
      noindex: input.noindex,
      meta: input.meta ?? {},
    };

    let postId = input.id;

    if (input.id) {
      // published_at은 처음 발행할 때만 찍는다. 수정할 때마다 갱신하면
      // 목록 정렬이 뒤집히고 "새 글"처럼 보인다.
      const { data: existing } = await db
        .from('posts')
        .select('published_at, status')
        .eq('id', input.id)
        .maybeSingle();

      if (isPublishing && !existing?.published_at) {
        row.published_at = new Date().toISOString();
      }

      const { error } = await db.from('posts').update(row).eq('id', input.id);
      if (error) return { ok: false, error: describeError(error) };
    } else {
      if (isPublishing) row.published_at = new Date().toISOString();
      const { data, error } = await db.from('posts').insert(row).select('id').single();
      if (error) return { ok: false, error: describeError(error) };
      postId = data?.id;
    }

    invalidatePosts();
    const path = postPath(input.type, slug);
    revalidatePath(path);
    revalidatePath(`/${input.type === 'portfolio' ? 'portfolio' : input.type}`);
    revalidatePath('/admin/posts');

    // 발행된 글만 검색엔진에 알린다. 초안 주소를 알리면 404가 색인 시도된다.
    if (isPublishing && !input.noindex) {
      void pingPaths([path]).catch(() => {});
    }

    return {
      ok: true,
      id: postId,
      message: isPublishing
        ? '발행했습니다. 검색엔진에도 자동으로 알렸습니다.'
        : '임시 저장했습니다. 아직 사이트에 보이지 않습니다.',
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '저장에 실패했습니다.' };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = createServerSupabase();
    const { error } = await db.from('posts').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };

    invalidatePosts();
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/notice');
    return { ok: true, message: '삭제했습니다.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '삭제에 실패했습니다.' };
  }
}

function describeError(error: { code?: string; message: string }): string {
  if (error.code === '23505') return '같은 주소를 쓰는 글이 이미 있습니다. 주소를 바꿔주세요.';
  if (error.code === '42P01') {
    return '게시판 테이블이 아직 없습니다. supabase/admin-schema.sql을 실행해 주세요.';
  }
  return error.message;
}
