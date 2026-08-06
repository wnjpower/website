import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import Ledger from '@/components/redesign/portfolio/Ledger';
import { PostList } from '@/components/PostViews';
import { SectionHead } from '@/components/redesign/Chrome';
import { portfolioItems } from '@/content/portfolio';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '시공 실적 | 대구·경북 공장 전기공사 실적 | 우앤주전력',
  description:
    '대구·경북 공장 전기공사·수전설비·배전반 제작·인테리어 전기 시공 실적. 지역별 공종별 실적을 확인하세요.',
  keywords: ['대구 전기공사 시공사례', '공장 전기공사 실적', '배전반 제작 사례', '경북 전기공사'],
  alternates: { canonical: '/portfolio' },
};

/**
 * 시공 실적 — 1b 블루프린트 원장
 * 디자인 원본: Claude Design `WNJ 시공실적 (1b).dc.html`
 *
 * 실적은 두 곳에서 온다.
 *  - content/portfolio.ts : 공종별 원장(구조화된 필드가 많아 파일로 관리)
 *  - 게시판(posts, type=portfolio) : 사장님이 어드민에서 사진과 함께 올리는 현장
 * 원장을 주 목록으로 두고, 사진이 있는 현장은 그 아래 별도 블록으로 잇는다.
 */
export default async function PortfolioIndexPage() {
  const posts = await getPublishedPosts('portfolio');

  return (
    <SubPageShell quoteSource="portfolio_index">
      <PageHero
        eyebrow="시공 실적"
        title="시공 실적 원장"
        lead="실제 진행한 공사 내역입니다. 행을 선택하면 오른쪽에 상세가 열립니다. 계약전력·공기 등 현장 수치는 발주처 확인 후 순차 기재하며, 추정치는 쓰지 않습니다."
        crumbs={[{ label: '시공 실적' }]}
      />

      <section>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: 'clamp(28px,4vw,48px) clamp(16px,4vw,48px)',
          }}
        >
          <Ledger items={portfolioItems} />
        </div>
      </section>

      {posts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-divider)' }}>
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)',
            }}
          >
            <SectionHead kicker="PHOTOS" no="＋" title="현장 사진" note="최근 진행한 현장" />
            <PostList posts={posts} emptyMessage="" />
          </div>
        </section>
      )}
    </SubPageShell>
  );
}
