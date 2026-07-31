import PageHeader from '@/components/admin/PageHeader';
import SeoConsole, { type PingRow } from '@/components/admin/SeoConsole';
import { createServerSupabase } from '@/lib/supabase-server';
import { INDEXNOW_KEY } from '@/lib/indexnow';
import { SITE_URL } from '@/lib/site';
import { servicePages } from '@/content/service-pages';
import { portfolioItems } from '@/content/portfolio';
import { getPublishedPosts, postPath } from '@/lib/posts';

export default async function SeoPage() {
  const db = createServerSupabase();

  const [{ data: pings }, posts] = await Promise.all([
    db
      .from('index_pings')
      .select('id, created_at, target, urls, ok, status, response')
      .order('created_at', { ascending: false })
      .limit(30),
    getPublishedPosts(),
  ]);

  const knownPaths = [
    '/',
    ...servicePages.map((p) => `/services/${p.slug}`),
    '/portfolio',
    ...portfolioItems.map((p) => `/portfolio/${p.slug}`),
    '/about',
    '/faq',
    ...posts.filter((p) => !p.noindex).map((p) => postPath(p.type, p.slug)),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="검색엔진"
        description="새 글을 올리면 네이버·Bing에 자동으로 알립니다. 여기서는 그 결과를 확인하고, 필요하면 직접 다시 제출할 수 있습니다."
      />
      <SeoConsole
        pings={(pings ?? []) as PingRow[]}
        knownPaths={knownPaths}
        keyFileUrl={`${SITE_URL}/${INDEXNOW_KEY}.txt`}
      />
    </div>
  );
}
