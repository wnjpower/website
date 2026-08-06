import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

/**
 * 히어로 — 2컬럼(카피 + 공장 배선 평면도) + 신뢰 지표 4칸.
 *
 * 오른쪽 도면은 사진 대신 쓰는 장치다. 현장 사진이 아직 없는데 스톡 사진을 넣으면
 * 실제 시공 사진으로 오인되므로(사실 원칙), 이 업의 언어인 도면을 그린다.
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
    <section id="top" className="sheet">
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
              }}
            >
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
                className="display blueprint btn-solid"
                data-cta-slot={ctas.hero_primary.slot}
                data-cta-variant={ctas.hero_primary.variant}
                data-cta-id={ctas.hero_primary.id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 18, padding: '15px 30px' }}
              >
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
            <FactoryLayoutPlan />
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

/**
 * 공장 전기 배선 평면도.
 *
 * 원래 이 자리에는 수전설비 단선결선도가 있었다. 결선도는 전기를 하는 사람에게는
 * 읽히지만, 공장을 짓는 발주처 눈에는 "내 건물"로 보이지 않는다. 평면도로 바꾸면
 * 전기실이 어디에 앉고, 간선이 어느 경로로 지나가고, 생산설비까지 어떻게
 * 내려오는지가 한 장에 보인다 — 우리가 파는 것이 곧 이 그림이다.
 *
 * 특정 현장의 도면이 아니므로 캡션에 "예시"를 명시한다(사실 원칙).
 * 현장 사진을 받으면 이 자리를 사진이 대신한다.
 */
function FactoryLayoutPlan() {
  /** 동력 분기 3계통 — 간선에서 차단기를 거쳐 생산설비로 내려간다 */
  const feeders = [
    { x: 250, label: '생산설비 #1' },
    { x: 330, label: '생산설비 #2' },
    { x: 410, label: '생산설비 #3' },
  ];
  /** 조명·전열 회로에 달리는 등기구 */
  const lamps = [235, 285, 335];

  return (
    <figure
      className="blueprint"
      style={{
        position: 'relative',
        padding: 'clamp(16px,2vw,26px) clamp(16px,2vw,26px) 14px',
        background: 'var(--color-bg)',
        margin: 0,
      }}
    >
      <svg
        viewBox="0 0 520 360"
        style={{ width: '100%', color: 'var(--color-accent-600)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        role="img"
        aria-label="공장 전기 배선 평면도 예시 — 전기실의 수전반·변압기에서 나온 간선이 생산동을 가로지르고, 차단기를 거쳐 생산설비 동력반 3계통과 조명·전열 분전반, 사무동 분전반으로 분기되는 구성"
      >
        {/* 도면 표제 */}
        <text x="10" y="16" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="12" letterSpacing="2">
          ELECTRICAL LAYOUT PLAN — 22.9kV / 380V
        </text>
        <text x="510" y="16" textAnchor="end" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10" opacity=".6">
          N.T.S.
        </text>

        {/* 건물 외벽 — 이중선. 하단 372~432 구간은 출입 셔터로 비워 둔다 */}
        <path d="M40 312 V40 H470 V312 H432 M372 312 H40" />
        <path d="M45 307 V45 H465 V307 H432 M372 307 H45" />
        <path d="M372 307 V312 M432 307 V312" />
        <path d="M372 309.5 H432" strokeWidth="1" opacity=".45" />

        {/* 전기실 — 수전반 + 변압기. 외벽에 붙은 방이라 칸막이(ㄴ자)만 그린다 */}
        <path d="M45 140 H170 V45" />
        <text x="54" y="68" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">전기실 · 수전반</text>
        <rect x="58" y="80" width="26" height="34" />
        <path d="M58 90 H84 M58 100 H84" strokeWidth="1" opacity=".7" />
        <circle cx="110" cy="92" r="10" />
        <circle cx="110" cy="106" r="10" />
        <text x="54" y="132" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="9.5" opacity=".85">
          TR 500kVA 22.9kV/380V
        </text>

        {/* 간선 — 변압기에서 나와 생산동을 가로지르고, 사무동 분전반까지 내려간다 */}
        <path d="M122 106 H140 V258" />
        <path d="M140 182 H452" strokeWidth="3" />
        <circle cx="140" cy="182" r="3" fill="currentColor" stroke="none" />
        <text x="170" y="176" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">BUS DUCT 800A</text>
        <text x="196" y="150" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11" opacity=".7">생산동</text>

        {/* 동력 분기 — 간선 → 차단기 → 생산설비 */}
        {feeders.map((f) => (
          <g key={f.x}>
            <path d={`M${f.x} 182 V214 M${f.x} 234 V252`} />
            <rect x={f.x - 8} y="214" width="16" height="20" />
            <path d={`M${f.x - 8} 214 l16 20 M${f.x + 8} 214 l-16 20`} />
            <circle cx={f.x} cy="266" r="14" />
            <text x={f.x} y="271" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="13">M</text>
            <text x={f.x} y="296" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10">{f.label}</text>
          </g>
        ))}

        {/* 조명·전열 분전반과 회로 */}
        <path d="M390 182 V120" />
        <rect x="372" y="92" width="36" height="28" />
        <path d="M380 100 H400 M380 106 H400 M380 112 H400" strokeWidth="1" opacity=".7" />
        <text x="366" y="86" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10">분전반 L-1</text>
        {/* 회로는 마지막 등기구에서 끝난다 — 허공으로 뻗은 꼬리를 만들지 않는다 */}
        <path d="M372 106 H235" strokeDasharray="5 6" opacity=".65" />
        {lamps.map((x) => (
          <g key={x}>
            <circle cx={x} cy="106" r="7" fill="var(--color-bg)" />
            <path d={`M${x - 5} 101 l10 10 M${x + 5} 101 l-10 10`} />
          </g>
        ))}
        <text x="228" y="128" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10" opacity=".8">조명·전열 회로</text>

        {/* 사무·부속동 — 여기도 외벽에 붙은 방이라 칸막이만 그린다 */}
        <path d="M45 246 H170 V307" />
        <text x="54" y="262" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5">사무·부속동</text>
        <rect x="124" y="258" width="34" height="26" />
        <path d="M131 266 H151 M131 273 H151" strokeWidth="1" opacity=".7" />
        <text x="118" y="298" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="9.5" opacity=".85">분전반 L-2</text>

        {/* 치수선 */}
        <g strokeWidth="1" opacity=".45">
          <path d="M40 312 V342 M470 312 V342" />
          <path d="M470 40 H500 M470 312 H500" />
        </g>
        <g strokeWidth="1" opacity=".7">
          <path d="M40 336 H470 M33 343 l14 -14 M463 343 l14 -14" />
          <path d="M494 40 V312 M487 47 l14 -14 M487 319 l14 -14" />
        </g>
        <text x="255" y="331" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10.5" opacity=".8">
          60,000
        </text>
        <text
          x="508"
          y="176"
          transform="rotate(-90 508 176)"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontFamily="var(--font-display)"
          fontSize="10.5"
          opacity=".8"
        >
          36,000
        </text>
      </svg>
      <figcaption
        className="display"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontSize: 11,
          color: 'var(--color-text-3)',
        }}
      >
        <span>FIG.01 — 공장 전기 배선 평면도 (예시)</span>
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
