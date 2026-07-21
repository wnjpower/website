import { Section, Container, SectionHeading } from '@/components/ui/section';
import { QuoteButton } from '@/components/ui/cta';

// 가격 금액은 사장님 확정 후 priceLabel에 기입 (예: '5만원~'). 확정 전에는 '무료 견적' 표기.
const priceItems = [
  { work: '공장 신축·증축 옥내외 전기공사',        audience: '공장·산업시설', priceLabel: '현장 협의 후 견적' },
  { work: '계약전력 증설·수전설비 공사',           audience: '공장·상업건물', priceLabel: '용량 산정 후 견적' },
  { work: '동력설비(생산기계 전원) 배선·결선',     audience: '공장·산업시설', priceLabel: '현장 협의 후 견적' },
  { work: '산업용·상업용 배전반 자체 제작',        audience: '공장·상업건물', priceLabel: '규격 협의 후 견적' },
  { work: '분전함(두꺼비집) 자체 제작·교체',       audience: '주택·상가',     priceLabel: '무료 견적으로 확인' },
  { work: '상가·병원 인테리어 전기 (33㎡ 기준)',    audience: '상가·병원',     priceLabel: '무료 견적으로 확인' },
  { work: '콘센트 추가·이동 / 조명 교체 (1개소)',  audience: '주택·아파트',   priceLabel: '무료 견적으로 확인' },
];

export default function Pricing() {
  return (
    <Section id="pricing" tone="white">
      <Container size="narrow">
        <SectionHeading
          eyebrow="비용 안내"
          title="비용이 궁금하신가요?"
          lead="대표적인 작업 항목입니다. 현장 여건에 따라 달라지므로 정확한 금액은 무료 현장 견적으로 확인하세요."
        />

        <div data-reveal className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="bg-brand px-5 sm:px-6 py-3.5 flex items-center justify-between">
            <span className="text-white font-bold text-[0.9375rem] tracking-tight">표준 작업 항목표</span>
            <span className="text-slate-300 text-sm font-mono hidden sm:block">주식회사 우앤주전력</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-[0.9375rem] min-w-[480px]">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-200">
                  <th className="px-4 py-3.5 font-bold text-ink w-10 text-center">No.</th>
                  <th className="px-4 py-3.5 font-bold text-ink">작업 항목</th>
                  <th className="px-4 py-3.5 font-bold text-ink hidden sm:table-cell">대상</th>
                  <th className="px-5 py-3.5 font-bold text-ink text-right">비용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priceItems.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-4 text-slate-400 text-center font-mono tabular-nums">{i + 1}</td>
                    <td className="px-4 py-4 text-ink font-medium">{item.work}</td>
                    <td className="px-4 py-4 text-slate-500 hidden sm:table-cell">{item.audience}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-brand font-semibold whitespace-nowrap">{item.priceLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-slate-400 text-center mt-4">
          * 자재 사양·현장 여건·공사 범위에 따라 비용이 달라질 수 있습니다. 견적을 위한 현장 방문은 출장비 없이 무료입니다.
        </p>

        <div className="text-center mt-8">
          <QuoteButton variant="navy" size="lg" label="무료 견적 받아보기" />
        </div>
      </Container>
    </Section>
  );
}
