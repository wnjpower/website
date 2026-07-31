/**
 * 게시판의 순수 상수·타입.
 *
 * lib/posts.ts는 서버 전용(server-only + DB 접근)이라 클라이언트 컴포넌트에서
 * 가져올 수 없다. 어드민 편집기 같은 클라이언트 화면도 게시판 종류와 주소
 * 규칙은 알아야 하므로, 실행 환경에 의존하지 않는 부분만 여기로 분리한다.
 */

export const POST_TYPES = ['blog', 'notice', 'portfolio'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  blog:      '전기공사 정보',
  notice:    '공지사항',
  portfolio: '시공실적',
};

/** 목록·상세 경로의 단일 정의. sitemap·색인 제출도 이걸 쓴다. */
export const POST_TYPE_BASE: Record<PostType, string> = {
  blog:      '/blog',
  notice:    '/notice',
  portfolio: '/portfolio',
};

export function postPath(type: string, slug: string): string {
  const base = POST_TYPE_BASE[type as PostType] ?? '/blog';
  return `${base}/${slug}`;
}
