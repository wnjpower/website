'use client';
import dynamic from 'next/dynamic';
import CallbackForm from './CallbackForm';
import { COMPANY } from '@/lib/site';

const QuoteForm = dynamic(() => import('./QuoteForm'), { ssr: false });

interface Props {
  defaultCategory?: string;
  defaultCustomerType?: string;
}

export default function QuoteSection({ defaultCategory, defaultCustomerType }: Props) {
  return (
    <section
      id="quote"
      className="py-20 bg-[#0B1220] bg-photo bg-photo-dark"
      style={{ ['--bg-photo-url' as string]: "url('/images/switchgear.jpg')" }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            무료 견적문의
          </h2>
          {/* 응답 속도를 구체적으로 약속한다 — 발주 담당자에게는 곧 역량 신호다 */}
          <p className="text-lg text-slate-400">
            영업시간 내 접수는 당일, 그 외에는 다음 영업일 오전에 연락드립니다.
            <br className="hidden sm:block" />
            {' '}바로 통화를 원하시면{' '}
            <a
              href={`tel:${COMPANY.mobile}`}
              className="text-[#FF5500] font-semibold hover:underline font-mono tabular-nums"
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

        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-2xl">
          <QuoteForm defaultCategory={defaultCategory} defaultCustomerType={defaultCustomerType} />
        </div>
      </div>
    </section>
  );
}
