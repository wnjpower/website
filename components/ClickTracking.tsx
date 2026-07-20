'use client';

import { useEffect } from 'react';
import { gtagEvent } from '@/components/GoogleAnalytics';

/**
 * 전화·카카오톡 클릭을 GA4 이벤트로 전송한다.
 *
 * 링크마다 onClick을 다는 대신 document에서 클릭을 위임 처리한다.
 * 서버 컴포넌트(Contact·Footer·Portfolio 등)를 클라이언트로 바꾸지 않아도 되고,
 * 앞으로 추가되는 전화 링크도 별도 작업 없이 자동으로 잡힌다.
 *
 * 이벤트가 발생한 위치는 data-cta-scope → 가장 가까운 section의 id →
 * header/footer 태그명 순으로 판별한다.
 */
export default function ClickTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute('href') ?? '';
      const isPhone = href.startsWith('tel:');
      const isKakao = href.includes('pf.kakao.com');
      if (!isPhone && !isKakao) return;

      const scope =
        link.closest('[data-cta-scope]')?.getAttribute('data-cta-scope') ??
        link.closest('section')?.id ??
        link.closest('header, footer')?.tagName.toLowerCase() ??
        'unknown';

      if (isPhone) {
        gtagEvent('phone_click', { location: scope, phone: href.slice(4) });
      } else {
        gtagEvent('kakao_click', { location: scope });
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
