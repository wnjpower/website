import Link from 'next/link';
import { Phone } from 'lucide-react';
import { COMPANY } from '@/lib/site';

/**
 * 1b 블루프린트 페이지 골격 — 헤더 / 푸터 / 모바일 하단 바.
 *
 * 이관 스펙 §5의 Header 항목대로 상단 유틸리티 띠를 없앤 64px 단일 스티키 바다
 * (P3: 같은 신뢰 정보가 상단 띠·히어로·자격 섹션에 세 번 반복되던 문제).
 * 등록번호는 푸터 한 곳에서만 표기한다.
 *
 * 아이콘 stroke는 1.5 — 스펙 §3이 지정한 값이며, 헤어라인 위주의 이 디자인에서
 * 기본값 2는 아이콘만 굵게 튄다.
 */

const NAV = [
  { label: '사업영역', href: '/#services' },
  { label: '시공 실적', href: '/portfolio' },
  { label: '비용 기준', href: '/#pricing' },
  { label: 'FAQ', href: '/faq' },
];

export function BlueprintHeader({ ctaHref = '#svc-quote' }: { ctaHref?: string }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          height: 64,
          padding: '0 clamp(16px,4vw,48px)',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginRight: 'auto' }}
        >
          <span className="display" style={{ fontSize: 21, letterSpacing: '-.01em' }}>
            우앤주전력
          </span>
          <span
            className="display"
            style={{
              fontSize: 12,
              letterSpacing: '.14em',
              color: 'var(--color-accent-700)',
              textTransform: 'uppercase',
            }}
          >
            WNJ Electric · Daegu
          </span>
        </Link>

        <nav data-desktop-nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" style={{ fontSize: 14 }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href={`tel:${COMPANY.mobile}`}
          data-desktop-nav
          className="display btn-outline mono-num"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 15,
            padding: '8px 14px',
          }}
        >
          <Phone size={15} strokeWidth={1.5} />
          {COMPANY.mobile}
        </a>

        <Link
          href={ctaHref}
          data-desktop-nav
          className="display blueprint btn-solid is-solid"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 15,
            padding: '9px 18px',
          }}
        >
          <CornerMarks />
          무료 현장 견적
        </Link>
      </div>
    </header>
  );
}

export function BlueprintFooter() {
  return (
    <footer
      style={{
        background: 'var(--color-accent-900)',
        color: '#f2f2f3',
        padding: '26px clamp(16px,4vw,48px)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px 20px',
          fontSize: 12.5,
        }}
      >
        <span style={{ opacity: 0.75 }}>
          © {new Date().getFullYear()} {COMPANY.name} · 대표 {COMPANY.ceo} · 사업자{' '}
          {COMPANY.bizNumber} · 전기공사업 {COMPANY.license}
        </span>
        <span style={{ display: 'flex', gap: 18, opacity: 0.75 }}>
          <Link href="/privacy" style={{ color: '#f2f2f3' }}>
            개인정보처리방침
          </Link>
          <Link href="/" style={{ color: '#f2f2f3' }}>
            홈으로 →
          </Link>
        </span>
      </div>
    </footer>
  );
}

/**
 * 모바일 하단 고정 바. 900px 미만에서만 나타난다(blueprint.css).
 * 홈의 FloatingCta와 같은 자리를 쓰지만, 이 페이지는 자체 골격을 쓰므로
 * 두 개가 겹칠 일은 없다.
 */
export function BlueprintMobileBar({
  quoteHref = '#svc-quote',
  ctaSlot,
}: {
  quoteHref?: string;
  ctaSlot?: string;
}) {
  return (
    <div
      data-mobile-bar
      data-cta-scope="mobile_bar"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 70,
        borderTop: '1px solid var(--color-divider)',
        boxShadow: '0 -4px 16px rgba(0,0,0,.1)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <a
        href={`tel:${COMPANY.mobile}`}
        className="display"
        style={{
          flex: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 16,
          background: 'var(--color-accent-900)',
          color: '#f2f2f3',
          padding: 16,
        }}
      >
        <Phone size={16} strokeWidth={1.5} />
        전화 상담
      </a>
      <Link
        href={quoteHref}
        className="display btn-solid"
        data-cta-slot={ctaSlot}
        data-cta-variant={ctaSlot ? 'A' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          padding: 16,
        }}
      >
        무료 견적
      </Link>
    </div>
  );
}

/** 도면 정합 마크 네 개. .blueprint 를 쓴 요소의 첫 자식으로 넣는다. */
export function CornerMarks() {
  return (
    <>
      <i className="corner tl" aria-hidden />
      <i className="corner tr" aria-hidden />
      <i className="corner bl" aria-hidden />
      <i className="corner br" aria-hidden />
    </>
  );
}
