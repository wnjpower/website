'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, MousePointerClick, Newspaper,
  Inbox, Search, Sparkles, Bell, ExternalLink, LogOut, Menu, X,
} from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

/**
 * 어드민 사이드 레일 — 도면 색인 형태.
 *
 * 메뉴에 01·02… 번호를 붙였다. 사이트 본문이 섹션을 «01 사업영역»처럼 번호로
 * 부르므로 같은 언어를 쓰고, 전화로 "두 번째 메뉴 들어가 보세요"라고 안내할 때도
 * 가리킬 것이 생긴다.
 *
 * 아이콘 stroke는 1.5 — 헤어라인 위주인 이 디자인에서 기본값 2는 아이콘만 굵게 튄다.
 */

const NAV = [
  { href: '/admin',               label: '실시간 현황', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads',         label: '견적문의',    icon: Inbox },
  { href: '/admin/content',       label: '홈페이지 편집', icon: FileText },
  { href: '/admin/cta',           label: 'CTA 버튼',    icon: MousePointerClick },
  { href: '/admin/posts',         label: '게시판',      icon: Newspaper },
  { href: '/admin/seo',           label: '검색엔진',    icon: Search },
  { href: '/admin/aeo',           label: 'AEO 추적',    icon: Sparkles },
  { href: '/admin/notifications', label: '알림 설정',   icon: Bell },
];

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 주소가 바뀌면 서랍은 닫는다. 링크마다 onClick을 다는 것보다 새는 경로가 없다.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* ── 모바일 상단 바 (1024px 미만) ── */}
      <div
        className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4"
        style={{ height: 56, background: 'var(--color-accent-900)', color: '#f2f2f3' }}
      >
        <Link href="/admin" className="display" style={{ fontSize: 18, letterSpacing: '-.01em' }}>
          우앤주전력 <span style={{ opacity: 0.6, fontSize: 13, letterSpacing: '.14em' }}>ADMIN</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center"
        >
          {open ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
        </button>
      </div>

      {open && <div className="a-scrim lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      {/* ── 사이드 레일 ── */}
      <aside className="a-rail" data-open={open ? '' : undefined}>
        <div className="a-rail-head">
          <Link href="/admin" className="min-w-0">
            <span className="display block" style={{ fontSize: 19, letterSpacing: '-.01em' }}>
              우앤주전력
            </span>
            <span
              className="display block"
              style={{ fontSize: 11, letterSpacing: '.18em', opacity: 0.6 }}
            >
              ADMIN CONSOLE
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="a-navlink"
                data-active={active ? '' : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span className="a-navlink-no">{String(i + 1).padStart(2, '0')}</span>
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(242,242,243,0.16)' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" className="a-navlink">
            <span className="a-navlink-no" aria-hidden />
            <ExternalLink className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
            사이트 보기
          </a>
          <button onClick={signOut} className="a-navlink w-full text-left">
            <span className="a-navlink-no" aria-hidden />
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
            로그아웃
          </button>
          <p
            className="px-4 pt-2 pb-3 truncate"
            style={{ fontSize: 11.5, color: 'rgba(242,242,243,0.5)' }}
          >
            {userName}
          </p>
        </div>
      </aside>
    </>
  );
}

/*
 * 레일 머리에 "+" 정합 마크(PlusMark)가 있었다.
 * 사장님 요청으로 사이트와 어드민의 "+" 마크를 전부 뺐는데(cb99ba0·d7912c8)
 * 이 파일만 빠져 어드민 좌측 레일 머리에 하나가 남아 있었다. 같이 없앤다.
 */
