import Link from 'next/link';
import { ShieldCheck, CalendarClock, CircuitBoard, Wrench, ArrowRight } from 'lucide-react';
import { COMPANY } from '@/lib/site';
import { PhoneButton } from '@/components/ui/cta';

/* 히어로 하단 신뢰 지표 — 형용사가 아니라 조회 가능한 번호·기간으로 제시한다.
   "업력 20년+"는 법인 설립(2023)과 어긋나 오해를 사므로 '대표 현장경력'으로 정확히 표기.
   TODO(사장님 확인): 누적 시공 건수·배전반 제작 면수를 받으면 수치로 교체 가능. */
const trustStats = [
  { icon: ShieldCheck,   label: '전기공사업 등록', sub: COMPANY.license, mono: true },
  { icon: CalendarClock, label: '대표 현장경력 20년+', sub: '2023년 법인 설립', mono: false },
  { icon: CircuitBoard,  label: '배전반 자체 제작', sub: '중간 마진 없음', mono: false },
  { icon: Wrench,        label: 'A/S 당일 출동', sub: '준공 후 1년 보증', mono: false },
];

const segments = [
  { label: '공장·산업 전기공사', sub: '신축·증축·수전·배전반', href: '#services' },
  { label: '인테리어·일반 전기', sub: '상가·병원·주택', href: '#services' },
];

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden tech-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
      {/* 사진 대신: 미세한 단선결선도(one-line diagram) 라인아트. 전기 엔지니어링의
          인상을 사진 없이 만든다. 장식 요소이므로 aria-hidden. */}
      <svg
        aria-hidden
        viewBox="0 0 560 400"
        className="pointer-events-none absolute right-[-40px] top-1/2 hidden lg:block w-[560px] -translate-y-1/2 text-white/[0.07]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M40 60 H520" />
        <path d="M120 60 V200 M280 60 V200 M440 60 V200" />
        <circle cx="120" cy="230" r="26" />
        <rect x="256" y="204" width="48" height="52" rx="3" />
        <path d="M416 206 l24 22 M440 206 l-24 22" />
        <circle cx="428" cy="252" r="4" fill="currentColor" />
        <path d="M120 256 V320 M280 256 V320 M428 256 V320" />
        <path d="M40 320 H520" />
        <path d="M180 320 V360 M340 320 V360" />
        <rect x="160" y="356" width="40" height="26" rx="2" />
        <rect x="320" y="356" width="40" height="26" rx="2" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p
            className="animate-fade-up inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-slate-300 mb-5"
            style={{ animationDelay: '0.02s' }}
          >
            <span className="rule-accent" aria-hidden />
            대구·경북 공장·산업 전기공사 전문
          </p>

          <h1
            className="animate-fade-up text-[2rem] sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] tracking-tight mb-6"
            style={{ animationDelay: '0.06s' }}
          >
            공장 전기공사, 면허·제작·시공을
            <br className="hidden sm:block" /> 한 회사가 끝냅니다
          </h1>

          <p
            className="animate-fade-up text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-6"
            style={{ animationDelay: '0.16s' }}
          >
            공장 신축·증축·증설부터 수전설비·계약전력 증설·배전반 자체제작까지 —{' '}
            <span className="text-white font-semibold">전기공사업 등록 법인이 직접 시공</span>합니다.
            현장 방문 견적은 출장비 없이 무료입니다.
          </p>

          <p
            className="animate-fade-up text-sm text-slate-400 mb-9"
            style={{ animationDelay: '0.22s' }}
          >
            전기공사업 등록{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.license}</span>
            {'  ·  '}사업자{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.bizNumber}</span>
          </p>

          {/* CTA — 전화 1순위. 공사 사양이 복잡할수록 폼보다 통화 전환율이 높다.
              강조색(앰버)은 이 전화 버튼 한 곳에만 쓴다. */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-8"
            style={{ animationDelay: '0.28s' }}
          >
            <PhoneButton size="lg" />
            <Link
              href="#quote"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 text-[1.0625rem] sm:text-lg transition-all backdrop-blur-sm"
            >
              견적문의 남기기
            </Link>
          </div>

          {/* 고객 유형 라우팅 — 큰 카드로 시선을 뺏지 않고, 조용한 안내 링크로 둔다 */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-2.5"
            style={{ animationDelay: '0.36s' }}
          >
            {segments.map((seg) => (
              <a
                key={seg.label}
                href={seg.href}
                className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 hover:border-white/25 transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-white">{seg.label}</span>
                  <span className="block text-xs text-slate-400">{seg.sub}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* 신뢰 지표 — 오렌지 상단선 카드 대신, 헤어라인으로 나눈 조용한 지표 행 */}
        <div
          className="animate-fade-up mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/10 bg-white/10"
          style={{ animationDelay: '0.48s' }}
        >
          {trustStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-brand-dark/80 px-5 py-6 flex flex-col gap-2">
                <Icon className="w-6 h-6 text-slate-400" />
                <span className="font-bold text-white text-[0.9375rem] leading-tight">{stat.label}</span>
                <span className={`text-sm text-slate-400 ${stat.mono ? 'font-mono tabular-nums' : ''}`}>
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
