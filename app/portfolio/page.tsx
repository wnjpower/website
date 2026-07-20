import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { portfolioItems } from '@/content/portfolio';

export const metadata: Metadata = {
  title: '시공 사례 | 대구·경북 공장 전기공사 실적 | 우앤주전력',
  description:
    '대구·경북 공장 전기공사·수전설비·배전반 제작·인테리어 전기 시공 사례. 지역별 공종별 실적을 확인하세요.',
  keywords: ['대구 전기공사 시공사례', '공장 전기공사 실적', '배전반 제작 사례', '경북 전기공사'],
  alternates: { canonical: '/portfolio' },
};

const categoryColors: Record<string, string> = {
  factory: 'bg-blue-100 text-blue-700',
  power: 'bg-sky-100 text-sky-700',
  panel: 'bg-amber-100 text-amber-700',
  interior: 'bg-purple-100 text-purple-700',
};

export default function PortfolioIndexPage() {
  const allPlaceholder = portfolioItems.every((item) => item.isPlaceholder);

  return (
    <SubPageShell quoteSource="portfolio_index">
      <PageHero
        eyebrow="PROJECTS"
        title="시공 사례"
        lead="대구·경북 지역에서 진행한 공장 전기공사, 수전설비·계약전력 증설, 배전반 제작, 인테리어 전기 시공 실적입니다."
        crumbs={[{ label: '시공 사례' }]}
        bgImage="/images/switchgear.jpg"
      />

      <section className="py-16 sm:py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allPlaceholder && (
            <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-sm text-amber-900 leading-relaxed">
                이미지는 <strong>레이아웃 확인용 샘플</strong>입니다. 실제 시공 현장 사진으로 순차
                교체 중이며, 표기된 시공 실적은 실제 진행 건입니다.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {item.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image}
                      alt={
                        item.isPlaceholder
                          ? `${item.location} ${item.title} — 샘플 이미지`
                          : `${item.location} ${item.title}`
                      }
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {item.isPlaceholder && (
                    <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-1 rounded bg-black/70 text-white">
                      샘플
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span
                    className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${
                      categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.categoryLabel}
                  </span>
                  <h2 className="font-bold text-[#0F172A] mt-2.5 mb-1 text-lg leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-3">
                    {item.location} · {item.facility}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{item.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0A3D91] group-hover:underline">
                    시공 내용 보기
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SubPageShell>
  );
}
