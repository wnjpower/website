import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingCta from '@/components/FloatingCta';
import ScrollReveal from '@/components/ScrollReveal';
import QuoteSection from '@/components/sections/QuoteSection';
import { QuotePrefillProvider } from '@/components/QuotePrefill';

/**
 * 서브페이지 공통 골격.
 *
 * 견적폼을 모든 서비스·사례 페이지 하단에 임베드한다 — B2B 리드는 콘텐츠를
 * 읽은 직후 전환율이 가장 높아서, 문의를 위해 홈으로 돌려보내지 않는다.
 */
export default function SubPageShell({
  children,
  quoteSource,
  initialCategory,
  initialCustomerType,
}: {
  children: ReactNode;
  quoteSource?: string;
  initialCategory?: string;
  initialCustomerType?: string;
}) {
  return (
    <QuotePrefillProvider
      initialCategory={initialCategory}
      initialCustomerType={initialCustomerType}
    >
      <main>
        <ScrollReveal />
        <Header />
        {children}
        <QuoteSection source={quoteSource} />
        <Contact />
        <Footer />
        <FloatingCta />
      </main>
    </QuotePrefillProvider>
  );
}
