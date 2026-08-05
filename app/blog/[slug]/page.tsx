import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { PostArticle } from '@/components/PostViews';
import { getPublishedPost, getPublishedPosts, postSummary, formatPostDate } from '@/lib/posts';

export async function generateStaticParams() {
  const posts = await getPublishedPosts('blog');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost('blog', slug);
  if (!post) return { title: '글을 찾을 수 없습니다' };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || postSummary(post, 160);

  return {
    title,
    description,
    keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedPost('blog', slug);
  if (!post) notFound();

  return (
    <SubPageShell quoteSource={`blog_${post.slug}`}>
      <PageHero
        eyebrow={formatPostDate(post.publishedAt)}
        title={post.title}
        lead={post.excerpt ?? undefined}
        crumbs={[{ label: '전기공사 정보', href: '/blog' }, { label: post.title }]}
      />
      <PostArticle post={post} />
    </SubPageShell>
  );
}
