import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Factory, CircuitBoard, Lamp } from 'lucide-react';
import { COMPANY, VERIFY_LINKS } from '@/lib/site';
import { portfolioItems } from '@/content/portfolio';
import { SectionHead } from '@/components/redesign/Chrome';
import type { SiteContent } from '@/lib/content/schema';

const SHELL = { maxWidth: 1280, margin: '0 auto' } as const;
const PAD = 'clamp(44px,6vw,72px) clamp(16px,4vw,48px)';
const HAIRLINE = '1px solid var(--color-divider)';

/* ═══════════════════════════════════════════════════════════
   01 사업영역
   주력 카드만 액센트 6% 틴트로 무게를 준다 — 카드 3장이 같은 비중이면
   "무엇이 주력인가"가 전달되지 않는다(P4).
   ═══════════════════════════════════════════════════════════ */

const SERVICE_ICON: Record<string, typeof Factory> = {
  factory: Factory,
  panel: CircuitBoard,
  interior: Lamp,
};

export function Services({ content }: { content: SiteContent['services'] }) {
  return (
    <section id="services" style={{ borderTop: HAIRLINE }}>
      <div style={{ ...SHELL, padding: PAD }}>
        <SectionHead kicker="SERVICES" no="01" title={content.title} note={content.lead} gap={34} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 28,
          }}
        >
          {content.items.map((svc, i) => {
            const Icon = SERVICE_ICON[svc.id] ?? Factory;
            const primary = svc.tier === 'primary' && i === 0;
            return (
              <div
                key={svc.id}
                className="blueprint"
                style={{
                  position: 'relative',
                  padding: 26,
                  display: 'flex',
                  flexDirection: 'column',
                  background: primary ? 'rgba(0,71,255,0.04)' : undefined,
                  overflow: 'hidden',
                }}
              >
                {/* 대형 고스트 번호 — 카드 뒤에 크게 깔아 순서를 색이 아니라
                    덩어리로 알린다. 읽는 글자가 아니므로 스크린리더에서 뺀다. */}
                <span
                  aria-hidden
                  className="display"
                  style={{
                    position: 'absolute',
                    top: -18,
                    right: 6,
                    fontSize: 116,
                    lineHeight: 1,
                    letterSpacing: '-.05em',
                    color: 'rgba(10,10,10,0.05)',
                    pointerEvents: 'none',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                  <Icon size={30} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {svc.tier === 'primary' && (
                      <span className="tag display" style={{ letterSpacing: '.08em' }}>주력</span>
                    )}
                    <span className="display" style={{ fontSize: 15, letterSpacing: '.12em', color: 'var(--color-text-4)' }}>
                      A-{String(i + 1).padStart(2, '0')}
                    </span>
                  </span>
                </div>

                <h3 style={{ position: 'relative', fontSize: 24, margin: '0 0 8px' }}>{svc.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px', opacity: 0.85 }}>{svc.detail}</p>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, margin: '0 0 14px', padding: 0, listStyle: 'none', fontSize: 13.5 }}>
                  {svc.points.map((point) => (
                    <li key={point} style={{ display: 'flex', gap: 8 }}>
                      <Check size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)', flex: 'none', marginTop: 2 }} />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* 대상 배지 — 어드민에서 편집하는 값이라 계속 노출한다 */}
                {svc.audiences.length > 0 && (
                  <p className="text-muted" style={{ fontSize: 12, margin: '0 0 16px' }}>
                    대상 — {svc.audiences.join(' · ')}
                  </p>
                )}

                <div
                  style={{
                    borderTop: HAIRLINE,
                    paddingTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <Link href={`/services/${svc.id}`} className="text-muted" style={{ fontSize: 12.5 }}>
                    시공 범위·절차 →
                  </Link>
                  <Link
                    href="#quote"
                    className="display"
                    data-cta-slot={`service_card_${svc.id}`}
                    data-cta-variant="A"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 15,
                      color: 'var(--color-accent-700)',
                    }}
                  >
                    이 공사 견적 문의
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   02 진행 절차 — 4단계를 "흐름"으로 그린다(.bp-flow).

   전에는 헤어라인 아래 4칸을 늘어놓기만 해서 순서가 아니라 목록으로 읽혔다.
   문의 → 견적 → 시공 → 사후관리는 순서 자체가 파는 내용이므로, 칸 위로
   레일을 통과시키고 각 단계의 시작점에 노드를, 칸 사이에 진행 방향 화살표를
   둔다. 레일과 화살표는 blueprint.css에 있고, 좁은 화면에서는 같은 규칙이
   세로로 돈다.
   ═══════════════════════════════════════════════════════════ */

export function Process({ content }: { content: SiteContent['process'] }) {
  return (
    /* 검은 밴드. 밝은 면이 계속 이어지면 스크롤이 한 덩어리로 흘러가는데,
       "우리가 일하는 방식"은 잠깐 멈춰 읽어야 하는 대목이라 면을 뒤집어
       구획을 만든다. 자격 섹션(04)과 함께 이 페이지의 두 검은 띠다. */
    <section
      id="process"
      className="bp-on-ink"
      style={{ background: 'var(--color-ink)', color: '#f4f5f6' }}
    >
      <div style={{ ...SHELL, padding: PAD }}>
        <SectionHead kicker="PROCESS" no="02" title={content.title} note={content.lead} gap={44} dark />
        {/* 칸 수를 CSS로 넘긴다 — 단계가 늘거나 줄어도 레일이 그대로 맞는다 */}
        <ol
          className="bp-flow"
          style={{ '--flow-cols': content.steps.length } as React.CSSProperties}
        >
          {content.steps.map((step) => (
            <li key={step.step} className="bp-flow-step">
              <span className="bp-flow-node" aria-hidden />
              <p className="display" style={{ fontSize: 40, margin: '0 0 6px', color: 'var(--color-accent-300)' }}>
                {step.step}
              </p>
              <h3 style={{ fontSize: 20, margin: '0 0 6px' }}>{step.title}</h3>
              {/* 소요 기간은 이 단계에 머무는 시간이다. 흐름 위에서 읽히도록
                  테두리를 둘러 다음 단계로 넘어가는 구간처럼 보이게 한다. */}
              <p
                className="display"
                style={{
                  display: 'inline-block',
                  fontSize: 12.5,
                  letterSpacing: '.06em',
                  color: 'var(--color-accent-300)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  padding: '2px 8px',
                  margin: '0 0 10px',
                }}
              >
                {step.duration}
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, opacity: 0.72 }}>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   03 시공 실적 — 원장 표
   사진이 없는 동안 실적을 카드로 흉내내면 빈 카드처럼 보인다.
   업계가 실제로 쓰는 형식(공사 원장)을 그대로 표로 낸다(P7).
   ═══════════════════════════════════════════════════════════ */

/** 공종별 태그 색 — 주력(공장)만 액센트, 나머지는 아웃라인·중립으로 위계를 준다 */
const TAG_STYLE: Record<string, React.CSSProperties> = {
  factory: { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' },
  power:   { border: '1px solid var(--color-accent)', color: 'var(--color-accent-700)' },
  panel:   { border: '1px solid var(--color-accent)', color: 'var(--color-accent-700)' },
  interior:{ background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)' },
};

export function PortfolioLedger() {
  return (
    <section id="portfolio" style={{ borderTop: HAIRLINE }}>
      <div style={{ ...SHELL, padding: PAD }}>
        <SectionHead
          kicker="WORKS"
          no="03"
          title="시공 실적"
          note="실제 진행한 공사 원장 — 현장 사진 순차 공개"
          gap={26}
          action={
            <Link href="/portfolio" className="display" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, color: 'var(--color-accent-700)' }}>
              전체 실적·상세 보기
              <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          }
        />
        <div
          className="blueprint"
          style={{ position: 'relative', padding: '6px clamp(12px,2vw,22px) 10px', background: 'rgba(242,242,243,0.6)' }}
        >
          <div className="bp-table-scroll">
            <table className="bp-table" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ width: 52 }}>NO</th>
                  <th style={{ width: 120 }}>공종</th>
                  <th>공사명</th>
                  <th style={{ width: 190 }}>시설</th>
                  <th style={{ width: 110 }}>지역</th>
                  <th style={{ width: 70 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {portfolioItems.map((item, i) => (
                  <tr key={item.slug}>
                    <td className="display">W-{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <span className="tag" style={TAG_STYLE[item.category] ?? TAG_STYLE.interior}>
                        {item.categoryLabel}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <Link href={`/portfolio/${item.slug}`} className="nav-link">
                        {item.title}
                      </Link>
                    </td>
                    <td className="text-muted">{item.facility}</td>
                    <td className="text-muted">{item.location}</td>
                    <td className="display" style={{ letterSpacing: '.06em', color: 'var(--color-accent-700)' }}>
                      준공
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted" style={{ fontSize: 11.5, margin: '10px 0 4px' }}>
            계약전력·공기 등 현장 수치는 발주처 확인 후 순차 기재합니다 — 추정치를 쓰지 않습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   04 검증 가능한 자격 (다크 필드)
   번호·주소·연락처는 lib/site.ts가 정본이다. 어드민에서 편집되지 않는다 —
   실수로 바뀌면 공공기관 조회가 어긋나 신뢰가 통째로 무너지기 때문이다.
   ═══════════════════════════════════════════════════════════ */

export function Credentials({ content }: { content: SiteContent['whyus'] }) {
  const cards = [
    {
      kicker: '전기공사업 등록',
      value: COMPANY.license,
      note: '전기공사협회 종합정보시스템에서 업체·실적 조회 가능',
      verify: { label: '전기공사협회 조회', href: VERIFY_LINKS.keca },
    },
    {
      kicker: '사업자 등록',
      value: COMPANY.bizNumber,
      note: '국세청 홈택스에서 사업자 상태·진위 확인 가능',
      verify: { label: '홈택스 조회', href: VERIFY_LINKS.hometax },
    },
    {
      kicker: '법인 등록',
      value: COMPANY.corpNumber,
      note: content.corpNote,
      verify: null,
    },
  ];

  const facts = [
    ['상호 / 대표', `${COMPANY.name} · ${COMPANY.ceo}`],
    ['주소', COMPANY.address.full],
    ['업종', content.industry],
    ['시공 지역', '대구 전 지역 · 경북 (경산·영천·칠곡·구미 등)'],
    ['연락처', `${COMPANY.phone} · ${COMPANY.mobile}`],
    ['영업시간', '평일 09:00–18:00 · 토 09:00–13:00 · 긴급 A/S 상시'],
  ];

  return (
    <section id="credentials" style={{ background: 'var(--color-ink)', color: '#f4f5f6' }}>
      <div style={{ ...SHELL, padding: PAD }}>
        <SectionHead kicker="CREDENTIALS" no="04" title={content.title} note={content.lead} gap={40} dark />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 28,
            marginBottom: 40,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.kicker}
              className="blueprint bp-on-dark"
              style={{ position: 'relative', padding: 24 }}
            >
              <p
                className="display"
                style={{
                  fontSize: 12,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-300)',
                  margin: '0 0 10px',
                }}
              >
                {card.kicker}
              </p>
              <p className="display mono-num" style={{ fontSize: 36, margin: '0 0 8px' }}>
                {card.value}
              </p>
              <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6, margin: card.verify ? '0 0 16px' : 0 }}>
                {card.note}
              </p>
              {card.verify && (
                <a
                  href={card.verify.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="display"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 14,
                    color: '#f4f5f6',
                    border: '1px solid rgba(242,242,243,.35)',
                    padding: '8px 14px',
                  }}
                >
                  {card.verify.label}
                  <ExternalLink size={13} strokeWidth={1.5} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* 회사 개요 사실 표 — LocalBusiness JSON-LD와 1:1로 맞춘다 (스펙 §7-2) */}
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
            gap: '0 56px',
            borderTop: '1px solid rgba(242,242,243,.18)',
            margin: 0,
          }}
        >
          {facts.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                padding: '12px 0',
                borderBottom: '1px solid rgba(242,242,243,.12)',
                fontSize: 13.5,
              }}
            >
              <dt style={{ opacity: 0.6, flex: 'none' }}>{label}</dt>
              <dd style={{ textAlign: 'right', margin: 0 }}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   05 비용 기준
   금액을 못 밝히면 "무엇이 금액을 정하는가"를 밝힌다(P6).
   ═══════════════════════════════════════════════════════════ */

export function Pricing({ content }: { content: SiteContent['pricing'] }) {
  return (
    <section id="pricing" style={{ borderTop: HAIRLINE }}>
      <div style={{ ...SHELL, padding: PAD }}>
        <SectionHead kicker="PRICING" no="05" title={content.title} gap={40} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
            gap: 'clamp(28px,4vw,56px)',
            alignItems: 'start',
          }}
        >
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>
              <Emphasise text={content.lead} highlight={content.leadHighlight} />
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: HAIRLINE }}>
              {content.variables.map((v) => (
                <div key={v.no} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: HAIRLINE }}>
                  <span className="display" style={{ fontSize: 18, color: 'var(--color-accent-700)', flex: 'none', width: 28 }}>
                    {v.no}
                  </span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{v.title}</p>
                    <p className="text-muted" style={{ fontSize: 13, margin: '2px 0 0', lineHeight: 1.55 }}>
                      {v.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {content.promise && (
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  margin: '18px 0 0',
                  padding: '14px 16px',
                  border: HAIRLINE,
                  background: 'rgba(0,71,255,0.04)',
                }}
              >
                <strong>약속</strong> — {content.promise}
              </p>
            )}
          </div>

          <div className="blueprint" style={{ position: 'relative', padding: '6px clamp(12px,2vw,22px) 10px' }}>
            <div className="bp-table-scroll">
              <table className="bp-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>대표 작업 항목</th>
                    <th style={{ width: 140 }}>대상</th>
                    <th style={{ width: 200 }}>비용 산정 기준</th>
                  </tr>
                </thead>
                <tbody>
                  {content.items.map((item, i) => (
                    <tr key={`${item.work}-${i}`}>
                      <td style={{ fontWeight: 500 }}>{item.work}</td>
                      <td className="text-muted">{item.audience}</td>
                      <td>{item.priceLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.footnote && (
              <p className="text-muted" style={{ fontSize: 11.5, margin: '10px 0 4px' }}>
                {content.footnote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   오시는 길 — 3컬럼(연락처 / 주소 / 약도)
   ═══════════════════════════════════════════════════════════ */

export function Contact({ content }: { content: SiteContent['contact'] }) {
  const { lat, lng } = COMPANY.geo;
  const mapHref = `https://map.kakao.com/link/map/${encodeURIComponent(COMPANY.name)},${lat},${lng}`;

  return (
    <section id="contact" style={{ borderTop: HAIRLINE }}>
      <div
        style={{
          ...SHELL,
          padding: 'clamp(36px,5vw,56px) clamp(16px,4vw,48px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 'clamp(24px,4vw,48px)',
          alignItems: 'start',
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, margin: '0 0 14px' }}>연락처</h2>
          <div style={{ fontSize: 13.5, lineHeight: 2 }}>
            <p style={{ margin: 0 }}>
              대표 전화{' '}
              <a href={`tel:${COMPANY.phone}`} className="display mono-num" style={{ fontSize: 15 }}>
                {COMPANY.phone}
              </a>
            </p>
            <p style={{ margin: 0 }}>
              모바일{' '}
              <a href={`tel:${COMPANY.mobile}`} className="display mono-num" style={{ fontSize: 15 }}>
                {COMPANY.mobile}
              </a>
            </p>
            <p style={{ margin: 0 }}>
              팩스 <span className="display mono-num" style={{ fontSize: 15 }}>{COMPANY.fax}</span>
            </p>
            <p style={{ margin: 0 }}>
              이메일 <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 20, margin: '0 0 14px' }}>오시는 길</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: '0 0 6px' }}>{COMPANY.address.full}</p>
          <p className="text-muted" style={{ fontSize: 12.5, margin: '0 0 6px' }}>
            {content.hours} · {content.hoursNote}
          </p>
          <p className="text-muted" style={{ fontSize: 12.5, margin: 0 }}>
            <strong style={{ color: 'var(--color-text)' }}>시공 가능 지역</strong> — {content.serviceArea}
          </p>
        </div>

        <figure className="blueprint" style={{ position: 'relative', padding: 14, margin: 0 }}>
          <svg
            viewBox="0 0 360 150"
            style={{ width: '100%', color: 'var(--color-accent-600)' }}
            fill="none"
            stroke="currentColor"
            role="img"
            aria-label={`약도 — ${COMPANY.address.full}. 문화로와 문화로63길이 만나는 지점.`}
          >
            <path d="M0 108 H360" strokeWidth="10" opacity=".18" />
            <path d="M0 108 H360" strokeWidth="1" />
            <path d="M96 0 V150" strokeWidth="7" opacity=".18" />
            <path d="M96 0 V150" strokeWidth="1" />
            <path d="M96 40 H250 V108" strokeWidth="4" opacity=".18" />
            <path d="M96 40 H250 V108" strokeWidth="1" strokeDasharray="4 4" />
            <text x="8" y="100" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">문화로</text>
            <text x="104" y="14" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="11">문화로63길</text>
            <circle cx="250" cy="74" r="5" fill="currentColor" stroke="none" />
            <path d="M250 74 l30 -26" strokeWidth="1" />
            <text x="284" y="44" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="12" fontWeight="600">우앤주전력</text>
            <text x="284" y="58" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="10" opacity=".7">평리동 1F</text>
          </svg>
          <figcaption
            className="display"
            style={{
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--color-text-3)',
            }}
          >
            <span>MAP — 평리동</span>
            <a href={mapHref} target="_blank" rel="noopener noreferrer">카카오맵 열기 →</a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** 문장 안의 한 구절만 굵게 */
function Emphasise({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>;
  const i = text.indexOf(highlight);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong>{highlight}</strong>
      {text.slice(i + highlight.length)}
    </>
  );
}
