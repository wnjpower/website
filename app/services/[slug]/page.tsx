import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Phone } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import { SectionHead } from '@/components/redesign/Chrome';
import { servicePages, getServicePage } from '@/content/service-pages';
import { COMPANY, SITE_URL } from '@/lib/site';

/*
 * 서비스 상세 — 1b 블루프린트
 * 디자인 원본: Claude Design `WNJ 서비스 상세 (1b).dc.html`
 * 이관 스펙:   docs/실코드-이관-스펙.md §4·§5
 *
 * [원본의 탭을 상태가 아니라 링크로 바꾼 이유]
 * 원본은 4개 공종을 한 페이지에서 state로 갈아끼운다(프리뷰 한 파일에 네 화면을
 * 담기 위한 장치다). 그대로 하면 4개 URL이 1개로 합쳐지면서 '1 키워드 클러스터 =
 * 1 페이지' 구조가 무너진다 — 스펙 §4가 `/services/[slug]` 유지를 명시한 이유다.
 * 탭은 각 슬러그로 가는 링크로 만들고 현재 페이지만 채움 처리한다. 결과는 동일하다.
 *
 * 골격(헤더·견적폼·오시는 길·푸터)은 SubPageShell이 담당한다. 덕분에 이 페이지에도
 * 견적폼이 다시 붙어, 공종별 리드가 `service_{slug}`로 구분돼 접수된다.
 */

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE_URL}/services/${page.slug}`,
      type: 'website',
    },
  };
}

// 인테리어만 일반 고객 대상이라 견적폼 고객유형을 다르게 잡는다
const CUSTOMER_TYPE_BY_SLUG: Record<string, string> = {
  factory: 'industrial',
  power: 'industrial',
  panel: 'industrial',
  interior: 'interior',
};

const SHELL = { maxWidth: 1280, margin: '0 auto' } as const;
const SECTION_PAD = 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)';
const HAIRLINE = '1px solid var(--color-divider)';

export default async function ServiceDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) notFound();

  const ctaSlot = `service_cta_${page.slug}`;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    description: page.metaDescription,
    serviceType: page.crumb,
    provider: {
      '@type': 'ElectricalContractor',
      name: COMPANY.name,
      telephone: '+82-53-525-0424',
      url: SITE_URL,
    },
    areaServed: ['대구광역시', '경상북도'],
    url: `${SITE_URL}/services/${page.slug}`,
  };

  // 스펙 §7-1 — 노출형 FAQ + FAQPage 스키마. 질문이 페이지별로 분리 배정돼 홈과 겹치지 않는다.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <SubPageShell
      quoteSource={`service_${page.slug}`}
      initialCategory={page.slug}
      initialCustomerType={CUSTOMER_TYPE_BY_SLUG[page.slug]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── 브레드크럼 + 공종 탭 ── */}
      <div className="sheet" style={{ borderBottom: HAIRLINE }}>
        <div style={{ ...SHELL, padding: 'clamp(24px,3vw,36px) clamp(16px,4vw,48px) 0' }}>
          <nav aria-label="위치" className="text-muted" style={{ fontSize: 12.5, marginBottom: 18 }}>
            <Link href="/">홈</Link>
            {' / '}
            <Link href="/#services">사업영역</Link>
            {' / '}
            <span style={{ color: 'var(--color-text)' }}>{page.crumb}</span>
          </nav>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {servicePages.map((tab) => {
              const active = tab.slug === page.slug;
              return (
                <Link
                  key={tab.slug}
                  href={`/services/${tab.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className="display"
                  style={{
                    fontSize: 15,
                    padding: '12px 20px',
                    border: HAIRLINE,
                    borderBottom: 'none',
                    marginRight: -1,
                    background: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? 'var(--color-bg)' : 'var(--color-text)',
                  }}
                >
                  {tab.tab}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 서비스 히어로 ── */}
      <section style={{ borderBottom: HAIRLINE }}>
        <div style={{ ...SHELL, padding: 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
            {/* 공종 코드는 제목(clamp 32~52px)과 한 쌍이다 — 같이 늘고 줄게 한다 */}
            <span
              className="display"
              style={{ fontSize: 'clamp(20px,2.4vw,31px)', letterSpacing: '.12em', color: 'var(--color-accent-700)' }}
            >
              {page.code}
            </span>
            <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.08 }}>{page.h1}</h1>
          </div>

          <p style={{ fontSize: 'clamp(14px,1.2vw,16px)', lineHeight: 1.75, maxWidth: 860, margin: '0 0 22px' }}>
            {page.lead}
          </p>

          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 26px', padding: 0, listStyle: 'none' }}>
            {page.keywords.map((kw) => (
              <li key={kw} className="tag">{kw}</li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              href="#quote"
              className="display blueprint btn-solid"
              data-cta-slot={ctaSlot}
              data-cta-variant="A"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 17, padding: '13px 26px' }}
            >
              이 공사 무료 견적 신청
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <a
              href={`tel:${COMPANY.mobile}`}
              className="display btn-outline mono-num"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 16, padding: '13px 22px' }}
            >
              <Phone size={15} strokeWidth={1.5} />
              {COMPANY.mobile}
            </a>
          </div>
        </div>
      </section>

      {/* ── 01 시공 범위 ── */}
      <section>
        <div style={{ ...SHELL, padding: SECTION_PAD }}>
          <SectionHead no="01" title="시공 범위" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '0 56px' }}>
            {page.scope.map((item) => (
              <div key={item.title} style={{ padding: '20px 0', borderTop: HAIRLINE }}>
                <h3 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15.5, marginBottom: 6, letterSpacing: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, opacity: 0.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 진행 절차 ── */}
      <section style={{ borderTop: HAIRLINE }}>
        <div style={{ ...SHELL, padding: SECTION_PAD }}>
          <SectionHead no="02" title="진행 절차" note="현장 조사부터 준공 인계까지" />
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderLeft: HAIRLINE,
              marginLeft: 6,
              maxWidth: 880,
              padding: 0,
              listStyle: 'none',
            }}
          >
            {page.process.map((step) => (
              <li key={step.step} style={{ position: 'relative', padding: '0 0 26px 28px' }}>
                <h3 className="display" style={{ fontSize: 19, letterSpacing: 0 }}>
                  <span className="mono-num" style={{ color: 'var(--color-accent-700)', marginRight: 10 }}>
                    {String(step.step).padStart(2, '0')}
                  </span>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: '5px 0 0', opacity: 0.8, maxWidth: 760 }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 03 비용·기간을 좌우하는 변수 ── */}
      <section style={{ borderTop: HAIRLINE }}>
        <div style={{ ...SHELL, padding: SECTION_PAD }}>
          <SectionHead
            no="03"
            title="비용·기간을 좌우하는 변수"
            note="이 항목들을 미리 알려주시면 견적 정확도가 올라갑니다"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {page.considerations.map((item, i) => (
              <div key={item.title} className="blueprint" style={{ padding: 20 }}>
                <p
                  className="display"
                  style={{ fontSize: 14, letterSpacing: '.1em', color: 'var(--color-accent-700)', margin: '0 0 8px' }}
                >
                  V{i + 1}
                </p>
                <h3 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, marginBottom: 6, letterSpacing: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, opacity: 0.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 FAQ ── */}
      <section style={{ borderTop: HAIRLINE }}>
        <div style={{ ...SHELL, padding: SECTION_PAD }}>
          <SectionHead no="04" title="이 공사에 대한 질문" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '0 56px' }}>
            {page.faqs.map((faq) => (
              <div key={faq.question} style={{ padding: '20px 0', borderTop: HAIRLINE }}>
                <h3 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing: 0 }}>
                  <span className="display" style={{ color: 'var(--color-accent-700)', marginRight: 8 }}>Q</span>
                  {faq.question}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, opacity: 0.8 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 플레이트 — 바로 아래 견적폼으로 보낸다 ── */}
      <section className="sheet" style={{ borderTop: HAIRLINE }}>
        <div style={{ ...SHELL, padding: SECTION_PAD }}>
          <div
            className="blueprint blueprint-strong elev-md"
            style={{
              background: 'var(--color-bg)',
              padding: 'clamp(24px,3vw,36px)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p className="display" style={{ fontSize: 'clamp(22px,2.4vw,28px)', margin: '0 0 4px' }}>
                {page.ctaTitle}
              </p>
              <p className="text-muted" style={{ fontSize: 13.5, margin: 0 }}>
                현장 방문 견적 무료 · 출장비 없음 · 1영업일 내 회신 · 견적 후 진행 여부는 고객이 결정
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href="#quote"
                className="display blueprint btn-solid"
                data-cta-slot={ctaSlot}
                data-cta-variant="A"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 17, padding: '14px 28px' }}
              >
                아래 폼으로 견적 신청
              </Link>
              <a
                href={`tel:${COMPANY.mobile}`}
                className="display btn-outline mono-num"
                style={{ display: 'inline-flex', alignItems: 'center', fontSize: 16, padding: '14px 22px' }}
              >
                {COMPANY.mobile}
              </a>
            </div>
          </div>
        </div>
      </section>
    </SubPageShell>
  );
}
