'use client';
import dynamic from 'next/dynamic';
import CallbackForm from './CallbackForm';
import { COMPANY } from '@/lib/site';
import { useQuotePrefill } from '@/components/QuotePrefill';
import { Container } from '@/components/ui/section';

const QuoteForm = dynamic(() => import('./QuoteForm'), { ssr: false });

interface Props {
  /** 유입 위치 구분 — 'main_form' | 'service_factory' 등. DB의 source 컬럼에 저장된다. */
  source?: string;
}

export default function QuoteSection({ source }: Props) {
  const { category: defaultCategory, customerType: defaultCustomerType } = useQuotePrefill();
  return (
    <section id="quote" className="py-20 sm:py-24 tech-dark">
      <Container size="narrow">
        <div className="max-w-2xl mx-auto">
          <div data-reveal className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                <span className="rule-accent" aria-hidden />
                무료 견적문의
              </span>
            </div>
            <h2 className="text-[1.75rem] sm:text-4xl font-bold text-white tracking-tight mb-3">
              현장에 맞는 정확한 견적을 드립니다
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              영업시간 내 접수는 당일, 그 외에는 다음 영업일 오전에 연락드립니다.
              <br className="hidden sm:block" />
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
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
