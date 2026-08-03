'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CornerMarks } from '@/components/redesign/Chrome';
import type { PortfolioItem } from '@/content/portfolio';

/**
 * 시공 실적 원장 — 목록 + 상세 패널.
 *
 * 디자인 원본: Claude Design `WNJ 시공실적 (1b).dc.html`
 *
 * [행을 링크로 만든 이유]
 * 원본은 행을 onClick 선택으로만 둔다. 그대로 옮기면 8개 상세 페이지
 * (`/portfolio/{slug}`)로 가는 내부 링크가 이 페이지에서 사라져, 사이트맵에만
 * 존재하는 고아 페이지가 된다. 그래서 행을 진짜 <a href>로 만들고 클릭은
 * preventDefault로 가로채 패널만 바꾼다. 결과적으로
 *   - 크롤러는 8개 링크를 그대로 따라가고
 *   - 사용자는 페이지 이동 없이 즉시 훑어보고
 *   - 새 탭·가운데 클릭·JS 꺼짐도 정상 동작한다
 */

const CATEGORY_ORDER = ['factory', 'power', 'panel', 'interior'] as const;

export default function Ledger({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<string>('all');
  const [selectedSlug, setSelectedSlug] = useState<string>(items[0]?.slug ?? '');

  // 필터는 데이터에서 만든다 — 실적이 추가돼도 손댈 곳이 없다
  const filters = useMemo(() => {
    const counts = new Map<string, { label: string; n: number }>();
    for (const item of items) {
      const prev = counts.get(item.category);
      counts.set(item.category, { label: item.categoryLabel, n: (prev?.n ?? 0) + 1 });
    }
    return [
      { key: 'all', label: `전체 (${items.length})` },
      ...CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({
        key: c as string,
        label: `${counts.get(c)!.label} (${counts.get(c)!.n})`,
      })),
    ];
  }, [items]);

  const visible = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const selected = items.find((i) => i.slug === selectedSlug) ?? visible[0] ?? items[0];

  function pickFilter(key: string) {
    setFilter(key);
    // 필터를 바꿨는데 선택된 항목이 목록에서 사라지면 빈 패널이 남는다.
    // 새 목록의 첫 항목으로 옮겨 준다.
    const next = key === 'all' ? items : items.filter((i) => i.category === key);
    if (next.length && !next.some((i) => i.slug === selectedSlug)) {
      setSelectedSlug(next[0].slug);
    }
  }

  if (!selected) return null;

  return (
    <>
      {/* ── 필터 ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 4 }} role="group" aria-label="공종 필터">
        {filters.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => pickFilter(f.key)}
              aria-pressed={active}
              className="display"
              style={{
                fontSize: 14.5,
                padding: '10px 18px',
                border: '1px solid var(--color-divider)',
                marginRight: -1,
                cursor: 'pointer',
                background: active ? 'var(--color-accent)' : 'transparent',
                color: active ? 'var(--color-bg)' : 'var(--color-text)',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))',
          gap: 'clamp(24px,3vw,40px)',
          alignItems: 'start',
          paddingTop: 'clamp(24px,3vw,36px)',
        }}
      >
        {/* ── 목록 ── */}
        <div
          className="blueprint"
          style={{ position: 'relative', padding: '4px 18px 8px', background: 'rgba(242,242,243,0.6)' }}
        >
          <CornerMarks />
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {visible.map((item, i) => {
              const active = item.slug === selected.slug;
              return (
                <li key={item.slug}>
                  <a
                    href={`/portfolio/${item.slug}`}
                    onClick={(e) => {
                      // 새 탭·다운로드 의도는 그대로 브라우저에 넘긴다
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      // 좁은 화면에서는 상세 패널이 목록 아래로 내려가 화면 밖에 있다.
                      // 패널만 바꾸면 눌러도 아무 일도 없는 것처럼 보이므로 상세 페이지로 보낸다.
                      if (window.matchMedia('(max-width: 900px)').matches) return;
                      e.preventDefault();
                      setSelectedSlug(item.slug);
                    }}
                    aria-current={active ? 'true' : undefined}
                    className="ledger-row"
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      padding: '15px 6px',
                      borderBottom: '1px solid rgba(29,31,32,0.08)',
                      background: active ? 'rgba(89,128,166,0.10)' : 'transparent',
                    }}
                  >
                    <span className="display" style={{ fontSize: 15, color: 'var(--color-accent-700)', flex: 'none', width: 44 }}>
                      W-{String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 14.5, lineHeight: 1.35 }}>
                        {item.title}
                      </span>
                      <span className="text-muted" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                        {item.facility} · {item.location}
                      </span>
                    </span>
                    <span
                      className="tag"
                      style={{
                        flex: 'none',
                        fontSize: 10.5,
                        background: 'transparent',
                        border: '1px solid var(--color-accent)',
                        color: 'var(--color-accent-700)',
                      }}
                    >
                      {item.categoryLabel}
                    </span>
                    <ArrowRight size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)', flex: 'none' }} />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-muted" style={{ fontSize: 11.5, margin: '12px 6px 8px' }}>
            총 {visible.length}건 표시 중 · 준공 실적 순차 추가
          </p>
        </div>

        {/* ── 상세 ── */}
        <article
          data-ledger-panel
          className="blueprint elev-md"
          style={{ position: 'relative', background: 'var(--color-bg)', padding: 'clamp(20px,2.5vw,30px)' }}
        >
          <CornerMarks />
          <p
            className="display"
            style={{
              fontSize: 12,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-700)',
              margin: '0 0 10px',
            }}
          >
            Work Record — W-{String(items.indexOf(selected) + 1).padStart(2, '0')}
          </p>
          <h2 style={{ fontSize: 'clamp(24px,2.6vw,32px)', lineHeight: 1.15, margin: '0 0 8px' }}>
            {selected.title}
          </h2>
          <p className="text-muted" style={{ fontSize: 13, margin: '0 0 16px' }}>
            {selected.facility} · {selected.region} {selected.location} ·{' '}
            <span className="tag" style={{ fontSize: 10.5, verticalAlign: 1 }}>{selected.categoryLabel}</span>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>{selected.summary}</p>

          {/* 현장 수치 — 확정값만 쓴다. 미확인은 '확인 중'으로 두고 추정치를 넣지 않는다. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              border: '1px solid var(--color-divider)',
              marginBottom: 20,
            }}
          >
            <Spec label="계약전력" value={selected.specs?.contractPower} />
            <Spec label="공사 기간" value={selected.specs?.duration} />
            <Spec label="상태" value="준공" confirmed />
          </div>

          <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 8px' }}>공사 범위</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {selected.scopeItems.map((s) => (
              <span key={s} className="tag" style={{ fontSize: 11.5 }}>{s}</span>
            ))}
          </div>

          <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 8px' }}>이 공종의 과제</p>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              margin: '0 0 20px',
              opacity: 0.8,
              borderLeft: '2px solid var(--color-accent)',
              paddingLeft: 14,
            }}
          >
            {selected.challenge}
          </p>

          <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 10px' }}>시공 단계</p>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--color-divider)',
              marginLeft: 5,
              marginBottom: 22,
              padding: 0,
              listStyle: 'none',
            }}
          >
            {selected.work.map((step, i) => (
              <li key={step} style={{ position: 'relative', padding: '0 0 14px 22px' }}>
                <span className="rail-node" style={{ left: -5, top: 4, width: 9, height: 9 }} aria-hidden />
                <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                  <span className="display" style={{ color: 'var(--color-accent-700)', marginRight: 8 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <p
            className="text-muted"
            style={{
              fontSize: 11.5,
              margin: '0 0 18px',
              borderTop: '1px dashed var(--color-divider)',
              paddingTop: 12,
            }}
          >
            현장 사진은 확보 후 게재합니다 — 자리표시 이미지를 쓰지 않습니다.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              href="#quote"
              className="display blueprint btn-solid is-solid"
              data-cta-slot={`portfolio_cta_${selected.category}`}
              data-cta-variant="A"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15.5, padding: '12px 22px' }}
            >
              <CornerMarks />
              비슷한 공사 견적 문의
            </Link>
            <Link
              href={`/portfolio/${selected.slug}`}
              className="display btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 15, padding: '12px 18px' }}
            >
              이 현장 상세 페이지
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
            <Link
              href={`/services/${selected.category}`}
              className="display btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 15, padding: '12px 18px' }}
            >
              이 공종 상세 보기
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}

/** 현장 수치 한 칸. 미확인 값은 흐리게 — 확정값과 눈으로 구분되게 둔다. */
function Spec({ label, value, confirmed }: { label: string; value?: string; confirmed?: boolean }) {
  const shown = value ?? '확인 중';
  const isConfirmed = confirmed || Boolean(value);
  return (
    <div style={{ padding: '12px 14px', borderRight: '1px solid var(--color-divider)' }}>
      <p className="text-muted" style={{ fontSize: 11, margin: '0 0 2px' }}>{label}</p>
      <p
        className="display"
        style={{
          fontSize: 17,
          margin: 0,
          color: isConfirmed ? 'var(--color-accent-700)' : 'rgba(29,31,32,0.45)',
        }}
      >
        {shown}
      </p>
    </div>
  );
}
