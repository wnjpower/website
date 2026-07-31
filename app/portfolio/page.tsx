import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { portfolioItems } from '@/content/portfolio';
import { PostList } from '@/components/PostViews';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '시공 실적 | 대구·경북 공장 전기공사 실적 | 우앤주전력',
  description:
    '대구·경북 공장 전기공사·수전설비·배전반 제작·인테리어 전기 시공 실적. 지역별 공종별 실적을 확인하세요.',
  keywords: ['대구 전기공사 시공사례', '공장 전기공사 실적', '배전반 제작 사례', '경북 전기공사'],
  alternates: { canonical: '/portfolio' },
};

/**
 * 시공 실적은 두 곳에서 온다.
 *  - content/portfolio.ts : 공종별 실적 원장(기존). 구조화된 필드가 많아 파일로 관리한다.
 *  - 게시판(posts, type=portfolio) : 사장님이 어드민에서 사진과 함께 직접 올리는 현장.
 * 둘을 한 화면에 이어 붙여, 새 현장을 올리는 데 개발자가 필요 없게 한다.
 */
export default async function PortfolioIndexPage() {
  const posts = await getPublishedPosts('portfolio');

  return (
    <SubPageShell quoteSource="portfolio_index">
      <PageHero
        eyebrow="시공 실적"
        title="대구·경북 시공 실적"
        lead="공장 전기공사, 수전설비·계약전력 증설, 배전반 제작, 인테리어 전기 등 실제 진행한 공사 내역입니다. 현장 사진은 순차 공개 예정입니다."
        crumbs={[{ label: '시공 실적' }]}
      />

      {posts.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-2">현장 사진</h2>
            <p className="text-slate-600 mb-8 break-keep">최근 진행한 현장입니다.</p>
            <PostList posts={posts} emptyMessage="" />
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          {posts.length > 0 && (
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-8">공종별 시공 실적</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 hover:border-brand/30 hover:shadow-lg hover:shadow-slate-200/70 transition-all flex flex-col"
              >
                <span className="self-start text-xs font-semibold px-2.5 py-0.5 rounded bg-brand-tint text-brand-700">
                  {item.categoryLabel}
                </span>
                <h2 className="font-bold text-ink mt-3 mb-1 text-lg leading-snug group-hover:text-brand transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-400 mb-3">
                  {item.location} · {item.facility}
                </p>
                <p className="text-[0.9375rem] text-slate-600 leading-relaxed flex-1">{item.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand group-hover:gap-2.5 transition-all">
                  시공 내용 보기
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SubPageShell>
  );
}
