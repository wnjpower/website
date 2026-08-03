import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { portfolioItems, getPortfolioItem } from '@/content/portfolio';
import { services } from '@/content/services';
import { PostArticle } from '@/components/PostViews';
import { CornerMarks, SectionHead } from '@/components/redesign/Chrome';
import { getPublishedPost, getPublishedPosts, postSummary, formatPostDate } from '@/lib/posts';

const SECTION_PAD = 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)';
const HAIRLINE = '1px solid var(--color-divider)';

export async function generateStaticParams() {
  const posts = await getPublishedPosts('portfolio');
  return [
    ...portfolioItems.map((item) => ({ slug: item.slug })),
    ...posts.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getPortfolioItem(params.slug);

  // 파일 원장에 없으면 어드민에서 올린 현장 글이다
  if (!item) {
    const post = await getPublishedPost('portfolio', params.slug);
    if (!post) return {};
    const title = post.metaTitle || `${post.title} | 시공사례 | 우앤주전력`;
    const description = post.metaDescription || postSummary(post, 160);
    return {
      title,
      description,
      alternates: { canonical: `/portfolio/${post.slug}` },
      robots: post.noindex ? { index: false, follow: true } : undefined,
      openGraph: {
        type: 'article',
        title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  }

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

export default async function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const item = getPortfolioItem(params.slug);

  // 어드민에서 사진과 함께 올린 현장 글
  if (!item) {
    const post = await getPublishedPost('portfolio', params.slug);
    if (!post) notFound();

    return (
      <SubPageShell quoteSource={`portfolio_${post.slug}`}>
        <PageHero
          eyebrow={formatPostDate(post.publishedAt) || '시공 사례'}
          title={post.title}
          lead={post.excerpt ?? undefined}
          crumbs={[{ label: '시공 실적', href: '/portfolio' }, { label: post.title }]}
        />
        <PostArticle post={post} />
      </SubPageShell>
    );
  }

  const relatedService = services.find((svc) => svc.id === item.category);
  const otherItems = portfolioItems.filter((i) => i.slug !== item.slug).slice(0, 3);

  /*
   * 현장 수치는 확정값만 쓴다. 미확인 항목은 '확인 중'으로 흐리게 두어
   * 확정값과 눈으로 구분되게 한다 — 발주처가 사실로 받아들이는 정보라
   * 추정치를 채워 넣으면 안 된다.
   */
  const overview: { label: string; value?: string }[] = [
    { label: '위치', value: `${item.region} ${item.location}` },
    { label: '시설 유형', value: item.facility },
    { label: '공사 구분', value: item.categoryLabel },
    { label: '계약전력·용량', value: item.specs?.contractPower },
    { label: '공사 기간', value: item.specs?.duration },
    { label: '연면적', value: item.specs?.area },
  ];

  return (
    <SubPageShell quoteSource={`portfolio_${item.slug}`} initialCategory={item.category}>
      <PageHero
        eyebrow={item.categoryLabel}
        title={`${item.location} ${item.title}`}
        lead={item.summary}
        crumbs={[{ label: '시공 실적', href: '/portfolio' }, { label: item.title }]}
      />

      <article>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: SECTION_PAD }}>
          {/* 공사 개요 */}
          <section data-reveal style={{ marginBottom: 44 }}>
            <SectionHead no="01" title="공사 개요" />
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
                border: HAIRLINE,
                margin: 0,
              }}
            >
              {overview.map((row) => (
                <div key={row.label} style={{ padding: '14px 18px', borderRight: HAIRLINE, borderBottom: HAIRLINE }}>
                  <dt className="text-muted" style={{ fontSize: 12, marginBottom: 3 }}>{row.label}</dt>
                  <dd
                    className="display"
                    style={{
                      fontSize: 16,
                      margin: 0,
                      color: row.value ? 'var(--color-text)' : 'rgba(29,31,32,0.4)',
                    }}
                  >
                    {row.value ?? '확인 중'}
                  </dd>
                </div>
              ))}
            </dl>
            <p
              className="text-muted"
              style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, margin: '10px 0 0' }}
            >
              <Info size={14} strokeWidth={1.5} style={{ flex: 'none', marginTop: 1 }} />
              계약전력·공기 등 현장 수치는 발주처 확인 후 기재합니다 — 추정치를 쓰지 않습니다.
            </p>
          </section>

          {/* 공사 범위 */}
          <section data-reveal style={{ marginBottom: 44 }}>
            <SectionHead no="02" title="공사 범위" />
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                gap: '0 48px',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {item.scopeItems.map((scope) => (
                <li
                  key={scope}
                  style={{ display: 'flex', gap: 10, padding: '13px 0', borderTop: HAIRLINE, fontSize: 14 }}
                >
                  <CheckCircle2
                    size={16}
                    strokeWidth={1.5}
                    style={{ color: 'var(--color-accent-700)', flex: 'none', marginTop: 2 }}
                  />
                  {scope}
                </li>
              ))}
            </ul>
          </section>

          {/* 이 공사에서 중요한 것 */}
          <section data-reveal style={{ marginBottom: 44 }}>
            <SectionHead no="03" title="이 공사에서 중요한 것" />
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                margin: 0,
                borderLeft: '2px solid var(--color-accent)',
                paddingLeft: 18,
              }}
            >
              {item.challenge}
            </p>
          </section>

          {/* 시공 진행 */}
          <section data-reveal style={{ marginBottom: 44 }}>
            <SectionHead no="04" title="시공 진행" />
            <ol
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderLeft: HAIRLINE,
                marginLeft: 6,
                padding: 0,
                listStyle: 'none',
              }}
            >
              {item.work.map((step, i) => (
                <li key={step} style={{ position: 'relative', padding: '0 0 20px 26px' }}>
                  <span className="rail-node" aria-hidden />
                  <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    <span className="display" style={{ color: 'var(--color-accent-700)', marginRight: 10 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* 관련 사업영역 */}
          {relatedService && (
            <section
              data-reveal
              className="blueprint"
              style={{ position: 'relative', padding: 24, marginBottom: 44 }}
            >
              <CornerMarks />
              <p
                className="text-muted display"
                style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 8px' }}
              >
                관련 사업영역
              </p>
              <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>{relatedService.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', opacity: 0.85 }}>
                {relatedService.detail}
              </p>
              <Link
                href={`/services/${relatedService.id}`}
                className="display"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 15,
                  color: 'var(--color-accent-700)',
                }}
              >
                시공 범위·절차 자세히 보기
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </section>
          )}

          {/* 다른 사례 */}
          <section data-reveal>
            <SectionHead no="05" title="다른 시공 사례" />
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                gap: 20,
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {otherItems.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/portfolio/${other.slug}`}
                    className="blueprint post-card"
                    style={{ position: 'relative', display: 'block', padding: 18, height: '100%' }}
                  >
                    <CornerMarks />
                    <span className="tag" style={{ fontSize: 10.5 }}>{other.categoryLabel}</span>
                    <p style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.4, margin: '10px 0 4px' }}>
                      {other.title}
                    </p>
                    <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>{other.location}</p>
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
