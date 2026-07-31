import { Section, Container, SectionHeading } from '@/components/ui/section';
import type { SiteContent } from '@/lib/content/schema';

export default function Process({ content }: { content: SiteContent['process'] }) {
  return (
    <Section id="process" tone="white">
      <Container>
        <SectionHeading eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.steps.map((s) => (
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
