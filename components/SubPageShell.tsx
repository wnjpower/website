import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Banner, { BANNER_HEIGHT, bannerIsOn } from '@/components/Banner';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingCta from '@/components/FloatingCta';
import ScrollReveal from '@/components/ScrollReveal';
import QuoteSection from '@/components/sections/QuoteSection';
import { QuotePrefillProvider } from '@/components/QuotePrefill';
import { getSiteContent } from '@/lib/content/get';
import { resolveCtas } from '@/lib/cta/get';

/**
 * 서브페이지 공통 골격.
 *
 * 견적폼을 모든 서비스·사례 페이지 하단에 임베드한다 — B2B 리드는 콘텐츠를
 * 읽은 직후 전환율이 가장 높아서, 문의를 위해 홈으로 돌려보내지 않는다.
 *
 * 콘텐츠와 CTA는 여기서 한 번만 읽어 각 섹션에 내려준다. 섹션마다 DB를
 * 조회하면 같은 데이터를 여러 번 가져오게 된다.
 */
export default async function SubPageShell({
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
  const [content, ctas] = await Promise.all([getSiteContent(), resolveCtas()]);
  const bannerOn = bannerIsOn(content.banner);

  return (
    <QuotePrefillProvider
      initialCategory={initialCategory}
      initialCustomerType={initialCustomerType}
    >
      <Banner content={content.banner} />
      <main
        style={{ ['--banner-h' as string]: bannerOn ? BANNER_HEIGHT : '0px', paddingTop: bannerOn ? BANNER_HEIGHT : undefined }}
      >
        <ScrollReveal />
        <Header content={content.header} ctas={ctas} />
        {children}
        <QuoteSection source={quoteSource} content={content.quote} ctas={ctas} />
        <Contact content={content.contact} />
        <Footer content={content.footer} />
        <FloatingCta ctas={ctas} />
      </main>
    </QuotePrefillProvider>
  );
}
