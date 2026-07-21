import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { portfolioItems, getPortfolioItem } from '@/content/portfolio';
import { services } from '@/content/services';

export function generateStaticParams() {
  return portfolioItems.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = getPortfolioItem(params.slug);
  if (!item) return {};

  const title = `${item.location} ${item.title} 시공사례 | 우앤주전력`;
  return {
    title,
    description: item.summary.slice(0, 80),
    keywords: [
      `${item.location} 전기공사`,
      `${item.region} ${item.categoryLabel}`,
      item.title,
      '우앤주전력',
    ],
    alternates: { canonical: `/portfolio/${item.slug}` },
    openGraph: { title, description: item.summary, type: 'article' },
  };
}

export default function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const item = getPortfolioItem(params.slug);
  if (!item) notFound();

  const relatedService = services.find((svc) => svc.id === item.category);
  const otherItems = portfolioItems.filter((i) => i.slug !== item.slug).slice(0, 3);

  const overview: { label: string; value: string }[] = [
    { label: '위치', value: `${item.region} ${item.location}` },
    { label: '시설 유형', value: item.facility },
    { label: '공사 구분', value: item.categoryLabel },
    { label: '계약전력·용량', value: item.specs?.contractPower ?? '확인 중' },
    { label: '공사 기간', value: item.specs?.duration ?? '확인 중' },
    { label: '연면적', value: item.specs?.area ?? '확인 중' },
  ];

  return (
    <SubPageShell quoteSource={`portfolio_${item.slug}`} initialCategory={item.category}>
      <PageHero
        eyebrow={item.categoryLabel}
        title={`${item.location} ${item.title}`}
        lead={item.summary}
        crumbs={[{ label: '시공 실적', href: '/portfolio' }, { label: item.title }]}
      />

      <article className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* 공사 개요 */}
          <section data-reveal className="mb-12">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-5">공사 개요</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {overview.map((row) => (
                <div key={row.label} className="bg-white px-5 py-4">
                  <dt className="text-sm text-gray-400 font-medium mb-1">{row.label}</dt>
                  <dd
                    className={`text-base font-semibold ${
                      row.value === '확인 중' ? 'text-gray-300' : 'text-[#0F172A]'
                    }`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-start gap-2 text-sm text-gray-400">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              계약전력·공기 등 상세 수치는 확인 후 업데이트할 예정입니다.
            </p>
          </section>

          {/* 공사 범위 */}
          <section data-reveal className="mb-12">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-5">공사 범위</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {item.scopeItems.map((scope) => (
                <li key={scope} className="flex items-start gap-2.5 text-base text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2E4D] mt-0.5 flex-shrink-0" />
                  {scope}
                </li>
              ))}
            </ul>
          </section>

          {/* 현장 과제 */}
          <section data-reveal className="mb-12">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
              이 공사에서 중요한 것
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">{item.challenge}</p>
          </section>

          {/* 시공 내용 */}
          <section data-reveal className="mb-12">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-5">시공 진행</h2>
            <ol className="space-y-4">
              {item.work.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[#0F2E4D] text-white font-bold text-sm flex items-center justify-center tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-base text-gray-700 leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 관련 서비스 */}
          {relatedService && (
            <section data-reveal className="mb-12 rounded-lg border border-gray-200 bg-[#F8FAFC] p-6">
              <p className="text-sm font-bold text-gray-400 mb-2">관련 서비스</p>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">{relatedService.title}</h2>
              <p className="text-base text-gray-600 leading-relaxed mb-4">{relatedService.detail}</p>
              <Link
                href={`/services/${relatedService.id}`}
                className="inline-flex items-center gap-1.5 text-base font-bold text-[#0F2E4D] hover:underline"
              >
                시공 범위·절차 자세히 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* 다른 사례 */}
          <section data-reveal>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-5">다른 시공 사례</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherItems.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/portfolio/${other.slug}`}
                    className="block h-full rounded-lg border border-gray-200 p-4 hover:border-[#0F2E4D]/40 hover:shadow-sm transition-all"
                  >
                    <p className="text-xs font-semibold text-gray-400 mb-1">{other.categoryLabel}</p>
                    <p className="font-bold text-[#0F172A] text-sm leading-snug mb-1">
                      {other.title}
                    </p>
                    <p className="text-xs text-gray-400">{other.location}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </SubPageShell>
  );
}
