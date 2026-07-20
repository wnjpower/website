import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export interface Crumb {
  label: string;
  /** 마지막 항목(현재 페이지)은 href를 비운다 */
  href?: string;
}

/**
 * 서브페이지 이동 경로 + BreadcrumbList 구조화 데이터.
 * 구글 검색 결과에 계층 경로가 노출되고, 크롤러가 사이트 구조를 파악하는 데 쓰인다.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: '홈', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="이동 경로" className="flex flex-wrap items-center gap-1 text-sm">
        {all.map((crumb, i) => {
          const isLast = i === all.length - 1;
          return (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="text-slate-400 hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-semibold" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
