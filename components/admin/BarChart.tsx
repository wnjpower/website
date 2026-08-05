'use client';

import { useState, useId } from 'react';

/**
 * 단일 계열 막대 차트.
 *
 * 축은 하나뿐이다. 세션과 문의처럼 자릿수가 다른 값을 한 그래프에 겹쳐 그리면
 * 축을 두 개 두게 되는데, 그러면 "어느 쪽이 더 큰가"가 눈금 설정에 따라 바뀌어
 * 사실상 아무 의미가 없는 그림이 된다. 그래서 계열마다 같은 x축을 공유하는
 * 작은 차트를 따로 그린다(small multiples).
 *
 * 색상은 대비·색각 이상 분리도를 통과한 값만 쓴다. 파랑↔주황 한 쌍은 가장
 * 안전한 조합이고, 파랑을 블루프린트 액센트 계열(accent-700)로 맞춰
 * 사이트 팔레트 안에 머문다.
 *
 * 모서리는 깎지 않는다 — 이 디자인 시스템에 둥근 모서리는 없다.
 */

export const CHART_COLORS = {
  /** 방문·트래픽 계열 — 블루프린트 액센트 */
  traffic: '#416180',
  /** 전환(문의·전화) 계열 — 대비되는 번트 앰버 */
  conversion: '#C2620E',
} as const;

export interface BarDatum {
  label: string;
  value: number;
}

export default function BarChart({
  data,
  color,
  height = 96,
  valueSuffix = '',
  emptyMessage = '아직 데이터가 없습니다',
}: {
  data: BarDatum[];
  color: string;
  height?: number;
  valueSuffix?: string;
  emptyMessage?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height, fontSize: 13 }}>
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  // 막대 사이 2px 간격. 막대가 아주 많아지면 간격이 막대보다 넓어지므로 비율로 준다.
  const slot = 100 / data.length;
  const gapRatio = data.length > 40 ? 0.1 : 0.25;

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={`시간대별 추이. 최고 ${data[peakIndex].value}${valueSuffix} (${data[peakIndex].label})`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.72" />
          </linearGradient>
        </defs>

        {/* 기준선 — 표의 헤어라인과 같은 값 */}
        <line x1="0" y1={height - 0.5} x2="100" y2={height - 0.5} stroke="rgba(29,31,32,0.16)" strokeWidth="1" />

        {data.map((d, i) => {
          const barWidth = slot * (1 - gapRatio);
          const x = i * slot + (slot - barWidth) / 2;
          const h = d.value === 0 ? 0 : Math.max(2, (d.value / max) * (height - 6));
          const isHovered = hover === i;

          return (
            <g key={i}>
              {/* 값이 0이어도 마우스를 올릴 수 있도록 투명 히트 영역을 깐다 */}
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              {h > 0 && (
                <rect
                  x={x}
                  y={height - h}
                  width={barWidth}
                  height={h}
                  fill={`url(#${gradientId})`}
                  opacity={hover === null || isHovered ? 1 : 0.45}
                  className="transition-opacity pointer-events-none"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* 툴팁 — 막대 위에 겹치지 않게 상단 고정 */}
      {hover !== null && (
        <div
          className="display absolute top-0 pointer-events-none z-10 -translate-x-1/2 elev-md"
          style={{
            left: `${((hover + 0.5) / data.length) * 100}%`,
            background: 'var(--color-accent-900)',
            color: '#f2f2f3',
            padding: '4px 9px',
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          <span className="mono-num" style={{ fontWeight: 600 }}>
            {data[hover].value.toLocaleString('ko-KR')}
            {valueSuffix}
          </span>
          <span style={{ opacity: 0.65, marginLeft: 7 }}>{data[hover].label}</span>
        </div>
      )}

      {/* x축 양 끝만 표시 — 눈금을 다 적으면 읽히지 않는다 */}
      <div className="mono-num text-muted flex justify-between mt-1" style={{ fontSize: 11 }}>
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** 표 안에서 값의 크기를 한눈에 보여주는 가로 막대. */
export function InlineBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div
      style={{ height: 5, width: '100%', background: 'rgba(29,31,32,0.09)', overflow: 'hidden' }}
      aria-hidden
    >
      <div style={{ height: '100%', width: `${pct}%`, background: color }} />
    </div>
  );
}
