import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingCta() {
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {/* 카카오톡 */}
      <a
        href="https://pf.kakao.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡 상담"
        className="w-14 h-14 rounded-full bg-[#FFB800] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-[#0F172A]" />
      </a>

      {/* 전화 */}
      <a
        href="tel:010-8552-9994"
        aria-label="전화 상담 010-8552-9994"
        className="w-14 h-14 rounded-full bg-[#0A3D91] shadow-lg shadow-[#0A3D91]/30 hover:shadow-[#0A3D91]/50 hover:-translate-y-0.5 transition-all flex items-center justify-center"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
