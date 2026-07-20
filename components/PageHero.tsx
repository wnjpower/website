import { Phone } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import { COMPANY } from '@/lib/site';

/**
 * 서브페이지 공통 헤더. 홈 히어로와 같은 다크 인더스트리얼 톤을 유지하되
 * 높이를 낮춰 본문이 빨리 시작되게 한다.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  bgImage = '/images/factory-electrical.jpg',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  bgImage?: string;
}) {
  return (
    <section
      className="relative pt-32 pb-14 sm:pt-40 sm:pb-16 bg-[#0B1220] bg-photo bg-photo-hero"
      style={{ ['--bg-photo-url' as string]: `url('${bgImage}')` }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={crumbs} />
        </div>

        {eyebrow && (
          <p className="text-sm font-bold tracking-widest text-[#FF5500] mb-3">{eyebrow}</p>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
          {title}
        </h1>
        {lead && (
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mb-7">{lead}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`tel:${COMPANY.mobile}`}
            className="inline-flex items-center justify-center gap-2.5 bg-[#FF5500] hover:bg-[#E04A00] text-[#0F172A] font-extrabold text-lg px-7 py-4 rounded-lg transition-colors shadow-lg shadow-black/25"
          >
            <Phone className="w-5 h-5" />
            {COMPANY.mobile}
          </a>
          <a
            href="#quote"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-bold text-lg px-7 py-4 rounded-lg transition-colors backdrop-blur-sm"
          >
            무료 견적문의
          </a>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          전기공사업 등록{' '}
          <span className="font-mono tabular-nums text-slate-200">{COMPANY.license}</span>
          {' · '}사업자{' '}
          <span className="font-mono tabular-nums text-slate-200">{COMPANY.bizNumber}</span>
        </p>
      </div>
    </section>
  );
}
