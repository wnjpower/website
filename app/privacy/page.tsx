import type { Metadata } from 'next';
import SubPageShell from '@/components/SubPageShell';
import PageHero from '@/components/PageHero';
import { SectionHead } from '@/components/redesign/Chrome';
import { COMPANY } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 우앤주전력',
  description: '주식회사 우앤주전력의 개인정보 수집·이용 목적, 수집 항목, 보유 기간, 정보주체의 권리 안내.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const HAIRLINE = '1px solid var(--color-divider)';

/**
 * 개인정보처리방침.
 *
 * 견적폼을 붙이지 않는다(hideQuote) — 폼의 동의 문구가 가리키는 문서라 순환이고,
 * 법적 고지 페이지에 영업 폼을 두면 동의의 의미가 흐려진다.
 */
const clauses: { no: string; title: string; body: React.ReactNode }[] = [
  {
    no: '01',
    title: '개인정보의 수집·이용 목적',
    body: (
      <p>
        {COMPANY.name}(이하 &ldquo;회사&rdquo;)는 견적 문의 응대 및 서비스 안내를 목적으로
        개인정보를 수집합니다. 수집한 정보는 해당 목적 외의 용도로 이용하지 않습니다.
      </p>
    ),
  },
  {
    no: '02',
    title: '수집하는 개인정보 항목',
    body: (
      <ul>
        <li>
          <strong>필수</strong> — 이름, 연락처, 문의 유형
        </li>
        <li>
          <strong>선택</strong> — 지역, 상세 내용
        </li>
        <li>
          <strong>자동 수집</strong> — IP 주소(해시 처리하여 저장), 브라우저 정보
        </li>
      </ul>
    ),
  },
  {
    no: '03',
    title: '개인정보의 보유·이용 기간',
    body: <p>수집일로부터 3년. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간까지 보관합니다.</p>,
  },
  {
    no: '04',
    title: '개인정보의 제3자 제공',
    body: (
      <p>
        회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법률에 특별한 규정이
        있는 경우는 예외로 합니다.
      </p>
    ),
  },
  {
    no: '05',
    title: '개인정보 처리 담당자',
    body: (
      <ul>
        <li>담당자 — {COMPANY.ceo} (대표)</li>
        <li>
          이메일 — <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </li>
        <li>
          전화 — <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
        </li>
      </ul>
    ),
  },
  {
    no: '06',
    title: '정보주체의 권리',
    body: (
      <p>
        이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 위 담당자
        이메일로 문의해 주시면 지체 없이 처리합니다.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <SubPageShell hideQuote>
      <PageHero
        eyebrow="법적 고지"
        title="개인정보처리방침"
        lead="견적 문의 과정에서 수집하는 개인정보의 항목과 처리 방식을 안내합니다."
        crumbs={[{ label: '개인정보처리방침' }]}
      />

      <section>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(36px,5vw,60px) clamp(16px,4vw,48px)' }}>
          {clauses.map((clause) => (
            <div key={clause.no} data-reveal style={{ marginBottom: 36 }}>
              <SectionHead no={clause.no} title={clause.title} />
              <div className="prose-wnj" style={{ fontSize: 14.5 }}>
                {clause.body}
              </div>
            </div>
          ))}

          <p className="text-muted display" style={{ fontSize: 12.5, paddingTop: 18, borderTop: HAIRLINE, margin: 0 }}>
            시행일 2025년 1월 1일 · {COMPANY.name} (사업자등록번호 {COMPANY.bizNumber})
          </p>
        </div>
      </section>
    </SubPageShell>
  );
}
