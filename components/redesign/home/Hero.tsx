import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { COMPANY } from '@/lib/site';
import { CornerMarks } from '@/components/redesign/Chrome';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

/**
 * 히어로 — 2컬럼(카피 + 단선결선도) + 신뢰 지표 4칸.
 *
 * 오른쪽 도면은 사진 대신 쓰는 장치다. 현장 사진이 아직 없는데 스톡 사진을 넣으면
 * 실제 시공 사진으로 오인되므로(사실 원칙), 이 업의 언어인 단선결선도를 그린다.
 * 순수 SVG라 파일을 받지 않고 어떤 화면에서도 선명하다.
 */
export default function Hero({
  content,
  ctas,
}: {
  content: SiteContent['hero'];
  ctas: Record<CtaSlot, Cta>;
}) {
  const titleLines = content.title.split('\n').filter(Boolean);
  const hasPhoto = Boolean(content.backgroundImage);

  return (
    <section id="top" className="grid-field">
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,48px) clamp(32px,4vw,56px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
            gap: 'clamp(28px,4vw,64px)',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              className="display"
              style={{
                fontSize: 13,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-700)',
                margin: '0 0 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <PlusMark />
              {content.eyebrow}
            </p>

            <h1 style={{ fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: 1.06, margin: '0 0 22px' }}>
              {titleLines.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </h1>

            <p style={{ fontSize: 'clamp(15px,1.3vw,17px)', lineHeight: 1.65, maxWidth: 560, margin: '0 0 10px' }}>
              <Highlighted text={content.lead} highlight={content.leadHighlight} />
            </p>
            {content.note && (
              <p className="text-muted" style={{ fontSize: 14, margin: '0 0 30px' }}>
                {content.note}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Link
                href={ctas.hero_primary.href}
                className="display blueprint btn-solid is-solid"
                data-cta-slot={ctas.hero_primary.slot}
                data-cta-variant={ctas.hero_primary.variant}
                data-cta-id={ctas.hero_primary.id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 18, padding: '15px 30px' }}
              >
                <CornerMarks />
                {ctas.hero_primary.label}
                <ArrowRight size={17} strokeWidth={1.5} />
              </Link>
              <a
                href={ctas.hero_secondary.href}
                className="display btn-outline mono-num"
                data-cta-slot={ctas.hero_secondary.slot}
                data-cta-variant={ctas.hero_secondary.variant}
                data-cta-id={ctas.hero_secondary.id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 17, padding: '15px 24px' }}
              >
                {ctas.hero_secondary.icon && <Phone size={16} strokeWidth={1.5} />}
                {ctas.hero_secondary.label}
              </a>
            </div>
          </div>

          {hasPhoto ? (
            <figure className="blueprint" style={{ position: 'relative', padding: 14, margin: 0 }}>
              <CornerMarks />
              {/* 사장님이 어드민에서 올린 사진. 액센트 단색조로 덮어 도면 톤과 맞춘다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.backgroundImage}
                alt="우앤주전력 시공 현장"
                className="duotone-img"
                style={{ width: '100%', display: 'block' }}
              />
            </figure>
          ) : (
            <SingleLineDiagram />
          )}
        </div>

        {/* 신뢰 지표 — 헤어라인으로 나눈 4칸 */}
        {content.trustStats.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              marginTop: 'clamp(28px,4vw,52px)',
              borderTop: '1px solid var(--color-divider)',
            }}
          >
            {content.trustStats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                style={{
                  padding: '18px 20px 4px',
                  borderLeft: i === 0 ? undefined : '1px solid var(--color-divider)',
                }}
              >
                <p
                  className={stat.mono ? 'display mono-num' : 'display'}
                  style={{ fontSize: 26, margin: 0 }}
                >
                  {stat.label}
                </p>
                <p className="text-muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** 히어로 머리말 앞의 작은 "+" 정합 마크 */
function PlusMark() {
  return (
    <span style={{ width: 11, height: 11, position: 'relative', display: 'inline-block', flex: 'none' }} aria-hidden>
      <span style={{ position: 'absolute', left: 5, top: 0, width: 1, height: '100%', background: 'currentColor' }} />
      <span style={{ position: 'absolute', top: 5, left: 0, width: '100%', height: 1, background: 'currentColor' }} />
    </span>
  );
}

/**
 * 수전설비 단선결선도.
 *
 * 22.9kV 인입 → MOF → 변압기 → 주차단기 → 모선 → 동력/분전/조명 분기.
 * 실제 수전 구성을 따르는 도식이라, 이 업을 아는 발주처에게는 사진보다
 * 강한 신호가 된다. 장식이 아니므로 aria-label로 내용을 밝혀 둔다.
 */
function SingleLineDiagram() {
  return (
    <figure
      className="blueprint"
      style={{
        position: 'relative',
        padding: 'clamp(16px,2vw,26px) clamp(16px,2vw,26px) 14px',
        background: 'rgba(242,242,243,0.6)',
        margin: 0,
      }}
    >
      <CornerMarks />
      <svg
        viewBox="0 0 520 380"
        style={{ width: '100%', color: 'var(--color-accent-600)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        role="img"
        aria-label="수전설비 단선결선도 — 22.9kV 한전 인입에서 MOF, 변압기, 주차단기를 거쳐 동력 MCC·분전반·조명 회로로 분기되는 구성"
      >
        <text x="10" y="18" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="12" letterSpacing="2">
          SINGLE LINE DIAGRAM — 22.9kV RECEIVING
        </text>
        <path d="M60 40 v28" />
        <circle cx="60" cy="80" r="12" />
        <text x="80" y="84" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">MOF</text>
        <path d="M60 92 v26" />
        <circle cx="60" cy="132" r="14" />
        <circle cx="60" cy="152" r="14" />
        <text x="84" y="146" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">TR 500kVA 22.9kV/380V</text>
        <path d="M60 166 v26" />
        <rect x="52" y="192" width="16" height="22" />
        <path d="M52 192 l16 22 M68 192 l-16 22" />
        <text x="84" y="207" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">MCCB 800A</text>
        <path d="M60 214 v26 M40 240 h420" strokeWidth="2.5" />
        <text x="466" y="234" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">BUS</text>
        <path d="M120 240 v34 M240 240 v34 M360 240 v34" />
        <rect x="112" y="274" width="16" height="18" />
        <path d="M112 274 l16 18 M128 274 l-16 18" />
        <rect x="232" y="274" width="16" height="18" />
        <path d="M232 274 l16 18 M248 274 l-16 18" />
        <rect x="352" y="274" width="16" height="18" />
        <path d="M352 274 l16 18 M368 274 l-16 18" />
        <path d="M120 292 v22 M240 292 v22 M360 292 v22" />
        <circle cx="120" cy="330" r="16" />
        <text x="114" y="335" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="13">M</text>
        <text x="100" y="366" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">동력 MCC</text>
        <rect x="222" y="314" width="36" height="30" />
        <path d="M230 322 h20 M230 330 h20 M230 338 h20" />
        <text x="216" y="366" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">분전반 L-1</text>
        <circle cx="360" cy="330" r="16" />
        <path d="M352 330 h16 M360 322 v16" />
        <text x="338" y="366" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">조명·전열</text>
        <path d="M60 40 h400" strokeDasharray="5 6" opacity=".5" />
        <text x="466" y="44" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11" opacity=".7">한전 인입</text>
      </svg>
      <figcaption
        className="display"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontSize: 11,
          color: 'rgba(29,31,32,0.55)',
        }}
      >
        <span>FIG.01 — 수전설비 단선결선도</span>
        <span>WNJ-2026-A</span>
      </figcaption>
    </figure>
  );
}

/** 설명 문구 안의 특정 구절만 굵게. 문구를 바꿔 강조어가 사라지면 조용히 평문이 된다. */
function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>;
  const index = text.indexOf(highlight);
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <strong style={{ fontWeight: 700 }}>{highlight}</strong>
      {text.slice(index + highlight.length)}
    </>
  );
}
