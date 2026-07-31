import { SITE_URL, COMPANY } from '@/lib/site';
import { getPublishedPosts, postPath, postSummary } from '@/lib/posts';

export const revalidate = 3600;

/**
 * RSS 2.0 피드.
 *
 * 네이버 블로그·뉴스 수집기와 피드 리더가 새 글을 자동으로 가져간다.
 * IndexNow가 "지금 바로" 알리는 경로라면, 피드는 "주기적으로 확인하는" 경로다.
 * 둘 다 있어야 놓치는 글이 없다.
 */
function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!),
  );
}

export async function GET() {
  const posts = (await getPublishedPosts())
    .filter((p) => !p.noindex && p.type !== 'notice')
    .slice(0, 50);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}${postPath(post.type, post.slug)}`;
      const date = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(postSummary(post, 200))}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(COMPANY.name)} — 전기공사 정보</title>
    <link>${SITE_URL}</link>
    <description>대구·경북 공장 전기공사, 수전설비·배전반 설치 전문. 비용·절차·제도 안내.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
