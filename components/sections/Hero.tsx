'use client';
import Link from 'next/link';
import {
  Phone,
  ShieldCheck,
  CalendarDays,
  CircuitBoard,
  Wrench,
  Factory,
  Lamp,
  ChevronRight,
} from 'lucide-react';
import { COMPANY } from '@/lib/site';

const segments = [
  { icon: Factory, label: '공장·산업 전기공사', sub: '신축·증축·수전·동력', href: '#segments', primary: true },
  { icon: Lamp,    label: '인테리어·일반 전기', sub: '주택·상가·병원',     href: '#segments', primary: false },
];

// 형용사가 아니라 조회 가능한 번호·기간으로 신뢰를 제시한다.
// TODO(사장님 확인): 누적 시공 건수 · 배전반 제작 면수를 받으면 아래 2·3번을 수치로 교체
const trustStats = [
  { icon: ShieldCheck,  label: '전기공사업 등록', sub: COMPANY.license, mono: true },
  { icon: CalendarDays, label: '업력 20년+',      sub: '대구·경북 현장', mono: false },
  { icon: CircuitBoard, label: '배전반 자체 제작', sub: '중간 마진 없음', mono: false },
  { icon: Wrench,       label: 'A/S 당일 출동',   sub: '준공 후 1년 보증', mono: false },
];

export default function Hero() {
  const handleSegmentClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 overflow-hidden bg-[#0B1220] bg-photo bg-photo-hero"
      style={{ ['--bg-photo-url' as string]: "url('/images/factory-electrical.jpg')" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* eyebrow */}
          <p
            className="animate-fade-up text-sm font-bold tracking-widest text-[#FF5500] mb-4"
            style={{ animationDelay: '0.02s' }}
          >
            대구·경북 공장·산업 전기공사 전문
          </p>

          {/* 헤드라인 */}
          <h1
            className="animate-fade-up text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5"
            style={{ animationDelay: '0.05s' }}
          >
            공장 전기공사,
            <br />
            <span className="text-[#FF5500]">면허·제작·시공</span>을 한 회사가 끝냅니다
          </h1>

          {/* 서브헤드 */}
          <p
            className="animate-fade-up text-base sm:text-xl md:text-2xl text-slate-300 mb-4 leading-relaxed"
            style={{ animationDelay: '0.18s' }}
          >
            공장 신축·증축·증설부터 수전설비·계약전력 증설·배전반 자체제작까지 —{' '}
            <span className="text-white font-semibold">전기공사업 등록 법인이 직접 시공</span>합니다.
            현장 방문 견적은 출장비 없이 무료입니다.
          </p>

          {/* 등록번호 — 발주처가 바로 조회할 수 있는 식별자를 상단에 노출 */}
          <p
            className="animate-fade-up text-sm text-slate-400 mb-9"
            style={{ animationDelay: '0.24s' }}
          >
            전기공사업 등록{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.license}</span>
            {' · '}사업자{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.bizNumber}</span>
          </p>

          {/* CTA — 전화 1순위. 공사 사양이 복잡할수록 폼보다 통화 전환율이 높다. */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-4 mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            <a
              href={`tel:${COMPANY.mobile}`}
              className="inline-flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] text-[#0F172A] font-extrabold text-xl px-10 py-5 rounded-lg transition-all shadow-lg shadow-black/30 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Phone className="w-6 h-6" />
              {COMPANY.mobile}
            </a>
            <Link
              href="#quote"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-bold text-xl px-10 py-5 rounded-lg transition-all backdrop-blur-sm w-full sm:w-auto"
            >
              견적문의 남기기
            </Link>
          </div>
        </div>

        {/* 고객 유형 카드 — 공장(주력) 우선 */}
        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-3xl"
          style={{ animationDelay: '0.42s' }}
        >
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <button
                key={seg.label}
                onClick={() => handleSegmentClick(seg.href)}
                className={`group flex items-center gap-4 rounded-lg px-5 py-4 transition-all text-left border ${
                  seg.primary
                    ? 'bg-[#0A3D91] hover:bg-[#0A3D91]/90 border-[#0A3D91] shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0 ${
                    seg.primary ? 'bg-white/15' : 'bg-white/10'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white">{seg.label}</p>
                  <p className={`text-sm ${seg.primary ? 'text-blue-100' : 'text-slate-400'}`}>
                    {seg.sub}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
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
                className="bg-white/5 border-t-2 border-t-[#FF5500] border-x border-b border-white/10 rounded-b-lg backdrop-blur-sm px-4 py-5 flex flex-col items-center gap-2 text-center"
              >
                <Icon className="w-7 h-7 text-[#FF5500]" />
                <span className="font-bold text-white text-base tracking-tight">{stat.label}</span>
                <span
                  className={`text-sm text-slate-400 ${stat.mono ? 'font-mono tabular-nums' : ''}`}
                >
                  {stat.sub}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
