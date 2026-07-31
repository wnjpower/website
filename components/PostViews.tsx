import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { renderMarkdown, postSummary, formatPostDate, postPath, type Post } from '@/lib/posts';
import { SITE_URL, COMPANY } from '@/lib/site';

/** 게시판 목록 카드 그리드. 블로그·공지·시공실적이 같은 모양을 쓴다. */
export function PostList({ posts, emptyMessage }: { posts: Post[]; emptyMessage: string }) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500 break-keep px-6">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={postPath(post.type, post.slug)}
          className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-brand/30 hover:shadow-lg hover:shadow-slate-200/70 transition-all flex flex-col"
        >
          {post.coverImage && (
            // 외부(Storage) 이미지라 next/image 도메인 설정 없이 쓸 수 있도록 img를 쓴다
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.coverAlt ?? post.title}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/10] object-cover"
            />
          )}
          <div className="p-6 flex flex-col flex-1">
            <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
            </p>
            <h2 className="font-bold text-ink text-lg leading-snug mb-2 group-hover:text-brand transition-colors break-keep">
              {post.title}
            </h2>
            <p className="text-[0.9375rem] text-slate-600 leading-relaxed flex-1 break-keep">
              {postSummary(post)}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand group-hover:gap-2.5 transition-all">
              자세히 보기
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** 게시글 본문. 마크다운을 렌더하고 Article 구조화 데이터를 함께 내보낸다. */
export function PostArticle({ post }: { post: Post }) {
  const html = renderMarkdown(post.body);
  const url = `${SITE_URL}${postPath(post.type, post.slug)}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || postSummary(post, 160),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: COMPANY.name },
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
    },
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
  };

  return (
    <article className="py-14 sm:py-20 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.coverAlt ?? post.title}
            className="w-full rounded-xl border border-slate-200 mb-8 object-cover"
          />
        )}
        <div className="prose-wnj" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
