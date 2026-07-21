import { Layers, CircuitBoard, ShieldCheck, Wrench, ExternalLink, Stamp, Landmark } from 'lucide-react';
import { COMPANY, VERIFY_LINKS } from '@/lib/site';
import { Section, Container, SectionHeading } from '@/components/ui/section';

/* 왜 우앤주전력인가 + 검증 가능한 자격.
   이전에는 WhyUs·Credentials·About 세 섹션이 "믿을 이유"를 나눠 담아 중복됐다.
   방문자의 "믿을 수 있나?"라는 단일 질문을 한 섹션에서 답하도록 통합한다. */

const reasons = [
  {
    icon: Layers,
    title: '원스톱 직접 시공',
    desc: '공장 신축·증축·증설부터 수전설비·계약전력 증설·동력설비까지, 협력업체 조율 없이 한 법인이 설계 검토부터 준공까지 담당합니다.',
  },
  {
    icon: CircuitBoard,
    title: '배전반·분전반 자체 제작',
    desc: '외주 없이 직접 제작해 중간 마진이 없습니다. 현장 규격·회로 수에 맞춘 배전반을 합리적인 비용에 공급하고 납기도 빠릅니다.',
  },
  {
    icon: ShieldCheck,
    title: '검증 가능한 면허 법인',
    desc: '전기공사업 등록 법인입니다. 등록번호·사업자번호로 공공기관에서 실체와 실적을 직접 조회하실 수 있습니다.',
  },
  {
    icon: Wrench,
    title: '신속한 A/S',
    desc: '대구·경북 지역 전담으로 문제 발생 시 당일 출동을 원칙으로 합니다. 준공 후 1년간 사후관리를 책임집니다.',
  },
];

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
    note: '대표 현장경력 20년+ · 2023년 법인 설립',
    verify: null,
  },
];

export default function WhyUs() {
  return (
    <Section id="why-us" tone="dark">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="왜 우앤주전력인가"
          title="면허·자체제작·원스톱, 그리고 직접 확인 가능한 자격"
          lead="말이 아니라 조회로 검증되는 전기공사 법인입니다."
        />

        {/* 차별점 */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight mb-2">{r.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>

        {/* 검증 가능한 자격 */}
        <div data-reveal className="rounded-xl border border-white/10 bg-brand-950/40 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 mb-6 flex items-center gap-2.5">
            <span className="rule-accent" aria-hidden />
            공적 자격, 직접 확인하세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {credentials.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="flex flex-col">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
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
