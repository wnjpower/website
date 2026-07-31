import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { PostArticle } from '@/components/PostViews';
import { getPublishedPost, getPublishedPosts, postSummary, formatPostDate } from '@/lib/posts';

export async function generateStaticParams() {
  const posts = await getPublishedPosts('notice');
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPost('notice', params.slug);
  if (!post) return { title: '글을 찾을 수 없습니다' };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || postSummary(post, 160);

  return {
    title,
    description,
    alternates: { canonical: `/notice/${post.slug}` },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: { type: 'article', title, description },
  };
}

export default async function NoticePostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost('notice', params.slug);
  if (!post) notFound();

  return (
    <SubPageShell quoteSource={`notice_${post.slug}`}>
      <PageHero
        eyebrow={formatPostDate(post.publishedAt)}
        title={post.title}
        crumbs={[{ label: '공지사항', href: '/notice' }, { label: post.title }]}
      />
      <PostArticle post={post} />
    </SubPageShell>
  );
}
