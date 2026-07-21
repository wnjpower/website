'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X, Clock, Mail, CheckCircle2 } from 'lucide-react';
import { COMPANY } from '@/lib/site';

// 서브페이지에서도 동작하도록 홈 앵커는 '/#...' 절대 경로로 둔다.
const navItems = [
  { label: '사업영역',     href: '/#services' },
  { label: '비용안내',     href: '/#pricing' },
  { label: '시공실적',     href: '/portfolio' },
  { label: '회사소개',     href: '/about' },
  { label: '자주묻는질문', href: '/faq' },
];

const TOP_BAR_H = 'h-11';   // 44px
const HEADER_H = 'h-[4.5rem]'; // 72px
const TOP_BAR_REM = 'top-11';
const MENU_TOP_SCROLLED = 'top-[4.5rem]';
const MENU_TOP_DEFAULT = 'top-[7.25rem]'; // 44 + 72

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* ── 상단 유틸리티 띠 — 조용하게, 신뢰 정보만 ── */}
      <div
        className={`fixed top-0 inset-x-0 z-50 bg-brand-dark transition-all duration-200 overflow-hidden ${
          scrolled || menuOpen ? 'h-0 opacity-0' : `${TOP_BAR_H} opacity-100`
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-full flex items-center justify-center sm:justify-between">
          <div className="hidden sm:flex items-center gap-2 text-[0.8125rem] font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            평일 09:00–18:00 · 토 09:00–13:00
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-[0.8125rem] font-medium text-slate-300">
            <span className="hidden sm:flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {COMPANY.email}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              현장 견적 출장비 무료
            </span>
          </div>
        </div>
      </div>

      {/* ── 메인 헤더 ── */}
      <header
        className={`fixed inset-x-0 z-50 bg-white transition-all duration-200 ${
          scrolled || menuOpen ? 'top-0 shadow-[0_1px_0_rgba(15,23,42,0.08),0_8px_24px_-16px_rgba(15,23,42,0.25)]' : `${TOP_BAR_REM} border-b border-slate-200/70`
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${HEADER_H}`}>
            {/* 로고 */}
            <Link href="/#hero" onClick={closeMenu} className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo.png"
                alt="우앤주전력 로고"
                width={74}
                height={30}
                className="object-contain flex-shrink-0"
                priority
              />
              <span className="leading-snug">
                <span className="block font-bold text-ink text-lg tracking-tight">우앤주전력</span>
                <span className="block text-xs font-semibold text-brand-700 tracking-wide">공장·산업 전기공사 전문</span>
              </span>
            </Link>

            {/* 네비 (데스크톱) */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-[0.9375rem] font-semibold text-slate-600 hover:text-brand px-3.5 py-2 rounded-md transition-colors after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-signal after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 우측 액션 */}
            <div className="flex items-center gap-2.5">
              <a
                href={`tel:${COMPANY.mobile}`}
                className="hidden sm:inline-flex items-center gap-2 bg-signal hover:brightness-105 text-white font-bold px-4 py-2.5 rounded-lg transition-all text-[0.9375rem] shadow-sm"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="tabular-nums">{COMPANY.mobile}</span>
              </a>
              <a
                href={`tel:${COMPANY.mobile}`}
                aria-label="전화상담"
                className="sm:hidden w-11 h-11 flex items-center justify-center rounded-lg bg-signal hover:brightness-105 transition-all"
              >
                <Phone className="w-5 h-5 text-white" />
              </a>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={menuOpen}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-ink hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 오버레이 */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={closeMenu} aria-hidden />
      )}

      {/* 모바일 메뉴 패널 */}
      <div
        className={`fixed inset-x-0 z-40 md:hidden bg-white border-b border-slate-200 shadow-xl transition-all duration-200 ${
          scrolled ? MENU_TOP_SCROLLED : MENU_TOP_DEFAULT
        } ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
      >
        <nav className="max-w-7xl mx-auto px-5 py-3 flex flex-col">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center text-left text-lg font-semibold text-ink hover:text-brand hover:bg-brand-tint px-4 py-4 rounded-lg transition-colors border-b border-slate-100 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 mt-4 mb-1">
            <a
              href={`tel:${COMPANY.mobile}`}
              onClick={closeMenu}
              className="flex items-center justify-center gap-2.5 bg-signal hover:brightness-105 text-white font-bold text-lg px-4 py-4 rounded-lg transition-all"
            >
              <Phone className="w-5 h-5" />
              <span className="tabular-nums">{COMPANY.mobile} 전화상담</span>
            </a>
            <a
              href="/#quote"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold text-lg px-4 py-4 rounded-lg transition-colors"
            >
              무료 견적문의
            </a>
          </div>
          <p className="text-xs text-slate-400 text-center py-3">
            사업자등록번호 {COMPANY.bizNumber} · 전기공사업 등록법인
          </p>
        </nav>
      </div>
    </>
  );
}
