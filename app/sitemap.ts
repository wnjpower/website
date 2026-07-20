import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { servicePages } from '@/content/service-pages';
import { portfolioItems } from '@/content/portfolio';

/**
 * 사이트맵은 콘텐츠 파일에서 자동 생성한다.
 * 서비스·시공사례를 추가하면 별도 작업 없이 사이트맵에 반영된다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },

    // 서비스 상세 — 키워드 클러스터를 하나씩 담당하는 핵심 랜딩
    ...servicePages.map((page) => ({
      url: `${SITE_URL}/services/${page.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),

    { url: `${SITE_URL}/portfolio`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    ...portfolioItems.map((item) => ({
      url: `${SITE_URL}/portfolio/${item.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
