'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, Phone, X } from 'lucide-react';
import { COMPANY } from '@/lib/site';

type NavItem = { label: string; href: string };

/**
 * 모바일 헤더 메뉴.
 *
 * 900px 이하에서는 데스크톱 내비(사업영역·시공 실적·비용 기준·FAQ)가 통째로
 * 숨겨지는데 대체 수단이 없어서, 폰에서는 헤더로 페이지를 옮길 방법이 아예
 * 없었다. 하단 고정 바에는 전화·견적뿐이라 나머지 페이지가 고아가 된다.
 *
 * 패널은 헤더(sticky) 안에 absolute로 붙인다. 헤더를 따라 움직이므로 스크롤
 * 중에 열려 있어도 위치가 어긋나지 않는다.
 */
export default function MobileNav({
  items,
  ctaHref,
}: {
  items: NavItem[];
  ctaHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 다른 페이지로 이동하면 닫는다. 같은 페이지 앵커 이동은 pathname이 그대로라
  // 각 링크의 onClick에서도 닫아 준다.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        data-mobile-nav
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        className="btn-outline"
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          // 열려 있으면 채운다 — 어느 상태인지 아이콘 하나로만 판단하지 않게 한다
          background: open ? 'var(--color-accent)' : 'transparent',
          borderColor: open ? 'var(--color-accent)' : undefined,
          color: open ? 'var(--color-bg)' : 'var(--color-text)',
          cursor: 'pointer',
          padding: 0,
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
      >
        {open ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
      </button>

      {open && (
        <>
          {/* 헤더 아래 화면을 덮어 바깥을 누르면 닫히게 한다 */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden
            style={{
              position: 'fixed',
              inset: '64px 0 0',
              background: 'rgba(29,31,32,0.35)',
            }}
          />

          <div
            id="mobile-nav-panel"
            data-mobile-nav-panel
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1,
              background: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-divider)',
              boxShadow: 'var(--shadow-md)',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', padding: '4px 0 12px' }}>
              {items.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px clamp(16px,4vw,48px)',
                    fontSize: 16,
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  {item.label}
                  <ArrowRight size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)' }} />
                </Link>
              ))}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '16px clamp(16px,4vw,48px) 4px',
                }}
              >
                <Link
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  className="display blueprint btn-solid is-solid"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 16,
                    padding: '13px 18px',
                  }}
                >
                  무료 현장 견적
                  <ArrowRight size={15} strokeWidth={1.5} />
                </Link>
                <a
                  href={`tel:${COMPANY.mobile}`}
                  onClick={() => setOpen(false)}
                  className="display btn-outline mono-num"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 16,
                    padding: '13px 18px',
                  }}
                >
                  <Phone size={15} strokeWidth={1.5} />
                  {COMPANY.mobile}
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
