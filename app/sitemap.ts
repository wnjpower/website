import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { servicePages } from '@/content/service-pages';
import { portfolioItems } from '@/content/portfolio';
import { getPublishedPosts, postPath } from '@/lib/posts';

/**
 * 사이트맵은 콘텐츠에서 자동 생성한다. 글을 발행하면 별도 작업 없이 반영된다.
 *
 * lastModified를 정확히 넣는 것이 중요하다. 구글은 IndexNow에 참여하지 않으므로,
 * 구글이 변경을 알아채는 유일한 신호가 사이트맵의 lastmod다. 여기에 항상
 * new Date()를 넣으면 "전부 방금 바뀜"이 되어 신호로서 의미가 없어진다.
 * 그래서 글은 실제 수정 시각을, 정적 페이지는 배포 시각을 쓴다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildTime = new Date();
  const posts = await getPublishedPosts();

  const indexablePosts = posts.filter((p) => !p.noindex);

  const blogPosts = indexablePosts.filter((p) => p.type === 'blog');
  const noticePosts = indexablePosts.filter((p) => p.type === 'notice');

  /** 목록 페이지의 lastmod = 그 목록에서 가장 최근에 수정된 글 */
  const latestOf = (list: typeof posts) =>
    list.length > 0
      ? new Date(Math.max(...list.map((p) => new Date(p.updatedAt).getTime())))
      : buildTime;

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: buildTime, changeFrequency: 'weekly', priority: 1 },

    // 서비스 상세 — 키워드 클러스터를 하나씩 담당하는 핵심 랜딩
    ...servicePages.map((page) => ({
      url: `${SITE_URL}/services/${page.slug}`,
      lastModified: buildTime,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),

    { url: `${SITE_URL}/portfolio`, lastModified: latestOf(indexablePosts.filter((p) => p.type === 'portfolio')), changeFrequency: 'weekly', priority: 0.8 },
    ...portfolioItems.map((item) => ({
      url: `${SITE_URL}/portfolio/${item.slug}`,
      lastModified: buildTime,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    { url: `${SITE_URL}/about`, lastModified: buildTime, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: buildTime, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: buildTime, changeFrequency: 'yearly', priority: 0.3 },
  ];

  if (blogPosts.length > 0) {
    entries.push({
      url: `${SITE_URL}/blog`,
      lastModified: latestOf(blogPosts),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }
  if (noticePosts.length > 0) {
    entries.push({
      url: `${SITE_URL}/notice`,
      lastModified: latestOf(noticePosts),
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  entries.push(
    ...indexablePosts.map((post) => ({
      url: `${SITE_URL}${postPath(post.type, post.slug)}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: (post.type === 'notice' ? 'yearly' : 'monthly') as 'yearly' | 'monthly',
      priority: post.type === 'blog' ? 0.7 : 0.5,
    })),
  );

  return entries;
}
