'use client';
import Link from 'next/link';
import {
  Phone,
  ShieldCheck,
  CalendarDays,
  Truck,
  HandCoins,
  Home,
  Store,
  Building2,
  ChevronRight,
} from 'lucide-react';

const segments = [
  { icon: Home,      label: '아파트·주택 인테리어', sub: '개인 고객',     href: '#segments' },
  { icon: Store,     label: '카페·식당 창업',       sub: '자영업 고객',   href: '#segments' },
  { icon: Building2, label: '상업건물·병원 시공',   sub: '법인·사업자',   href: '#segments' },
];

const trustStats = [
  { icon: ShieldCheck,  label: '전기공사업 면허', sub: '등록업체' },
  { icon: CalendarDays, label: '전기공사 업력',   sub: '20년 이상' },
  { icon: Truck,        label: '당일 출동',       sub: 'A/S 원칙' },
  { icon: HandCoins,    label: '견적·출장',       sub: '완전 무료' },
];

export default function Hero() {
  const handleSegmentClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative pt-32 pb-16 sm:pt-44 sm:pb-20 overflow-hidden bg-[#F8FAFC] bg-blueprint bg-blueprint-animate"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* 헤드라인 */}
          <h1
            className="animate-fade-up text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight tracking-tight mb-5"
            style={{ animationDelay: '0.05s' }}
          >
            대구·경북 전기공사,
            <br />
            <span className="text-[#0A3D91]">우앤주전력</span>이 책임집니다
          </h1>

          {/* 서브헤드 */}
          <p
            className="animate-fade-up text-base sm:text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed"
            style={{ animationDelay: '0.18s' }}
          >
            아파트 인테리어 전기부터 상가 창업, 상업건물 시공까지{' '}
            <span className="text-[#0F172A] font-semibold">견적·출장 완전 무료</span>로 상담해 드립니다.
          </p>

          {/* CTA 버튼 */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-4 mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="#quote"
              className="inline-flex items-center justify-center gap-2 bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-bold text-xl px-10 py-5 rounded-lg transition-all shadow-lg shadow-[#0A3D91]/20 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              무료 견적문의
            </Link>
            <a
              href="tel:010-8552-9994"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#0A3D91]/15 text-[#0F172A] font-bold text-xl px-10 py-5 rounded-lg transition-all shadow-sm w-full sm:w-auto"
            >
              <Phone className="w-6 h-6 text-[#0A3D91]" />
              010-8552-9994
            </a>
          </div>
        </div>

        {/* 고객 유형 카드 */}
        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10"
          style={{ animationDelay: '0.42s' }}
        >
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <button
                key={seg.label}
                onClick={() => handleSegmentClick(seg.href)}
                className="group flex items-center gap-4 bg-white hover:bg-[#0A3D91] border border-gray-200 hover:border-[#0A3D91] rounded-lg px-5 py-4 transition-all text-left shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-md bg-[#0A3D91]/8 group-hover:bg-white/15 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-6 h-6 text-[#0A3D91] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[#0F172A] group-hover:text-white transition-colors">{seg.label}</p>
                  <p className="text-sm text-gray-400 group-hover:text-blue-100 transition-colors">{seg.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* 신뢰 스탯 배너 */}
        <div
          className="animate-fade-up grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ animationDelay: '0.54s' }}
        >
          {trustStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border-t-4 border-t-[#0A3D91] border border-gray-100 rounded-b-lg shadow-sm px-4 py-5 flex flex-col items-center gap-2"
              >
                <Icon className="w-7 h-7 text-[#0A3D91]" />
                <span className="font-bold text-[#0F172A] text-base tracking-tight">{stat.label}</span>
                <span className="text-sm text-gray-400">{stat.sub}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
