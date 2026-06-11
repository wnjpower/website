'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Phone, Zap, Menu, X, Clock, Mail } from 'lucide-react';

const navItems = [
  { label: '서비스',       href: '#services' },
  { label: '비용안내',     href: '#pricing' },
  { label: '시공사례',     href: '#portfolio' },
  { label: '자주묻는질문', href: '#faq' },
];

// 상단 띠 높이: 2.5rem(40px) / 메인 헤더: 5rem(80px)
const TOP_BAR_H  = 'h-10';          // 40px
const HEADER_H   = 'h-20';          // 80px
const TOP_BAR_REM = 'top-10';       // 헤더가 띠 아래에 위치
const MENU_TOP_SCROLLED   = 'top-20';               // 80px
const MENU_TOP_DEFAULT    = 'top-[7.5rem]';          // 40+80=120px

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

  const handleNavClick = (href: string) => {
    closeMenu();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  };

  return (
    <>
      {/* ── 상단 정보 띠 ── */}
      <div
        className={`fixed top-0 inset-x-0 z-50 bg-[#0A3D91] transition-all duration-200 overflow-hidden ${
          scrolled || menuOpen ? 'h-0 opacity-0' : `${TOP_BAR_H} opacity-100`
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* 왼쪽: 영업시간·이메일 (sm 이상) */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-blue-100">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFB800]" />
              평일 09:00–18:00 &nbsp;·&nbsp; 토 09:00–13:00
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FFB800]" />
              wnj-2023@naver.com
            </span>
          </div>

          {/* 모바일: 핵심 한 줄 */}
          <div className="sm:hidden flex items-center gap-2 text-sm font-medium text-blue-100">
            <Clock className="w-4 h-4 text-[#FFB800]" />
            평일 09:00–18:00 &nbsp;·&nbsp; 견적·출장 무료
          </div>

          {/* 오른쪽: 사업자 정보 */}
          <div className="flex items-center gap-2 text-sm font-medium text-blue-100 sm:ml-auto">
            <span className="w-2 h-2 rounded-full bg-[#FFB800] flex-shrink-0" />
            <span className="hidden sm:inline">사업자등록번호 637-81-02833 &nbsp;·&nbsp; 대구광역시 서구</span>
            <span className="sm:hidden">637-81-02833 · 대구 서구</span>
          </div>
        </div>
      </div>

      {/* ── 메인 헤더 ── */}
      <header
        className={`fixed inset-x-0 z-50 transition-all duration-200 ${
          scrolled || menuOpen ? 'top-0' : TOP_BAR_REM
        } ${
          scrolled || menuOpen
            ? 'bg-white shadow-md border-b border-gray-100'
            : 'bg-white border-b border-gray-100/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${HEADER_H}`}>

            {/* 로고 */}
            <Link
              href="#hero"
              onClick={closeMenu}
              className="flex items-center gap-3 group"
            >
              <span className="w-12 h-12 rounded-xl bg-[#0A3D91] flex items-center justify-center shadow-md flex-shrink-0">
                <Zap className="w-6 h-6 text-white" fill="currentColor" />
              </span>
              <span className="leading-snug">
                <span className="block font-extrabold text-[#0F172A] text-xl tracking-tight">
                  우앤주전력
                </span>
                <span className="block text-sm font-semibold text-[#0A3D91] tracking-wide">
                  전기공사업 등록법인
                </span>
              </span>
            </Link>

            {/* 네비 (데스크톱) */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative text-[1.0625rem] font-semibold text-gray-600 hover:text-[#0A3D91] px-5 py-2 rounded-lg transition-colors after:absolute after:bottom-0.5 after:left-5 after:right-5 after:h-0.5 after:bg-[#0A3D91] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* 우측 액션 */}
            <div className="flex items-center gap-3">
              {/* 데스크톱 전화 버튼 */}
              <a
                href="tel:010-8552-9994"
                className="hidden sm:inline-flex items-center gap-2.5 bg-[#FFB800] hover:bg-[#E6A600] text-[#0F172A] font-bold px-5 py-3 rounded-lg transition-colors shadow-sm text-[1.0625rem]"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                010-8552-9994
              </a>

              {/* 모바일 전화 아이콘 */}
              <a
                href="tel:010-8552-9994"
                aria-label="전화상담"
                className="sm:hidden w-11 h-11 flex items-center justify-center rounded-lg bg-[#FFB800] hover:bg-[#E6A600] transition-colors"
              >
                <Phone className="w-5 h-5 text-[#0F172A]" />
              </a>

              {/* 햄버거 버튼 */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={menuOpen}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-[#0F172A] hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 모바일 오버레이 */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={closeMenu}
          aria-hidden
        />
      )}

      {/* 모바일 메뉴 패널 */}
      <div
        className={`fixed inset-x-0 z-40 md:hidden bg-white border-b border-gray-100 shadow-xl transition-all duration-200 ${
          scrolled ? MENU_TOP_SCROLLED : MENU_TOP_DEFAULT
        } ${
          menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="flex items-center text-left text-xl font-semibold text-[#0F172A] hover:text-[#0A3D91] hover:bg-[#0A3D91]/5 px-4 py-5 rounded-xl transition-colors border-b border-gray-100 last:border-0"
            >
              {item.label}
            </button>
          ))}

          <div className="flex flex-col gap-2.5 mt-4">
            <a
              href="tel:010-8552-9994"
              onClick={closeMenu}
              className="flex items-center justify-center gap-3 bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-bold text-lg px-4 py-4 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
              010-8552-9994 전화상담
            </a>
            <a
              href="#quote"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#0F172A] font-bold text-lg px-4 py-4 rounded-xl transition-colors"
            >
              무료 견적문의
            </a>
          </div>

          <p className="text-sm text-gray-400 text-center pb-2 mt-2">
            사업자등록번호 637-81-02833 · 전기공사업 등록법인
          </p>
        </nav>
      </div>
    </>
  );
}
