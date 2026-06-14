'use client';
import Link from 'next/link';
import {
  Phone,
  ShieldCheck,
  CalendarDays,
  CircuitBoard,
  Gauge,
  Factory,
  Lamp,
  ChevronRight,
} from 'lucide-react';

const segments = [
  { icon: Factory, label: '공장·산업 전기공사', sub: '신축·증축·수전·동력', href: '#segments', primary: true },
  { icon: Lamp,    label: '인테리어·일반 전기', sub: '주택·상가·병원',     href: '#segments', primary: false },
];

const trustStats = [
  { icon: ShieldCheck,  label: '전기공사업 면허', sub: '등록법인' },
  { icon: CalendarDays, label: '업력 20년+',      sub: '대구·경북' },
  { icon: CircuitBoard, label: '배전반 자체제작', sub: '중간 마진 0' },
  { icon: Gauge,        label: '수전·동력설비',   sub: '증설 전문' },
];

export default function Hero() {
  const handleSegmentClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 overflow-hidden bg-[#F8FAFC] bg-photo bg-photo-hero"
      style={{ ['--bg-photo-url' as string]: "url('/images/factory-electrical.jpg')" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* eyebrow */}
          <p
            className="animate-fade-up text-sm font-bold tracking-widest text-[#0A3D91] mb-4"
            style={{ animationDelay: '0.02s' }}
          >
            대구·경북 공장·산업 전기공사 전문
          </p>

          {/* 헤드라인 */}
          <h1
            className="animate-fade-up text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight tracking-tight mb-5"
            style={{ animationDelay: '0.05s' }}
          >
            대구·경북 <span className="text-[#0A3D91]">공장 전기공사</span>,
            <br />
            우앤주전력이 책임집니다
          </h1>

          {/* 서브헤드 */}
          <p
            className="animate-fade-up text-base sm:text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed"
            style={{ animationDelay: '0.18s' }}
          >
            공장 신축·증축·증설부터 수전설비·계약전력 증설·배전반 자체제작까지 —{' '}
            <span className="text-[#0F172A] font-semibold">전기공사업 면허 보유 법인이 직접 시공</span>합니다.
            현장 방문 견적은 출장비 없이 무료입니다.
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

        {/* 고객 유형 카드 — 공장(주력) 우선 */}
        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-3xl"
          style={{ animationDelay: '0.42s' }}
        >
          {segments.map((seg) => {
            const Icon = seg.icon;
            if (seg.primary) {
              return (
                <button
                  key={seg.label}
                  onClick={() => handleSegmentClick(seg.href)}
                  className="group flex items-center gap-4 bg-[#0A3D91] hover:bg-[#0A3D91]/90 border border-[#0A3D91] rounded-lg px-5 py-4 transition-all text-left shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="w-11 h-11 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white">{seg.label}</p>
                    <p className="text-sm text-blue-100">{seg.sub}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                </button>
              );
            }
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
