'use client';
import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';
import { COMPANY, KAKAO_CHANNEL_URL } from '@/lib/site';

export default function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      data-cta-scope="floating"
      className={`cta-dock fixed bottom-6 right-4 z-50 flex flex-col gap-3 ${
        visible ? 'cta-dock-visible' : 'cta-dock-hidden'
      }`}
    >
      {/* 카카오톡 — 채널 개설 전에는 노출하지 않는다 (lib/site.ts) */}
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

      {/* 전화 */}
      <a
        href={`tel:${COMPANY.mobile}`}
        aria-label={`전화 상담 ${COMPANY.mobile}`}
        className="animate-cta-pulse w-14 h-14 rounded-full bg-[#0A3D91] shadow-lg shadow-[#0A3D91]/30 hover:shadow-[#0A3D91]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
