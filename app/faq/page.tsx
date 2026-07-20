import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import Faq from '@/components/sections/Faq';

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

export default function FaqPage() {
  return (
    <SubPageShell quoteSource="faq">
      <PageHero
        eyebrow="FAQ"
        title="자주 묻는 질문"
        lead="견적·비용·시공 지역·사후관리부터 공장 증설, 계약전력, 인테리어 전기까지 자주 받는 질문을 정리했습니다. 원하는 답을 찾지 못하셨다면 전화나 견적문의로 알려 주세요."
        crumbs={[{ label: '자주 묻는 질문' }]}
        bgImage="/images/switchgear.jpg"
      />

      {/* FAQPage 구조화 데이터의 정본 페이지 */}
      <Faq withSchema />
    </SubPageShell>
  );
}
