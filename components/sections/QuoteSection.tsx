'use client';
import dynamic from 'next/dynamic';
import CallbackForm from './CallbackForm';
import { COMPANY } from '@/lib/site';
import { useQuotePrefill } from '@/components/QuotePrefill';
import { Container } from '@/components/ui/section';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

const QuoteForm = dynamic(() => import('./QuoteForm'), { ssr: false });

interface Props {
  /** 유입 위치 구분 — 'main_form' | 'service_factory' 등. DB의 source 컬럼에 저장된다. */
  source?: string;
  content: SiteContent['quote'];
  ctas: Record<CtaSlot, Cta>;
}

export default function QuoteSection({ source, content, ctas }: Props) {
  const { category: defaultCategory, customerType: defaultCustomerType } = useQuotePrefill();
  const submitCta = ctas.quote_submit;

  return (
    <section id="quote" className="py-20 sm:py-24 tech-dark">
      <Container size="narrow">
        <div className="max-w-2xl mx-auto">
          <div data-reveal className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                <span className="rule-accent" aria-hidden />
                {content.eyebrow}
              </span>
            </div>
            <h2 className="text-[1.75rem] sm:text-4xl font-bold text-white tracking-tight mb-3 break-keep">
              {content.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed break-keep">
              {content.lead}
              {' '}바로 통화를 원하시면{' '}
              <a
                href={`tel:${COMPANY.mobile}`}
                className="text-white font-semibold underline decoration-slate-500 underline-offset-4 hover:decoration-white font-mono tabular-nums"
              >
                {COMPANY.mobile}
              </a>
              로 전화 주세요.
            </p>
          </div>

          {/* 폼 작성이 부담스러운 이탈층 회수 경로 */}
          <div data-reveal className="mb-6">
            <CallbackForm />
          </div>

          <div data-reveal className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30">
            <QuoteForm
              defaultCategory={defaultCategory}
              defaultCustomerType={defaultCustomerType}
              source={source}
              submitLabel={submitCta.label}
              privacyNote={content.privacyNote}
              successTitle={content.successTitle}
              successBody={content.successBody}
              submitCta={{ id: submitCta.id, slot: submitCta.slot, variant: submitCta.variant }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
