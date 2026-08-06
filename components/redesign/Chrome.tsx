import Link from 'next/link';
import { Phone } from 'lucide-react';
import HeaderBar from '@/components/redesign/HeaderBar';
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

  // 표시는 HeaderBar(클라이언트)가 맡는다 — 스크롤 상태·현재 위치 표시에
  // 브라우저 상태가 필요하다. 여기서는 편집된 콘텐츠를 정리해 넘기기만 한다.
  return <HeaderBar logoText={logoText} navItems={navItems} ctaHref={ctaHref} />;
}

export function BlueprintFooter() {
  return (
    <footer
      style={{
        background: 'var(--color-ink)',
        color: '#f4f5f6',
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
          <Link href="/privacy" style={{ color: '#f4f5f6' }}>
            개인정보처리방침
          </Link>
          <Link href="/" style={{ color: '#f4f5f6' }}>
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
        /* 흰 면 위에서도 먹색 밴드 위에서도 바의 윗변이 보여야 한다.
           divider(어두운 헤어라인)는 검은 섹션 위에서 통째로 사라졌다. */
        borderTop: '1px solid rgba(255,255,255,0.3)',
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
          /* 먹색이 아니라 깊은 파랑 — 진행 절차 같은 먹색 섹션 위에 바가
             떠 있을 때 바닥과 같은 색이면 바가 통째로 사라져 보인다. */
          background: 'var(--color-accent-900)',
          color: '#f4f5f6',
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
        className="blueprint blueprint-strong elev-md"
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
        <Phone size={20} strokeWidth={1.5} />
      </a>
      <Link
        href={quoteHref}
        aria-label="무료 견적 신청"
        className="blueprint elev-md btn-solid"
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
 * 섹션 머리 — 액센트 룰 + 영문 라벨 / 번호 + 제목 + 보조 설명, 좌측 정렬.
 * 스펙 §5가 지적한 P5(중앙 정렬 SectionHeading)를 대체한다.
 * action은 우측 끝에 붙는 링크 자리(예: "전체 실적 보기 →").
 *
 * [머리 위 한 줄을 더 둔 이유]
 * 번호와 제목만 있으면 섹션이 바뀌었다는 신호가 제목 크기 하나뿐이라, 길게
 * 스크롤할 때 구획이 흐려진다. 짧은 액센트 막대 + 영문 라벨을 위에 얹어
 * "여기서 새 장이 시작된다"를 색으로 먼저 알린다. 라벨은 표시 서체(라틴)의
 * 대문자 자간을 살리는 자리이기도 하다.
 * kicker를 안 넘기면 막대만 그린다 — 법령 조문처럼 영문 라벨이 어색한 곳.
 */
export function SectionHead({
  no,
  kicker,
  title,
  note,
  action,
  gap = 30,
  dark = false,
}: {
  no: string;
  /** 액센트 막대 옆 영문 라벨 (예: SERVICES) */
  kicker?: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
  gap?: number;
  dark?: boolean;
}) {
  return (
    <div style={{ marginBottom: gap }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span
          aria-hidden
          style={{
            width: 30,
            height: 2,
            flex: 'none',
            background: dark ? 'var(--color-accent-300)' : 'var(--color-accent)',
          }}
        />
        {kicker && (
          <span
            className="display"
            style={{
              fontSize: 12.5,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: dark ? 'var(--color-accent-300)' : 'var(--color-accent-700)',
            }}
          >
            {kicker}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px 18px', flexWrap: 'wrap' }}>
        {/* 번호는 제목과 한 쌍으로 읽혀야 한다. 15px 고정이던 때는 제목이
            38px까지 커지는 동안 혼자 작아 보여, 짝이 아니라 떨어진 꼬리표처럼
            보였다. 제목의 60% 안팎으로 같이 늘고 줄게 한다(baseline 정렬). */}
        <span
          className="display"
          style={{
            fontSize: 'clamp(18px,1.9vw,24px)',
            letterSpacing: '.12em',
            color: dark ? 'var(--color-accent-300)' : 'var(--color-accent-700)',
          }}
        >
          {no}
        </span>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)' }}>{title}</h2>
        {note && (
          <span
            className={dark ? undefined : 'text-muted'}
            style={{ fontSize: 13.5, opacity: dark ? 0.7 : undefined }}
          >
            {note}
          </span>
        )}
        {action && <span style={{ marginLeft: 'auto' }}>{action}</span>}
      </div>
    </div>
  );
}

