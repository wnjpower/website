import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import { COMPANY } from '@/lib/site';
import { PhoneButton, QuoteButton } from '@/components/ui/cta';

/**
 * 서브페이지 공통 헤더. 홈 히어로와 같은 다크 네이비 톤을 유지하되
 * 높이를 낮춰 본문이 빨리 시작되게 한다. 사진 대신 미세 도면 격자(tech-dark).
 *
 * bgImage 인자는 하위 호환을 위해 남겨두되 사용하지 않는다(사진 확보 전).
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  bgImage?: string;
}) {
  return (
    <section className="relative tech-dark pt-28 pb-14 sm:pt-36 sm:pb-16 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={crumbs} />
        </div>

        {eyebrow && (
          <p className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 mb-4">
            <span className="rule-accent" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.875rem] sm:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-4">
          {title}
        </h1>
        {lead && (
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mb-8">{lead}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <PhoneButton size="lg" />
          <QuoteButton variant="outlineDark" size="lg" />
        </div>

        <p className="mt-6 text-sm text-slate-400">
          전기공사업 등록{' '}
          <span className="font-mono tabular-nums text-slate-200">{COMPANY.license}</span>
          {'  ·  '}사업자{' '}
          <span className="font-mono tabular-nums text-slate-200">{COMPANY.bizNumber}</span>
        </p>
      </div>
    </section>
  );
}
