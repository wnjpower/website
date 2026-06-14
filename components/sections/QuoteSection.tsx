'use client';
import dynamic from 'next/dynamic';

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
        <div data-reveal className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            무료 견적문의
          </h2>
          <p className="text-lg text-slate-400">
            아래 양식을 작성해 주시면 1영업일 내에 연락드립니다.
            <br className="hidden sm:block" />
            {' '}빠른 상담을 원하시면{' '}
            <a href="tel:010-8552-9994" className="text-[#FFB800] font-semibold hover:underline">
              010-8552-9994
            </a>
            로 전화 주세요.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-2xl">
          <QuoteForm defaultCategory={defaultCategory} defaultCustomerType={defaultCustomerType} />
        </div>
      </div>
    </section>
  );
}
