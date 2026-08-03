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
 * 콘텐츠와 CTA는 여기서 한 번만 읽어 내려준다. 섹션마다 조회하면 같은 데이터를
 * 여러 번 가져오게 된다.
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
    <>
      <Banner content={content.banner} />
      <div
        className={`blueprint-theme ${blueprintFontClass}`}
        style={{
          ['--banner-h' as string]: bannerOn ? BANNER_HEIGHT : '0px',
          paddingTop: bannerOn ? BANNER_HEIGHT : undefined,
        }}
      >
        <ScrollReveal />
        <BlueprintHeader content={content.header} ctaHref="#quote" />

        <main>
          {children}
          <QuoteBlock
            content={content.quote}
            ctas={ctas}
            source={quoteSource}
            initialCategory={initialCategory}
            initialCustomerType={initialCustomerType}
          />
          <Contact content={content.contact} />
        </main>

        <BlueprintFooter />
        <BlueprintDesktopDock quoteHref="#quote" />
        <BlueprintMobileBar quoteHref="#quote" ctaSlot="floating_quote" />
      </div>
    </>
  );
}
