'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { gtagEvent } from '@/components/GoogleAnalytics';
import { isStaffExcluded } from '@/lib/analytics/staff';

/**
 * 자체 분석 수집기 (+ GA4 동시 전송).
 *
 * 이벤트마다 요청을 보내면 모바일에서 배터리·네트워크를 낭비하고 일부는
 * 페이지 이탈 중에 잘린다. 그래서 큐에 모았다가 짧은 간격으로 한 번에 보내고,
 * 페이지를 떠날 때는 sendBeacon으로 확실히 흘려보낸다.
 *
 * GA4로도 같은 이벤트를 보낸다. 자체 수집이 주 데이터고 GA4는 교차 검증용이다.
 */

interface QueuedEvent {
  type: string;
  path?: string;
  ctaId?: string;
  variant?: string;
  label?: string;
  value?: number;
}

const ENDPOINT = '/api/track';
const FLUSH_DELAY = 1200;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush(useBeacon = false) {
  if (timer) { clearTimeout(timer); timer = null; }
  if (queue.length === 0) return;

  const batch = queue;
  queue = [];
  const body = JSON.stringify({ events: batch });

  try {
    // sendBeacon은 페이지가 사라지는 중에도 전송이 보장된다.
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // 수집 실패는 조용히 넘어간다. 사이트 동작에 영향을 주면 안 된다.
  }
}

export function track(event: QueuedEvent) {
  if (typeof window === 'undefined') return;
  queue.push({ ...event, path: event.path ?? window.location.pathname });
  if (queue.length >= 10) { flush(); return; }
  if (!timer) timer = setTimeout(() => flush(), FLUSH_DELAY);
}

/**
 * 집계 제외 대상 판정. 두 가지를 본다.
 *
 *  1) 어드민 화면 — Tracker는 루트 레이아웃에 있어 /admin 하위에서도 함께 실행된다.
 *  2) 내부 인원 표식 — 관리자가 공개 사이트를 둘러보는 경우.
 *
 * 둘 다 막지 않으면 사장님이 사이트를 확인할수록 방문자 수가 늘고
 * 전환율(문의÷방문자)이 실제보다 낮게 보인다. 성과를 판단하는 숫자가
 * 스스로를 오염시키는 셈이다.
 *
 * 판정은 이벤트를 보내기 직전에 매번 한다. 상태(useState)에 담아두면 안 된다 —
 * 첫 렌더에서 false로 시작하는 순간, 같은 커밋의 페이지뷰 이펙트가 그 값을 보고
 * 이미 발사해 버린다(상태 갱신은 다음 커밋에 반영되므로). 그래서 새로고침마다
 * 1건씩 새는 버그가 있었다. document.cookie는 이펙트 안에서 언제든 읽을 수 있으니
 * 상태를 둘 이유가 없다.
 */
function isExcluded(pathname: string | null): boolean {
  if (pathname && pathname.startsWith('/admin')) return true;
  return isStaffExcluded();
}

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);
  const seenImpressions = useRef<Set<string>>(new Set());
  const scrollMarks = useRef<Set<number>>(new Set());
  const formStarted = useRef(false);

  // ── 페이지뷰 ──
  useEffect(() => {
    if (isExcluded(pathname)) return;
    const key = `${pathname}?${searchParams?.toString() ?? ''}`;
    if (lastPath.current === key) return;
    lastPath.current = key;

    track({ type: 'pageview', path: pathname ?? '/' });

    // 새 페이지에서는 스크롤·노출 집계를 초기화한다
    scrollMarks.current = new Set();
    formStarted.current = false;
  }, [pathname, searchParams]);

  // ── 클릭 (CTA·전화·카카오) ──
  useEffect(() => {
    if (isExcluded(pathname)) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const ctaEl = target.closest('[data-cta-slot]');
      if (ctaEl instanceof HTMLElement) {
        const slot = ctaEl.dataset.ctaSlot ?? '';
        const variant = ctaEl.dataset.ctaVariant ?? 'A';
        track({
          type: 'cta_click',
          ctaId: ctaEl.dataset.ctaId,
          variant,
          label: slot,
        });
        gtagEvent('cta_click', { slot, variant });
      }

      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute('href') ?? '';
      const scope =
        link.closest('[data-cta-scope]')?.getAttribute('data-cta-scope') ??
        link.closest('section')?.id ??
        link.closest('header, footer')?.tagName.toLowerCase() ??
        'unknown';

      if (href.startsWith('tel:')) {
        track({ type: 'phone_click', label: scope });
        gtagEvent('phone_click', { location: scope, phone: href.slice(4) });
        // 전화 클릭은 곧 앱 전환이라 큐가 날아갈 수 있다. 즉시 흘려보낸다.
        flush(true);
      } else if (href.includes('pf.kakao.com')) {
        track({ type: 'kakao_click', label: scope });
        gtagEvent('kakao_click', { location: scope });
        flush(true);
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  // ── CTA 노출 (A/B 전환율의 분모) ──
  useEffect(() => {
    if (isExcluded(pathname)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          if (!(el instanceof HTMLElement)) continue;

          const slot = el.dataset.ctaSlot ?? '';
          const variant = el.dataset.ctaVariant ?? 'A';
          const key = `${slot}:${variant}`;
          if (seenImpressions.current.has(key)) { observer.unobserve(el); continue; }
          seenImpressions.current.add(key);

          track({ type: 'cta_impression', ctaId: el.dataset.ctaId, variant, label: slot });
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    // 페이지가 그려진 뒤 CTA를 찾는다. 라우트 이동 때마다 다시 건다.
    const scan = () => {
      document.querySelectorAll('[data-cta-slot]').forEach((el) => observer.observe(el));
    };
    const raf = requestAnimationFrame(scan);

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [pathname]);

  // ── 스크롤 깊이 ──
  useEffect(() => {
    if (isExcluded(pathname)) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((window.scrollY / scrollable) * 100);

      for (const mark of [25, 50, 75, 100]) {
        if (percent >= mark && !scrollMarks.current.has(mark)) {
          scrollMarks.current.add(mark);
          track({ type: 'scroll_depth', value: mark });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // ── 폼 작성 시작 (폼 이탈률 파악용) ──
  useEffect(() => {
    if (isExcluded(pathname)) return;

    const onFocus = (event: FocusEvent) => {
      if (formStarted.current) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('form')) return;
      if (!target.matches('input, textarea, select')) return;

      formStarted.current = true;
      track({ type: 'form_start' });
      gtagEvent('form_start');
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, [pathname]);

  // ── 이탈 시 잔여 큐 전송 ──
  useEffect(() => {
    const onHide = () => flush(true);
    // iOS Safari는 pagehide를 놓치는 경우가 있어 visibilitychange도 함께 건다.
    // 특히 tel: 링크로 전화 앱이 뜰 때는 unload가 아예 발생하지 않는다.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };

    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
