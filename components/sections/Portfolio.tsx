import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { portfolioItems } from '@/content/portfolio';
import { COMPANY } from '@/lib/site';
import { Section, Container, SectionHeading } from '@/components/ui/section';
import { CtaRow } from '@/components/ui/cta';

/*
 * 시공 실적 — 실사진 확보 전까지는 "샘플 사진"이 아니라 실적 원장(텍스트 트랙레코드)으로
 * 제시한다. 가짜로 보이는 자리표시 사진 대신, 실제 공사 실적을 문서처럼 정직하게 나열하는
 * 편이 발주처 신뢰에 훨씬 유리하다. 현장 사진을 확보하면 이 섹션을 사진 카드로 교체하면 된다.
 */
export default function Portfolio() {
  return (
    <Section id="portfolio" tone="muted">
      <Container size="narrow">
        <SectionHeading
          eyebrow="시공 실적"
          title="대구·경북 주요 시공 실적"
          lead="공장 전기공사·수전 증설·배전반 제작·인테리어 전기 등 실제 진행한 공사 내역입니다. 현장 사진은 순차 공개 예정입니다."
        />

        <div data-reveal className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between bg-brand px-5 sm:px-6 py-3.5">
            <span className="text-white font-bold text-[0.9375rem] tracking-tight">시공 실적표</span>
            <span className="text-slate-300 text-sm font-mono hidden sm:block">{COMPANY.name}</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {portfolioItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="group flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-brand-tint/50 transition-colors"
                >
                  <span className="hidden sm:inline-flex flex-shrink-0 w-24 justify-center text-xs font-semibold px-2 py-1 rounded bg-brand-tint text-brand-700">
                    {item.categoryLabel}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-ink text-[0.9375rem] group-hover:text-brand transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="block text-sm text-slate-500 truncate">
                      <span className="sm:hidden font-semibold text-brand-700">{item.categoryLabel} · </span>
                      {item.facility} · {item.location}
                    </span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="mt-6 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-brand hover:gap-2.5 transition-all"
          >
            전체 시공 실적 자세히 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 섹션 맥락 CTA */}
        <div data-reveal className="mt-12 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 text-center">
          <p className="text-lg font-bold text-ink mb-1">비슷한 공사를 계획 중이신가요?</p>
          <p className="text-slate-500 mb-6">현장 방문 견적은 출장비 없이 무료입니다.</p>
          <CtaRow tone="light" size="md" className="justify-center" />
        </div>
      </Container>
    </Section>
  );
}
