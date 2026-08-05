'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import MobileNav from '@/components/redesign/MobileNav';
import { COMPANY } from '@/lib/site';

type NavItem = { label: string; href: string };

/**
 * 스티키 헤더.
 *
 * 붙어 있기만 하던 바에 세 가지를 더한다.
 *
 *  1. 스크롤 상태 — 맨 위에서는 배경과 같은 면으로 두고, 내려가면 반투명 + 블러 +
 *     그림자로 한 겹 위에 뜬 판이 되게 한다. 히어로의 격자 배경 위에서 헤더 경계가
 *     사라져 보이던 문제를 없앤다.
 *  2. 하단 헤어라인이 곧 진행 게이지 — 계기판 같은 이 디자인 언어에 맞고,
 *     긴 홈 화면에서 얼마나 읽었는지 알려 준다. 선을 하나 더 얹지 않고 이미
 *     있던 테두리를 쓴다.
 *  3. 현재 위치 표시 — 다른 페이지에 있으면 그 메뉴에, 홈에 있으면 지금 보고 있는
 *     섹션에 악센트 밑줄이 붙는다. 메뉴가 6개인데 어디에 있는지 표시가 없었다.
 *
 * 스크롤 계산은 rAF로 한 프레임에 한 번만 돌린다.
 */
export default function HeaderBar({
  logoText,
  navItems,
  ctaHref,
}: {
  logoText: string;
  navItems: NavItem[];
  ctaHref: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 홈 앵커 메뉴가 가리키는 섹션 id (예: '/#services' → 'services')
  const anchorIds = navItems
    .map((item) => (item.href.startsWith('/#') ? item.href.slice(2) : null))
    .filter((v): v is string => Boolean(v));
  const anchorKey = anchorIds.join(',');

  const raf = useRef(0);

  useEffect(() => {
    const ids = anchorKey ? anchorKey.split(',') : [];
    const onHome = pathname === '/';

    function measure() {
      raf.current = 0;
      const y = window.scrollY;
      setScrolled(y > 4);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);

      if (!onHome || ids.length === 0) {
        setActiveId(null);
        return;
      }
      /*
       * 헤더 바로 아래 선을 지나간 마지막 섹션이 "지금 보는 곳"이다.
       * offsetTop이 아니라 뷰포트 기준으로 잰다 — offsetTop은 offsetParent
       * 기준이라 위치 지정된 조상이 하나만 끼어도 값이 어긋난다.
       */
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 80) current = id;
      }
      setActiveId(current);
    }

    function onScroll() {
      if (raf.current) return;
      raf.current = requestAnimationFrame(measure);
    }

    /*
     * 숨은 탭에서는 rAF가 멈춘다. 그 사이 스크롤이 나면 예약 플래그만 세워진 채
     * 콜백이 오지 않아, 탭을 다시 열어도 onScroll이 계속 조기 반환하며 헤더가
     * 굳어 버린다(새 탭으로 열어 둔 링크·세션 복원에서 실제로 걸린다).
     * 다시 보일 때 플래그를 풀고 한 번 직접 잰다.
     */
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
      measure();
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisible);
    // 뒤로가기 복원(bfcache)도 같은 상황이다
    window.addEventListener('pageshow', onVisible);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pathname, anchorKey]);

  function isActive(href: string) {
    if (href.startsWith('/#')) return pathname === '/' && activeId === href.slice(2);
    // 하위 경로까지 포함 — /portfolio/칠곡공장 에서도 '시공실적'이 켜져 있어야 한다
    return href !== '/' && (pathname === href || pathname.startsWith(href + '/'));
  }

  return (
    <header
      data-scrolled={scrolled ? '' : undefined}
      className="bp-header"
      style={{ position: 'sticky', top: 0, zIndex: 60 }}
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
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}
        >
          {/* alt는 비워 둔다 — 바로 옆 한글 상호가 이미 링크 이름을 만든다.
              둘 다 읽히면 스크린리더에서 상호가 두 번 나온다. */}
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={219}
            height={128}
            priority
            style={{ height: 36, width: 'auto' }}
          />
          <span className="display" style={{ fontSize: 21, letterSpacing: '-.01em' }}>
            {logoText}
          </span>
        </Link>

        <nav data-desktop-nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="nav-link"
                data-active={active ? '' : undefined}
                aria-current={active ? 'page' : undefined}
                style={{ fontSize: 14 }}
              >
                {item.label}
              </Link>
            );
          })}
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
          className="display blueprint btn-solid"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 15,
            padding: '9px 18px',
          }}
        >
          무료 현장 견적
        </Link>

        {/* 900px 이하 전용 — 데스크톱 내비가 숨겨지는 구간의 유일한 이동 수단 */}
        <MobileNav items={navItems} ctaHref={ctaHref} />
      </div>

      {/* 하단 테두리를 겸하는 진행 게이지 */}
      <span className="bp-header-gauge" aria-hidden>
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>
    </header>
  );
}
