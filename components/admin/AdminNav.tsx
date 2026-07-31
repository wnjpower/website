'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, MousePointerClick, Newspaper,
  Inbox, Search, Bell, ExternalLink, LogOut, Menu, X,
} from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

const NAV = [
  { href: '/admin',          label: '실시간 현황', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads',    label: '견적문의',    icon: Inbox },
  { href: '/admin/content',  label: '홈페이지 편집', icon: FileText },
  { href: '/admin/cta',      label: 'CTA 버튼',    icon: MousePointerClick },
  { href: '/admin/posts',    label: '게시판',      icon: Newspaper },
  { href: '/admin/seo',      label: '검색엔진',    icon: Search },
  { href: '/admin/notifications', label: '알림 설정', icon: Bell },
];

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
      {/* ── 모바일 상단 바 ── */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-brand text-white px-4 h-14">
        <Link href="/admin" className="font-bold tracking-tight">우앤주전력 관리자</Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ── 사이드바 ── */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-60 bg-brand text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <Link href="/admin" className="font-bold text-lg tracking-tight" onClick={() => setOpen(false)}>
            우앤주전력
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-[0.9375rem] font-semibold transition-colors ${
                  active ? 'bg-white text-brand' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3.5 py-3 text-[0.9375rem] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            사이트 보기
          </a>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-lg px-3.5 py-3 text-[0.9375rem] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            로그아웃
          </button>
          <p className="px-3.5 pt-2 pb-1 text-xs text-slate-400 truncate">{userName}</p>
        </div>
      </aside>
    </>
  );
}
