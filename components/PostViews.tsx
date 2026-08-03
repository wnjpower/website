import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { renderMarkdown, postSummary, formatPostDate, postPath, type Post } from '@/lib/posts';
import { SITE_URL, COMPANY } from '@/lib/site';
import { CornerMarks } from '@/components/redesign/Chrome';

/**
 * 게시판 목록 카드 — 1b 블루프린트.
 * 사각형 + 헤어라인 + 정합 마크. 블로그·공지·시공실적이 같은 모양을 쓴다.
 */
export function PostList({ posts, emptyMessage }: { posts: Post[]; emptyMessage: string }) {
  if (posts.length === 0) {
    return (
      <div style={{ padding: '64px 0', textAlign: 'center' }}>
        <p className="text-muted" style={{ margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: 28,
      }}
    >
      {posts.map((post) => (
        <Link
          key={post.id}
          href={postPath(post.type, post.slug)}
          className="blueprint post-card"
          style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
        >
          <CornerMarks />
          {post.coverImage && (
            // Storage에 올린 외부 URL이라 next/image 도메인 등록 없이 쓸 수 있도록 img를 쓴다
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.coverAlt ?? post.title}
              loading="lazy"
              decoding="async"
              className="duotone-img"
              style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }}
            />
          )}
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p
              className="text-muted display"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                letterSpacing: '.06em',
                margin: '0 0 10px',
              }}
            >
              <Calendar size={13} strokeWidth={1.5} />
              <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
            </p>
            <h3 style={{ fontSize: 20, lineHeight: 1.25, margin: '0 0 8px' }}>{post.title}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, flex: 1, margin: 0, opacity: 0.8 }}>
              {postSummary(post)}
            </p>
            <span
              className="display"
              style={{
                marginTop: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14.5,
                color: 'var(--color-accent-700)',
              }}
            >
              자세히 보기
              <ArrowRight size={14} strokeWidth={1.5} />
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
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)',
        }}
      >
        {post.coverImage && (
          <figure className="blueprint" style={{ position: 'relative', padding: 12, margin: '0 0 32px' }}>
            <CornerMarks />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.coverAlt ?? post.title}
              className="duotone-img"
              style={{ width: '100%', display: 'block' }}
            />
          </figure>
        )}
        <div className="prose-wnj" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
