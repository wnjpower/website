'use client';
import { useEffect, useState } from 'react';
import { Phone, FileText } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';
import { KAKAO_CHANNEL_URL } from '@/lib/site';
import { Icon } from '@/components/ui/icon';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

/**
 * 전환 CTA 고정 노출.
 *
 * 모바일은 하단 고정 바(전화 + 견적문의)를 스크롤과 무관하게 항상 띄운다.
 * 시공업체 모바일 표준 패턴이고, 우하단 원형 버튼보다 탭 면적이 훨씬 넓다.
 * 데스크톱은 우하단 독을 유지하되 스크롤 후에만 조용히 등장시킨다.
 *
 * 두 버튼 모두 어드민 CTA(floating_call·floating_quote)라 문구·링크를 바로 바꿔
 * 실험할 수 있다.
 */
export default function FloatingCta({ ctas }: { ctas: Record<CtaSlot, Cta> }) {
  const [visible, setVisible] = useState(false);
  const call = ctas.floating_call;
  const quote = ctas.floating_quote;

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
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-black/10 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]"
      >
        <a
          href={call.href}
          data-cta-slot={call.slot}
          data-cta-variant={call.variant}
          data-cta-id={call.id}
          className="flex-[3] flex items-center justify-center gap-2 bg-signal active:brightness-95 text-white font-bold text-base py-4"
        >
          <Icon name={call.icon ?? 'Phone'} className="w-5 h-5" />
          {call.label}
        </a>
        <a
          href={quote.href}
          data-cta-slot={quote.slot}
          data-cta-variant={quote.variant}
          data-cta-id={quote.id}
          className="flex-[2] flex items-center justify-center gap-2 bg-brand active:bg-brand-700 text-white font-bold text-base py-4"
        >
          <Icon name={quote.icon} className="w-5 h-5" fallback={FileText} />
          {quote.label}
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
          href={call.href}
          aria-label={`전화 상담 ${call.label}`}
          data-cta-slot={call.slot}
          data-cta-variant={call.variant}
          data-cta-id={call.id}
          className="w-14 h-14 rounded-full bg-signal shadow-lg shadow-black/25 hover:-translate-y-0.5 hover:brightness-105 transition-all flex items-center justify-center"
        >
          <Phone className="w-6 h-6 text-white" />
        </a>
      </div>
    </>
  );
}
