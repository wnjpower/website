import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { PostList } from '@/components/PostViews';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '전기공사 정보 | 비용·절차·제도 안내 | 우앤주전력',
  description:
    '공장 전기공사 비용, 계약전력 증설 절차, 배전반 교체 시기 등 현장에서 자주 받는 질문을 정리했습니다. 대구·경북 전기공사업 등록 법인이 직접 씁니다.',
  keywords: ['전기공사 비용', '계약전력 증설 절차', '공장 전기공사 정보', '배전반 교체', '대구 전기공사'],
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts('blog');

  return (
    <SubPageShell quoteSource="blog_index">
      <PageHero
        eyebrow="전기공사 정보"
        title="현장에서 자주 받는 질문들"
        lead="비용은 무엇으로 결정되는지, 계약전력 증설은 어떤 순서로 진행되는지 — 견적을 받기 전에 알아두면 좋은 내용을 정리했습니다."
        crumbs={[{ label: '전기공사 정보' }]}
      />

      <section>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)',
          }}
        >
          <PostList
            posts={posts}
            emptyMessage="아직 등록된 글이 없습니다. 곧 전기공사 비용·절차에 대한 안내를 올릴 예정입니다."
          />
        </div>
      </section>
    </SubPageShell>
  );
}
