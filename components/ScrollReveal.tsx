'use client';
import { useEffect } from 'react';

/**
 * 페이지에 한 번 마운트되어 [data-reveal] 요소를 스크롤 진입 시 등장시킨다.
 * - prefers-reduced-motion 사용자 / IntersectionObserver 미지원 환경에서는
 *   모든 요소를 즉시 보이도록 처리해 콘텐츠 누락을 방지한다.
 * - 한 번 보인 요소는 unobserve 하여 재실행하지 않는다.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
