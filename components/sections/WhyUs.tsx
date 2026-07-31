import { ShieldCheck, ExternalLink, Stamp, Landmark } from 'lucide-react';
import { COMPANY, VERIFY_LINKS } from '@/lib/site';
import { Section, Container, SectionHeading } from '@/components/ui/section';
import { Icon } from '@/components/ui/icon';
import type { SiteContent } from '@/lib/content/schema';

/* 왜 우앤주전력인가 + 검증 가능한 자격.
   방문자의 "믿을 수 있나?"라는 단일 질문을 이 한 섹션에서 답한다.

   자격 블록의 번호(면허·사업자·법인)는 lib/site.ts의 사업자 정보를 그대로 쓴다.
   어드민에서 편집하지 않는다 — 공적 등록번호는 마케팅 문구가 아니라 사실이고,
   실수로 바뀌면 조회가 어긋나 신뢰가 무너지기 때문이다. */

export default function WhyUs({ content }: { content: SiteContent['whyus'] }) {
  const credentials = [
    {
      icon: ShieldCheck,
      title: '전기공사업 등록',
      number: COMPANY.license,
      note: '전기공사협회 종합정보시스템에서 업체·실적 조회',
      verify: { label: '전기공사협회 조회', href: VERIFY_LINKS.keca },
    },
    {
      icon: Stamp,
      title: '사업자 등록',
      number: COMPANY.bizNumber,
      note: '국세청 홈택스에서 사업자 상태·진위 확인',
      verify: { label: '홈택스 조회', href: VERIFY_LINKS.hometax },
    },
    {
      icon: Landmark,
      title: '법인 등록',
      number: COMPANY.corpNumber,
      note: content.corpNote,
      verify: null,
    },
  ];

  return (
    <Section id="why-us" tone="dark">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
        />

        {/* 차별점 */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {content.reasons.map((r) => (
            <div key={r.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Icon name={r.icon} className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">{r.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* 검증 가능한 자격 */}
        <div data-reveal className="rounded-xl border border-white/10 bg-brand-950/40 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 mb-6 flex items-center gap-2.5">
            <span className="rule-accent" aria-hidden />
            {content.verifyTitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {credentials.map((c) => {
              const CredIcon = c.icon;
              return (
                <div key={c.title} className="flex flex-col">
                  <div className="flex items-center gap-2.5 mb-2">
                    <CredIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <h4 className="text-[0.9375rem] font-bold text-white">{c.title}</h4>
                  </div>
                  <p className="font-mono tabular-nums text-lg text-white tracking-wide mb-1.5">{c.number}</p>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{c.note}</p>
                  {c.verify && (
                    <a
                      href={c.verify.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-white rounded-lg border border-white/20 px-3.5 py-2 hover:border-white/45 hover:bg-white/5 transition-colors"
                    >
                      {c.verify.label}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
