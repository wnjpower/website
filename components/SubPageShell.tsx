import type { ReactNode } from 'react';
import Banner, { BANNER_HEIGHT, bannerIsOn } from '@/components/Banner';
import ScrollReveal from '@/components/ScrollReveal';
import {
  BlueprintHeader,
  BlueprintFooter,
  BlueprintMobileBar,
  BlueprintDesktopDock,
} from '@/components/redesign/Chrome';
import QuoteBlock from '@/components/redesign/home/QuoteBlock';
import { Contact } from '@/components/redesign/home/Sections';
import { getSiteContent } from '@/lib/content/get';
import { resolveCtas } from '@/lib/cta/get';
import { blueprintFontClass } from '@/lib/fonts';
import '@/components/redesign/blueprint.css';

/**
 * 서브페이지 공통 골격 — 1b 블루프린트.
 *
 * 헤더·푸터·견적폼·오시는 길·부동 CTA를 홈과 같은 컴포넌트로 통일한다.
 * 직전까지는 홈만 새 디자인이라 페이지를 옮길 때마다 헤더가 바뀌어 보였다.
 *
 * 견적폼은 모든 서브페이지 하단에 그대로 둔다 — B2B 리드는 내용을 읽은 직후
 * 전환율이 가장 높아서, 문의하려고 홈으로 돌려보내지 않는다. quoteSource로
 * 어느 페이지가 만든 리드인지 구분되고, initialCategory가 있으면 그 공종이
 * 미리 선택된 상태로 열린다.
 *
 * 예외는 hideQuote — 개인정보처리방침처럼 폼의 동의 문구가 가리키는 문서에는
 * 폼을 다시 놓지 않는다(순환이고, 법적 고지 페이지를 영업면으로 만들지 않는다).
 *
 * 콘텐츠와 CTA는 여기서 한 번만 읽어 내려준다. 섹션마다 조회하면 같은 데이터를
 * 여러 번 가져오게 된다.
 */
export default async function SubPageShell({
  children,
  quoteSource,
  initialCategory,
  initialCustomerType,
  hideQuote = false,
}: {
  children: ReactNode;
  quoteSource?: string;
  initialCategory?: string;
  initialCustomerType?: string;
  hideQuote?: boolean;
}) {
  const [content, ctas] = await Promise.all([getSiteContent(), resolveCtas()]);
  const bannerOn = bannerIsOn(content.banner);
  // 폼을 감춘 페이지에서는 #quote 앵커가 없으므로 홈의 폼으로 보낸다
  const quoteHref = hideQuote ? '/#quote' : '#quote';

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

      <ScrollReveal />
      <BlueprintHeader content={content.header} ctaHref={quoteHref} />

      <main>
        {children}
        {!hideQuote && (
          <QuoteBlock
            content={content.quote}
            ctas={ctas}
            source={quoteSource}
            initialCategory={initialCategory}
            initialCustomerType={initialCustomerType}
          />
        )}
        <Contact content={content.contact} />
      </main>

      <BlueprintFooter />
      <BlueprintDesktopDock quoteHref={quoteHref} />
      <BlueprintMobileBar quoteHref={quoteHref} ctaSlot="floating_quote" />
    </div>
  );
}
