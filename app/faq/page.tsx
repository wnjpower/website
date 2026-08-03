import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import HomeFaq from '@/components/redesign/home/HomeFaq';
import FaqSchema from '@/components/FaqSchema';
import { getSiteContent } from '@/lib/content/get';

export const metadata: Metadata = {
  title: '자주 묻는 질문 | 전기공사 비용·절차 안내 | 우앤주전력',
  description:
    '전기공사 견적·비용·시공 지역·A/S 보증부터 공장 증설, 계약전력, 분전함 교체까지 자주 묻는 질문을 모았습니다.',
  keywords: [
    '전기공사 비용',
    '전기공사 견적',
    '계약전력 증설 비용',
    '분전함 교체 비용',
    '전기공사 A/S',
    '대구 전기공사 문의',
  ],
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const content = await getSiteContent();
  return (
    <SubPageShell quoteSource="faq">
      <PageHero
        eyebrow="FAQ"
        title="자주 묻는 질문"
        lead="견적·비용·시공 지역·사후관리부터 공장 증설, 계약전력, 인테리어 전기까지 자주 받는 질문을 정리했습니다. 원하는 답을 찾지 못하셨다면 전화나 견적문의로 알려 주세요."
        crumbs={[{ label: '자주 묻는 질문' }]}
      />

      {/*
        FAQPage 구조화 데이터의 정본 페이지.
        홈과 같은 노출형 FAQ를 쓴다 — 아코디언을 접어두면 AI 검색·스니펫 인용에
        불리하고, 이 페이지는 애초에 답을 읽으러 오는 페이지다(P8).
      */}
      <FaqSchema items={content.faq.items} />
      <HomeFaq content={content.faq} />
    </SubPageShell>
  );
}
