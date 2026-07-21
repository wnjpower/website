'use client';
import { useEffect, useState } from 'react';
import { Phone, FileText } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';
import { COMPANY, KAKAO_CHANNEL_URL } from '@/lib/site';

/**
 * 전환 CTA 고정 노출.
 *
 * 모바일은 하단 고정 바(전화 + 견적문의)를 스크롤과 무관하게 항상 띄운다.
 * 시공업체 모바일 표준 패턴이고, 우하단 원형 버튼보다 탭 면적이 훨씬 넓다.
 * 데스크톱은 우하단 독을 유지하되 스크롤 후에만 조용히 등장시킨다.
 */
export default function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── 모바일: 하단 고정 바 ── */}
      <div
        data-cta-scope="mobile_bar"
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-black/10 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
      >
        <a
          href={`tel:${COMPANY.mobile}`}
          className="flex-[3] flex items-center justify-center gap-2 bg-signal active:brightness-95 text-white font-bold text-base py-4"
        >
          <Phone className="w-5 h-5" />
          전화 상담
        </a>
        <a
          href="#quote"
          className="flex-[2] flex items-center justify-center gap-2 bg-brand active:bg-brand-700 text-white font-bold text-base py-4"
        >
          <FileText className="w-5 h-5" />
          견적문의
        </a>
      </div>

      {/* ── 데스크톱: 우하단 독 ── */}
      <div
        data-cta-scope="floating"
        className={`cta-dock hidden sm:flex fixed bottom-6 right-5 z-50 flex-col gap-3 ${
          visible ? 'cta-dock-visible' : 'cta-dock-hidden'
        }`}
      >
        {KAKAO_CHANNEL_URL && (
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오톡 상담"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center text-[#3C1E1E]"
            style={{ backgroundColor: '#FEE500' }}
          >
            <KakaoIcon className="w-7 h-7" />
          </a>
        )}

        <a
          href={`tel:${COMPANY.mobile}`}
          aria-label={`전화 상담 ${COMPANY.mobile}`}
          className="w-14 h-14 rounded-full bg-signal shadow-lg shadow-black/25 hover:-translate-y-0.5 hover:brightness-105 transition-all flex items-center justify-center"
        >
          <Phone className="w-6 h-6 text-white" />
        </a>
      </div>
    </>
  );
}
