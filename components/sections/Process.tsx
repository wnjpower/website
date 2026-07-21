import { Section, Container, SectionHeading } from '@/components/ui/section';

const steps = [
  {
    step: '01',
    title: '문의 접수',
    duration: '즉시 ~ 1영업일',
    description: '전화·견적폼 중 편한 방법으로 문의 주세요. 접수 후 담당자가 확인해 연락드립니다.',
  },
  {
    step: '02',
    title: '현장 실사·견적',
    duration: '요청일 협의',
    description: '전문가가 직접 현장을 방문해 정확한 견적을 무료로 드립니다. 출장비는 없습니다.',
  },
  {
    step: '03',
    title: '시공',
    duration: '규모별 1일 ~ 2주',
    description: '면허 보유 인력이 안전하고 깔끔하게 시공합니다. 일정은 견적 시 확정됩니다.',
  },
  {
    step: '04',
    title: '사후관리·A/S',
    duration: '준공 후 1년 보증',
    description: '대구·경북 당일 출동 원칙으로 준공 이후까지 책임지고 관리합니다.',
  },
];

export default function Process() {
  return (
    <Section id="process" tone="white">
      <Container>
        <SectionHeading
          eyebrow="진행 절차"
          title="문의부터 사후관리까지, 4단계"
          lead="각 단계에 걸리는 기간을 미리 알려드립니다."
        />

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:border-brand/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-lg bg-brand text-white font-bold tabular-nums flex items-center justify-center text-[0.9375rem]">
                  {s.step}
                </span>
                <span className="text-sm font-semibold text-brand-700 bg-brand-tint rounded-md px-2.5 py-1">
                  {s.duration}
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink tracking-tight mb-2">{s.title}</h3>
              <p className="text-[0.9375rem] text-slate-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
