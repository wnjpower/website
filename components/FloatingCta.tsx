'use client';
import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';

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
      className={`cta-dock fixed bottom-6 right-4 z-50 flex flex-col gap-3 ${
        visible ? 'cta-dock-visible' : 'cta-dock-hidden'
      }`}
    >
      {/* 카카오톡 — 공식 브랜드 #FEE500 배경, #3C1E1E 아이콘 */}
      <a
        href="https://pf.kakao.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡 상담"
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center text-[#3C1E1E]"
        style={{ backgroundColor: '#FEE500' }}
      >
        <KakaoIcon className="w-7 h-7" />
      </a>

      {/* 전화 */}
      <a
        href="tel:010-8552-9994"
        aria-label="전화 상담 010-8552-9994"
        className="animate-cta-pulse w-14 h-14 rounded-full bg-[#0A3D91] shadow-lg shadow-[#0A3D91]/30 hover:shadow-[#0A3D91]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
