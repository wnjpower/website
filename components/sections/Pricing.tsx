import { Section, Container, SectionHeading } from '@/components/ui/section';
import { CtaButton } from '@/components/ui/cta';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

export default function Pricing({
  content,
  ctas,
}: {
  content: SiteContent['pricing'];
  ctas: Record<CtaSlot, Cta>;
}) {
  return (
    <Section id="pricing" tone="white">
      <Container size="narrow">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <div data-reveal className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="bg-brand px-5 sm:px-6 py-3.5 flex items-center justify-between">
            <span className="text-white font-bold text-[0.9375rem] tracking-tight">{content.tableTitle}</span>
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
                {content.items.map((item, i) => (
                  <tr key={`${item.work}-${i}`} className="hover:bg-slate-50/70 transition-colors">
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

        {content.footnote && (
          <p className="text-sm text-slate-400 text-center mt-4">{content.footnote}</p>
        )}

        <div className="text-center mt-8">
          <CtaButton cta={ctas.pricing_cta} size="lg" />
        </div>
      </Container>
    </Section>
  );
}
