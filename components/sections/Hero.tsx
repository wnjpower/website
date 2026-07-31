import { ArrowRight } from 'lucide-react';
import { COMPANY } from '@/lib/site';
import { CtaButton } from '@/components/ui/cta';
import { Icon } from '@/components/ui/icon';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

/**
 * 첫 화면. 문구·지표·버튼이 전부 어드민에서 편집된다.
 *
 * 신뢰 지표는 형용사가 아니라 조회 가능한 번호·기간으로 제시한다는 원칙을 지킨다
 * ("업력 20년+"는 법인 설립 2023년과 어긋나므로 '대표 현장경력'으로 표기).
 */
export default function Hero({
  content,
  ctas,
}: {
  content: SiteContent['hero'];
  ctas: Record<CtaSlot, Cta>;
}) {
  const titleLines = content.title.split('\n').filter(Boolean);
  const hasBackground = Boolean(content.backgroundImage);

  return (
    <section
      id="hero"
      className={`relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 ${hasBackground ? 'bg-brand-dark' : 'tech-dark'}`}
    >
      {/* 배경 사진(선택). 없으면 도면 패턴 배경이 그대로 쓰인다. */}
      {hasBackground && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(10,33,56,0.94), rgba(10,33,56,0.72)), url(${content.backgroundImage})`,
          }}
        />
      )}

      {/* 사진이 없을 때의 단선결선도 라인아트 — 전기 엔지니어링의 인상을 사진 없이 만든다 */}
      {!hasBackground && (
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
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {content.eyebrow && (
            <p
              className="animate-fade-up inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-slate-300 mb-5"
              style={{ animationDelay: '0.02s' }}
            >
              <span className="rule-accent" aria-hidden />
              {content.eyebrow}
            </p>
          )}

          <h1
            className="animate-fade-up text-[2rem] sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] tracking-tight mb-6"
            style={{ animationDelay: '0.06s' }}
          >
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            className="animate-fade-up text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-6"
            style={{ animationDelay: '0.16s' }}
          >
            <Highlighted text={content.lead} highlight={content.leadHighlight} />
          </p>

          <p className="animate-fade-up text-sm text-slate-400 mb-9" style={{ animationDelay: '0.22s' }}>
            전기공사업 등록{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.license}</span>
            {'  ·  '}사업자{' '}
            <span className="font-mono tabular-nums text-slate-200">{COMPANY.bizNumber}</span>
          </p>

          {/* CTA — 전화 1순위. 공사 사양이 복잡할수록 폼보다 통화 전환율이 높다. */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-8"
            style={{ animationDelay: '0.28s' }}
          >
            <CtaButton cta={ctas.hero_primary} size="lg" />
            <CtaButton cta={ctas.hero_secondary} size="lg" />
          </div>

          {/* 고객 유형 라우팅 — 큰 카드로 시선을 뺏지 않고 조용한 안내 링크로 둔다 */}
          {content.segments.length > 0 && (
            <div
              className="animate-fade-up flex flex-col sm:flex-row gap-2.5"
              style={{ animationDelay: '0.36s' }}
            >
              {content.segments.map((seg) => (
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
          )}
        </div>

        {/* 신뢰 지표 — 헤어라인으로 나눈 조용한 지표 행 */}
        {content.trustStats.length > 0 && (
          <div
            className="animate-fade-up mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/10 bg-white/10"
            style={{ animationDelay: '0.48s' }}
          >
            {content.trustStats.map((stat) => (
              <div key={stat.label} className="bg-brand-dark/80 px-5 py-6 flex flex-col gap-2">
                <Icon name={stat.icon} className="w-6 h-6 text-slate-400" />
                <span className="font-bold text-white text-[0.9375rem] leading-tight">{stat.label}</span>
                <span className={`text-sm text-slate-400 ${stat.mono ? 'font-mono tabular-nums' : ''}`}>
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 설명 문구 안의 특정 구절만 흰색 굵게 강조한다.
 *
 * 어드민이 문구를 통째로 바꿔도 강조가 유지되도록, 좌표가 아니라 "이 글자열"로
 * 찾는다. 문구를 고치면서 강조 문자열이 사라지면 강조 없이 평범하게 나온다.
 */
function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>;
  const index = text.indexOf(highlight);
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <span className="text-white font-semibold">{highlight}</span>
      {text.slice(index + highlight.length)}
    </>
  );
}
