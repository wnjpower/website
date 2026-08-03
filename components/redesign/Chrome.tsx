import Link from 'next/link';
import { Phone } from 'lucide-react';
import { COMPANY } from '@/lib/site';
import type { SiteContent } from '@/lib/content/schema';

/**
 * 1b 블루프린트 페이지 골격 — 헤더 / 푸터 / 모바일 하단 바.
 *
 * 이관 스펙 §5의 Header 항목대로 상단 유틸리티 띠를 없앤 64px 단일 스티키 바다
 * (P3: 같은 신뢰 정보가 상단 띠·히어로·자격 섹션에 세 번 반복되던 문제).
 * 등록번호는 자격 섹션과 푸터에서만 표기한다.
 *
 * 로고 문구와 메뉴는 어드민(홈페이지 편집 → 헤더)에서 그대로 편집된다.
 * 상단 띠 관련 필드(topBar*)는 이 디자인에서 쓰이지 않아 편집 화면에서 뺐다.
 *
 * 아이콘 stroke는 1.5 — 스펙 §3이 지정한 값이며, 헤어라인 위주의 이 디자인에서
 * 기본값 2는 아이콘만 굵게 튄다.
 */

const FALLBACK_NAV = [
  { label: '사업영역', href: '/#services' },
  { label: '시공 실적', href: '/portfolio' },
  { label: '비용 기준', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export function BlueprintHeader({
  content,
  ctaHref = '#quote',
}: {
  content?: SiteContent['header'];
  ctaHref?: string;
}) {
  const logoText = content?.logoText || '우앤주전력';
  const nav = content?.nav?.length ? content.nav : FALLBACK_NAV;
  const navItems = content?.showBlogLink
    ? [...nav, { label: '전기공사 정보', href: '/blog' }]
    : nav;

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
            {logoText}
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
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="nav-link"
              style={{ fontSize: 14 }}
            >
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

/**
 * 데스크톱 우하단 부동 CTA (900px 이상에서만).
 *
 * 모바일은 하단 고정 바가 같은 역할을 하므로 둘이 동시에 뜨지 않는다.
 * 스크롤 위치와 무관하게 항상 떠 있다 — 긴 페이지에서 전화 버튼을 찾으러
 * 위로 되돌아가는 일을 없애는 것이 목적이라, 숨겼다 띄우면 의미가 줄어든다.
 */
export function BlueprintDesktopDock({ quoteHref = '#quote' }: { quoteHref?: string }) {
  return (
    <div
      data-desktop-dock
      data-cta-scope="floating"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 70,
      }}
    >
      <a
        href={`tel:${COMPANY.mobile}`}
        aria-label={`전화 상담 ${COMPANY.mobile}`}
        className="blueprint elev-md"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      >
        <CornerMarks />
        <Phone size={20} strokeWidth={1.5} />
      </a>
      <Link
        href={quoteHref}
        aria-label="무료 견적 신청"
        className="blueprint elev-md btn-solid is-solid"
        data-cta-slot="floating_quote"
        data-cta-variant="A"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
        }}
      >
        <CornerMarks />
        <FileIcon />
      </Link>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

/**
 * 섹션 머리 — 번호 + 제목 + 보조 설명, 좌측 정렬.
 * 스펙 §5가 지적한 P5(중앙 정렬 SectionHeading)를 대체한다.
 * action은 우측 끝에 붙는 링크 자리(예: "전체 실적 보기 →").
 */
export function SectionHead({
  no,
  title,
  note,
  action,
  gap = 30,
  dark = false,
}: {
  no: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
  gap?: number;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '10px 18px',
        flexWrap: 'wrap',
        marginBottom: gap,
      }}
    >
      <span
        className="display"
        style={{
          fontSize: 15,
          letterSpacing: '.14em',
          color: dark ? 'var(--color-accent-300, #b5d9fd)' : 'var(--color-accent-700)',
        }}
      >
        {no}
      </span>
      <h2 style={{ fontSize: 'clamp(28px,3vw,38px)', letterSpacing: '-.01em' }}>{title}</h2>
      {note && (
        <span
          className={dark ? undefined : 'text-muted'}
          style={{ fontSize: 13.5, opacity: dark ? 0.65 : undefined }}
        >
          {note}
        </span>
      )}
      {action && <span style={{ marginLeft: 'auto' }}>{action}</span>}
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
