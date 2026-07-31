import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { Marked } from 'marked';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { PostType } from './posts-shared';

export const POSTS_TAG = 'posts';

// 게시판 종류·경로 규칙은 클라이언트 화면(어드민 편집기)도 알아야 해서
// 실행 환경에 의존하지 않는 posts-shared.ts에 있다. 서버 쪽 호출부가
// import 경로를 두 개 기억하지 않도록 여기서 그대로 다시 내보낸다.
export {
  POST_TYPES,
  POST_TYPE_LABELS,
  POST_TYPE_BASE,
  postPath,
} from './posts-shared';
export type { PostType } from './posts-shared';

export interface Post {
  id: string;
  type: PostType;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  coverAlt: string | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  author: string | null;
  focusKeyword: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  seoScore: number | null;
  noindex: boolean;
  meta: Record<string, unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toPost(row: any): Post {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body ?? '',
    coverImage: row.cover_image,
    coverAlt: row.cover_alt,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    author: row.author,
    focusKeyword: row.focus_keyword,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    seoScore: row.seo_score,
    noindex: row.noindex ?? false,
    meta: row.meta ?? {},
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const SELECT =
  'id, type, slug, title, excerpt, body, cover_image, cover_alt, status, published_at, ' +
  'updated_at, created_at, author, focus_keyword, meta_title, meta_description, seo_score, noindex, meta';

/** 발행된 글 목록. 공개 사이트가 쓴다. */
export const getPublishedPosts = unstable_cache(
  async (type?: PostType): Promise<Post[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase
        .from('posts')
        .select(SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(200);

      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) {
        // posts 테이블이 아직 없어도 사이트는 정상 동작해야 한다
        console.error('[posts] 목록 조회 실패', error.message);
        return [];
      }
      return (data ?? []).map(toPost);
    } catch {
      return [];
    }
  },
  ['posts-published'],
  { tags: [POSTS_TAG], revalidate: 300 },
);

export const getPublishedPost = unstable_cache(
  async (type: PostType, slug: string): Promise<Post | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(SELECT)
        .eq('status', 'published')
        .eq('type', type)
        .eq('slug', slug)
        .maybeSingle();
      if (error || !data) return null;
      return toPost(data);
    } catch {
      return null;
    }
  },
  ['post-detail'],
  { tags: [POSTS_TAG], revalidate: 300 },
);

export function invalidatePosts(): void {
  revalidateTag(POSTS_TAG);
}

// ─────────────────────────────────────────────
//  마크다운 → HTML
// ─────────────────────────────────────────────

/**
 * 원시 HTML을 통째로 버리는 렌더러.
 *
 * 글쓴이가 관리자뿐이라 위험이 크진 않지만, 붙여넣기 한 번으로 추적 스크립트나
 * iframe이 페이지에 실려 나가는 사고를 막는다. 필요한 표현은 마크다운으로 다 된다.
 */
const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html() {
      return '';
    },
  },
});

export function renderMarkdown(md: string): string {
  if (!md) return '';
  const html = marked.parse(md, { async: false }) as string;

  // 외부 링크는 새 탭 + rel 보안 속성을 붙인다
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    (match, href: string) =>
      href.includes('wnjpower.com')
        ? match
        : `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow"`,
  );
}

/** 목록에 쓸 요약. 직접 적은 excerpt가 없으면 본문 앞부분을 잘라 쓴다. */
export function postSummary(post: Post, max = 120): string {
  if (post.excerpt) return post.excerpt;
  const plain = post.body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
