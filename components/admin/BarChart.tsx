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
 * 색상은 dataviz 검증기(대비·색각 이상 분리도)를 통과한 값만 쓴다.
 */

export const CHART_COLORS = {
  /** 방문·트래픽 계열 */
  traffic: '#2F72A8',
  /** 전환(문의·전화) 계열 */
  conversion: '#D06F14',
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
      <div
        className="flex items-center justify-center text-sm text-slate-400"
        style={{ height }}
      >
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
            <stop offset="100%" stopColor={color} stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* 기준선 — 눈에 띄지 않게 */}
        <line x1="0" y1={height - 0.5} x2="100" y2={height - 0.5} stroke="#E2E8F0" strokeWidth="1" />

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
                  rx="1.5"
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
          className="absolute top-0 pointer-events-none z-10 -translate-x-1/2 rounded-md bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
        >
          <span className="font-mono tabular-nums font-bold">
            {data[hover].value.toLocaleString('ko-KR')}
            {valueSuffix}
          </span>
          <span className="text-slate-300 ml-1.5">{data[hover].label}</span>
        </div>
      )}

      {/* x축 양 끝만 표시 — 눈금을 다 적으면 읽히지 않는다 */}
      <div className="flex justify-between text-[0.6875rem] text-slate-400 mt-1 tabular-nums">
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
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden" aria-hidden>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}
