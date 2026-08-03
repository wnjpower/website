import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { PostList } from '@/components/PostViews';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '공지사항 | 우앤주전력',
  description: '우앤주전력의 휴무 안내, 서비스 변경 등 공지사항입니다.',
  alternates: { canonical: '/notice' },
};

export default async function NoticeIndexPage() {
  const posts = await getPublishedPosts('notice');

  return (
    <SubPageShell quoteSource="notice_index">
      <PageHero
        eyebrow="공지사항"
        title="공지사항"
        lead="휴무 일정과 서비스 변경 사항을 알려드립니다."
        crumbs={[{ label: '공지사항' }]}
      />

      <section>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)',
          }}
        >
          <PostList posts={posts} emptyMessage="현재 등록된 공지사항이 없습니다." />
        </div>
      </section>
    </SubPageShell>
  );
}
