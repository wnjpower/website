'use client';
import Link from 'next/link';
import { Factory, CircuitBoard, Lamp, Check, ArrowRight } from 'lucide-react';
import { services } from '@/content/services';
import { useQuotePrefill } from '@/components/QuotePrefill';
import { Section, Container, SectionHeading } from '@/components/ui/section';

const iconMap = { Factory, CircuitBoard, Lamp } as const;
type IconKey = keyof typeof iconMap;

export default function Services() {
  const { selectCategory } = useQuotePrefill();
  return (
    <Section id="services" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="사업영역"
          title="3대 전문 분야"
          lead="공장·산업 전기공사를 주력으로, 인테리어 전기와 배전반 설계·설치까지 직접 시공합니다. 계약전력 증설·수전설비는 공장 전기공사와 함께 진행합니다."
        />

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => {
            const Icon = iconMap[svc.icon as IconKey];
            const isPrimary = svc.tier === 'primary';
            return (
              <div
                key={svc.id}
                className="group relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col transition-all duration-200 hover:border-brand/30 hover:shadow-lg hover:shadow-slate-200/70"
              >
                {isPrimary && (
                  <span className="absolute top-6 right-6 text-[0.625rem] font-bold px-2 py-0.5 rounded bg-brand text-white tracking-wide">
                    주력
                  </span>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-lg bg-brand-tint flex items-center justify-center transition-colors group-hover:bg-brand">
                    <Icon className="w-6 h-6 text-brand transition-colors group-hover:text-white" />
                  </div>
                  <span className="text-2xl font-bold text-slate-200 tabular-nums tracking-tight">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-ink tracking-tight mb-1.5">{svc.title}</h3>
                <p className="text-[0.9375rem] text-slate-600 leading-relaxed mb-4">{svc.detail}</p>

                <ul className="space-y-2 flex-1 mb-5">
                  {svc.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {svc.audiences.map((a) => (
                    <span key={a} className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-tint text-brand-700">
                      {a}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href={`/services/${svc.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:gap-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  >
                    시공 범위·절차 보기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => selectCategory(svc.id)}
                    className="text-sm text-slate-500 font-semibold hover:text-brand text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  >
                    이 항목으로 문의하기 →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
