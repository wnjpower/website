import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { servicePages, getServicePage } from '@/content/service-pages';
import { services } from '@/content/services';
import { portfolioByCategory } from '@/content/portfolio';
import { COMPANY, SITE_URL } from '@/lib/site';

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getServicePage(params.slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE_URL}/services/${page.slug}`,
      type: 'website',
    },
  };
}

// 인테리어만 일반 고객 대상이라 견적폼 고객유형을 다르게 잡는다
const CUSTOMER_TYPE_BY_SLUG: Record<string, string> = {
  factory: 'industrial',
  power: 'industrial',
  panel: 'industrial',
  interior: 'interior',
};

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const page = getServicePage(params.slug);
  if (!page) notFound();

  const service = services.find((svc) => svc.id === page.slug);
  const relatedProjects = portfolioByCategory(page.slug).slice(0, 3);
  const otherServices = servicePages.filter((p) => p.slug !== page.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    description: page.metaDescription,
    serviceType: service?.title ?? page.h1,
    provider: {
      '@type': 'ElectricalContractor',
      name: COMPANY.name,
      telephone: '+82-53-525-0424',
      url: SITE_URL,
    },
    areaServed: ['대구광역시', '경상북도'],
    url: `${SITE_URL}/services/${page.slug}`,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <SubPageShell
      quoteSource={`service_${page.slug}`}
      initialCategory={page.slug}
      initialCustomerType={CUSTOMER_TYPE_BY_SLUG[page.slug]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHero
        eyebrow="사업영역"
        title={page.h1}
        lead={page.lead}
        crumbs={[{ label: '사업영역', href: '/#services' }, { label: service?.title ?? page.h1 }]}
      />

      {/* 시공 범위 */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-8">
            시공 범위
          </h2>
          <div data-reveal className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {page.scope.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-gray-200 p-6 hover:border-[#0F2E4D]/40 transition-colors"
              >
                <div className="flex items-start gap-2.5 mb-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2E4D] mt-0.5 flex-shrink-0" />
                  <h3 className="text-lg font-bold text-[#0F172A] leading-snug">{item.title}</h3>
                </div>
                <p className="text-base text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 진행 절차 */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-8">
            진행 절차
          </h2>
          <ol data-reveal className="space-y-5">
            {page.process.map((step) => (
              <li key={step.step} className="flex items-start gap-5">
                <span className="flex-shrink-0 w-10 h-10 rounded-md bg-[#0F2E4D] text-white font-bold flex items-center justify-center tabular-nums">
                  {step.step}
                </span>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">{step.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 비용·기간 변수 */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-3">
            비용·기간에 영향을 주는 요인
          </h2>
          <p data-reveal className="text-base text-gray-500 mb-8">
            현장 조건에 따라 크게 달라지므로 일률적인 금액 안내는 어렵습니다. 대신 무엇이 변수인지
            먼저 공유합니다.
          </p>
          <dl data-reveal className="divide-y divide-gray-200 border-y border-gray-200">
            {page.considerations.map((item) => (
              <div key={item.title} className="py-5">
                <dt className="text-lg font-bold text-[#0F172A] mb-1.5">{item.title}</dt>
                <dd className="text-base text-gray-600 leading-relaxed">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 관련 시공 사례 */}
      {relatedProjects.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 data-reveal className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-8">
              관련 시공 사례
            </h2>
            <ul data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProjects.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/portfolio/${item.slug}`}
                    className="group flex flex-col h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-[#0F2E4D]/30 hover:shadow-sm transition-all"
                  >
                    <span className="self-start text-xs font-semibold px-2 py-0.5 rounded bg-brand-tint text-brand-700 mb-3">
                      {item.categoryLabel}
                    </span>
                    <p className="font-bold text-[#0F172A] text-[0.9375rem] leading-snug mb-1 group-hover:text-[#0F2E4D] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-400">{item.facility} · {item.location}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-8">
            자주 묻는 질문
          </h2>
          <div data-reveal className="space-y-4">
            {page.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-gray-200 px-6 py-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-[#0F172A] flex items-start justify-between gap-4">
                  {faq.question}
                  <span className="text-[#0F2E4D] flex-shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 다른 사업영역 */}
      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-reveal className="text-xl font-bold text-[#0F172A] tracking-tight mb-5">
            다른 사업영역
          </h2>
          <ul data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherServices.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/services/${other.slug}`}
                  className="flex items-center justify-between gap-3 h-full rounded-lg border border-gray-200 bg-white px-5 py-4 hover:border-[#0F2E4D]/40 hover:shadow-sm transition-all"
                >
                  <span className="font-bold text-[#0F172A] text-base leading-snug">
                    {services.find((s) => s.id === other.slug)?.title ?? other.h1}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#0F2E4D] flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SubPageShell>
  );
}
