import type { Metadata } from 'next';
import Banner, { BANNER_HEIGHT, bannerIsOn } from '@/components/Banner';
import ScrollReveal from '@/components/ScrollReveal';
import FaqSchema from '@/components/FaqSchema';
import {
  BlueprintHeader,
  BlueprintFooter,
  BlueprintMobileBar,
  BlueprintDesktopDock,
} from '@/components/redesign/Chrome';
import Hero from '@/components/redesign/home/Hero';
import QuickQuoteBar from '@/components/redesign/home/QuickQuoteBar';
import HomeFaq from '@/components/redesign/home/HomeFaq';
import QuoteBlock from '@/components/redesign/home/QuoteBlock';
import {
  Services,
  Process,
  PortfolioLedger,
  Credentials,
  Pricing,
  Contact,
} from '@/components/redesign/home/Sections';
import { getSiteContent } from '@/lib/content/get';
import { resolveCtas } from '@/lib/cta/get';
import { blueprintFontClass } from '@/lib/fonts';
import '@/components/redesign/blueprint.css';

/*
 * 홈 — 1b 블루프린트 원페이지
 * 디자인 원본: Claude Design `WNJ 홈페이지 (1b).dc.html`
 * 이관 스펙:   docs/실코드-이관-스펙.md §4 (9단계 중 3~5단계)
 *
 * 정보구조 — 방문자의 질문을 순서대로 하나씩 답한다.
 *   Hero        무엇을 하는 회사인가 (정의문 한 문장 + 조회 가능한 지표)
 *   QuickForm   지금 바로 접수하려면 (연락처만)
 *   01 사업영역  구체적으로 어떤 공사를 하나
 *   02 진행 절차 어떻게 진행되나
 *   03 시공 실적 해본 적 있나 (공사 원장)
 *   04 자격      믿을 수 있나 (공공기관 조회)
 *   05 비용 기준 얼마인가 → 무엇이 금액을 정하는가
 *   06 FAQ      남은 질문
 *   07 견적폼    전환
 *   오시는 길
 *
 * 문구는 모두 어드민(홈페이지 편집)에서 나온다. 발행 즉시 반영된다.
 */

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
    <div
      className={`blueprint-theme ${blueprintFontClass}`}
      style={{
        ['--banner-h' as string]: bannerOn ? BANNER_HEIGHT : '0px',
        paddingTop: bannerOn ? BANNER_HEIGHT : undefined,
      }}
    >
      {/* 배너는 테마 안에 둔다 — 액센트 토큰이 .blueprint-theme 아래 정의돼 있다.
          fixed라서 어디에 두든 화면 최상단에 그려지는 것은 같다. */}
      <Banner content={content.banner} />

      {/*
        노출형 FAQ에 FAQPage 스키마를 함께 낸다 — 스펙 §7-1.
        답변이 화면에 그대로 있고 스키마가 같은 내용을 가리키므로
        AI 검색·구글 스니펫이 인용할 근거가 된다.
      */}
      <FaqSchema items={content.faq.items} />

      <ScrollReveal />
      <BlueprintHeader content={content.header} ctaHref="#quote" />

      <main>
        <Hero content={content.hero} ctas={ctas} />
        <QuickQuoteBar content={content.quickForm} />
        <Services content={content.services} />
        <Process content={content.process} />
        <PortfolioLedger />
        <Credentials content={content.whyus} />
        <Pricing content={content.pricing} />
        <HomeFaq content={content.faq} />
        <QuoteBlock content={content.quote} ctas={ctas} source="main_form" />
        <Contact content={content.contact} />
      </main>

      <BlueprintFooter />
      <BlueprintDesktopDock quoteHref="#quote" />
      <BlueprintMobileBar quoteHref="#quote" ctaSlot="floating_quote" />
    </div>
  );
}
