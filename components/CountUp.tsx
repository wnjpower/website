'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 목표 숫자 (예: 시공 누적 건수) */
  end: number;
  /** 애니메이션 시간(ms) */
  duration?: number;
  /** 숫자 앞 접두 (예: '+') */
  prefix?: string;
  /** 숫자 뒤 접미 (예: '건', '년', '%') */
  suffix?: string;
  /** 천단위 콤마 */
  separator?: boolean;
  className?: string;
}

/**
 * 화면에 들어올 때 0 → end 로 카운트업하는 숫자.
 * 실제 수치(시공 건수·운영 년차·만족도 등)를 확보하면 아래처럼 사용:
 *   <CountUp end={1200} suffix="건+" separator />
 * prefers-reduced-motion 사용자에게는 최종 값만 즉시 표시.
 */
export default function CountUp({
  end,
  duration = 1600,
  prefix = '',
  suffix = '',
  separator = false,
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = separator ? value.toLocaleString('ko-KR') : String(value);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
