import type { Metadata } from 'next';
import Header from '@/components/Header';
import Banner, { BANNER_HEIGHT, bannerIsOn } from '@/components/Banner';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import WhyUs from '@/components/sections/WhyUs';
import Process from '@/components/sections/Process';
import Portfolio from '@/components/sections/Portfolio';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import QuoteSection from '@/components/sections/QuoteSection';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingCta from '@/components/FloatingCta';
import ScrollReveal from '@/components/ScrollReveal';
import { QuotePrefillProvider } from '@/components/QuotePrefill';
import { getSiteContent } from '@/lib/content/get';
import { resolveCtas } from '@/lib/cta/get';

/*
 * 원페이지 정보구조 — 방문자의 질문 하나씩만 담당하도록 정리했다.
 *   Hero        무엇을 하는 회사인가 / 어떻게 연락하나
 *   Services    구체적으로 어떤 공사를 하나
 *   WhyUs       믿을 수 있나 (차별점 + 조회 가능한 자격)
 *   Process     어떻게 진행되나
 *   Portfolio   해본 적 있나 (실적 원장)
 *   Pricing     얼마인가
 *   Faq         자주 묻는 것들
 *   Quote       문의하기 (전환)
 *   Contact     찾아가기·연락
 *
 * 모든 문구는 어드민(/admin/content)에서 편집되며 발행 즉시 반영된다.
 */

/** 홈 메타데이터도 어드민에서 편집한다 (검색 결과에 그대로 노출되는 제목·설명). */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent();
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: { title: seo.title, description: seo.description },
    twitter: { title: seo.title, description: seo.description },
    alternates: { canonical: '/' },
  };
}

export default async function Home() {
  const [content, ctas] = await Promise.all([getSiteContent(), resolveCtas()]);
  const bannerOn = bannerIsOn(content.banner);

  return (
    <QuotePrefillProvider>
      <Banner content={content.banner} />
      <main
        style={{ ['--banner-h' as string]: bannerOn ? BANNER_HEIGHT : '0px', paddingTop: bannerOn ? BANNER_HEIGHT : undefined }}
      >
        <ScrollReveal />
        <Header content={content.header} ctas={ctas} />
        <Hero content={content.hero} ctas={ctas} />
        <Services content={content.services} />
        <WhyUs content={content.whyus} />
        <Process content={content.process} />
        <Portfolio />
        <Pricing content={content.pricing} ctas={ctas} />
        <Faq content={content.faq} />
        <QuoteSection source="main_form" content={content.quote} ctas={ctas} />
        <Contact content={content.contact} />
        <Footer content={content.footer} />
        <FloatingCta ctas={ctas} />
      </main>
    </QuotePrefillProvider>
  );
}
