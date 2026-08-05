import type { Metadata } from 'next';
import { Quote } from 'lucide-react';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { SectionHead } from '@/components/redesign/Chrome';
import { Credentials, Process } from '@/components/redesign/home/Sections';
import { COMPANY } from '@/lib/site';
import { getSiteContent } from '@/lib/content/get';

export const metadata: Metadata = {
  title: '회사소개 | 대구 전기공사업 등록 법인 | 우앤주전력',
  description:
    '주식회사 우앤주전력 회사소개. 전기공사업 등록 대구-01425, 대구·경북 공장·산업 전기공사 전문 법인. 자격은 공공기관에서 직접 조회하실 수 있습니다.',
  keywords: [
    '우앤주전력',
    '대구 전기공사업 면허 업체',
    '대구 전기공사 법인',
    '전기공사업 등록업체',
    '대구 서구 전기공사',
  ],
  alternates: { canonical: '/about' },
};

const SHELL = { maxWidth: 1000, margin: '0 auto' } as const;
const PAD = 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)';
const HAIRLINE = '1px solid var(--color-divider)';

const companyFacts: { label: string; value: string; mono?: boolean }[] = [
  { label: '법인명', value: COMPANY.name },
  { label: '대표자', value: COMPANY.ceo },
  { label: '전기공사업 등록', value: COMPANY.license, mono: true },
  { label: '사업자등록번호', value: COMPANY.bizNumber, mono: true },
  { label: '법인등록번호', value: COMPANY.corpNumber, mono: true },
  { label: '설립일', value: '2023년 3월 17일' },
  { label: '소재지', value: COMPANY.address.full },
  { label: '시공 지역', value: '대구광역시 전 지역 · 경상북도' },
];

const stats = [
  { value: '20년+', label: '대표 현장경력', note: '2023년 법인 설립' },
  { value: '공장·산업', label: '전기공사 전문', note: '수전·동력·배전반 설계·설치' },
  { value: '1년 보증', label: '시공 후 사후관리', note: '당일 A/S 출동 원칙' },
];

/**
 * 회사소개.
 *
 * 자격 카드와 진행 절차는 홈과 같은 컴포넌트를 그대로 쓴다. 같은 사실을 페이지마다
 * 다른 모양으로 두면 유지보수가 갈리고(한쪽만 고치는 사고), 방문자도 같은 내용을
 * 다른 것으로 오해한다.
 */
export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <SubPageShell quoteSource="about">
      <PageHero
        eyebrow="회사소개"
        title="공장·산업 전기공사 전문 법인"
        lead="우앤주전력은 대구·경북 지역의 공장·산업시설 전기공사를 주력으로, 수전설비·계약전력 증설과 배전반 설계·설치까지 직접 시공하는 전기공사업 등록 법인입니다."
        crumbs={[{ label: '회사소개' }]}
      />

      {/* 01 법인 개요 */}
      <section>
        <div style={{ ...SHELL, padding: PAD }}>
          <SectionHead no="01" title="법인 개요" note="공공기관에서 그대로 조회되는 값입니다" />
          <dl
            data-reveal
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
              border: HAIRLINE,
              margin: 0,
            }}
          >
            {companyFacts.map((fact) => (
              <div key={fact.label} style={{ padding: '14px 18px', borderRight: HAIRLINE, borderBottom: HAIRLINE }}>
                <dt className="text-muted" style={{ fontSize: 12, marginBottom: 3 }}>{fact.label}</dt>
                <dd
                  className={fact.mono ? 'display mono-num' : undefined}
                  style={{
                    fontSize: fact.mono ? 17 : 14.5,
                    fontWeight: fact.mono ? undefined : 600,
                    margin: 0,
                  }}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 02 대표 인사말 */}
      <section style={{ borderTop: HAIRLINE }}>
        <div style={{ ...SHELL, padding: PAD }}>
          <SectionHead no="02" title="대표 인사말" />
          <div data-reveal className="blueprint" style={{ position: 'relative', padding: 'clamp(22px,3vw,34px)' }}>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {/* 대표 사진 확보 전까지 인용부호로 대신한다 — 스톡 사진을 쓰지 않는다 */}
              <span
                style={{
                  width: 52,
                  height: 52,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-accent-700)',
                }}
                aria-hidden
              >
                <Quote size={24} strokeWidth={1.5} />
              </span>

              <div style={{ flex: 1, minWidth: 260 }}>
                <p className="display" style={{ fontSize: 'clamp(19px,2vw,24px)', lineHeight: 1.45, margin: '0 0 16px' }}>
                  “전기는 보이지 않는 곳에서 안전을 지키는 일입니다.
                  <br />한 건 한 건, 제 집 공사라는 마음으로 시공하겠습니다.”
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.75, margin: '0 0 14px', opacity: 0.85 }}>
                  우앤주전력은 공장·산업시설 전기공사를 주력으로, 수전설비·계약전력 증설·배전반
                  설계·설치까지 직접 시공하는 대구·경북 지역 전기공사 법인입니다.{' '}
                  <strong>대표의 20년 이상 현장 경험</strong>을 바탕으로 주택·상가·병원 인테리어
                  전기까지 합리적인 가격과 책임 있는 사후관리로 시공합니다.
                </p>
                <p className="display" style={{ fontSize: 15, margin: 0 }}>
                  {COMPANY.name} 대표 {COMPANY.ceo}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                gap: 20,
                marginTop: 28,
                paddingTop: 22,
                borderTop: HAIRLINE,
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="display" style={{ fontSize: 24, color: 'var(--color-accent-700)', margin: '0 0 2px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{stat.label}</p>
                  <p className="text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 검증 가능한 자격 · 진행 절차 — 홈과 같은 컴포넌트를 재사용 */}
      <Credentials content={content.whyus} />
      <Process content={content.process} />
    </SubPageShell>
  );
}
