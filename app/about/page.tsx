import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import About from '@/components/sections/About';
import Credentials from '@/components/sections/Credentials';
import Process from '@/components/sections/Process';
import { Section, Container, SectionHeading } from '@/components/ui/section';
import { COMPANY } from '@/lib/site';

export const metadata: Metadata = {
  title: '회사소개 | 대구 전기공사업 등록 법인 | 우앤주전력',
  description:
    '주식회사 우앤주전력 회사소개. 전기공사업 등록 대구-01425, 대구·경북 공장·산업 전기공사 전문 법인. 자격은 공공기관에서 직접 조회하실 수 있습니다.',
  keywords: [
    '우앤주전력',
    '대구 전기공사업 면허 업체',
    '대구 전기공사 법인',
    '전기공사업 등록업체',
    '대구 서구 전기공사',
  ],
  alternates: { canonical: '/about' },
};

const companyFacts: { label: string; value: string; mono?: boolean }[] = [
  { label: '법인명', value: COMPANY.name },
  { label: '대표자', value: COMPANY.ceo },
  { label: '전기공사업 등록', value: COMPANY.license, mono: true },
  { label: '사업자등록번호', value: COMPANY.bizNumber, mono: true },
  { label: '법인등록번호', value: COMPANY.corpNumber, mono: true },
  { label: '설립일', value: '2023년 3월 17일' },
  { label: '소재지', value: COMPANY.address.full },
  { label: '시공 지역', value: '대구광역시 전 지역 · 경상북도' },
];

export default function AboutPage() {
  return (
    <SubPageShell quoteSource="about">
      <PageHero
        eyebrow="회사소개"
        title="공장·산업 전기공사 전문 법인"
        lead="우앤주전력은 대구·경북 지역의 공장·산업시설 전기공사를 주력으로, 수전설비·계약전력 증설과 배전반 자체 제작까지 직접 시공하는 전기공사업 등록 법인입니다."
        crumbs={[{ label: '회사소개' }]}
      />

      {/* 사업자 정보 */}
      <Section tone="white">
        <Container size="narrow">
          <SectionHeading align="left" eyebrow="사업자 정보" title="법인 개요" className="mb-8" />
          <dl
            data-reveal
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden"
          >
            {companyFacts.map((fact) => (
              <div key={fact.label} className="bg-white px-5 py-4">
                <dt className="text-sm text-slate-400 font-medium mb-1">{fact.label}</dt>
                <dd
                  className={`text-[0.9375rem] font-semibold text-ink break-keep ${
                    fact.mono ? 'font-mono tabular-nums' : ''
                  }`}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <About />
      <Credentials />
      <Process />
    </SubPageShell>
  );
}
