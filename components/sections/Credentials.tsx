import { ShieldCheck, Stamp, Landmark, ExternalLink } from 'lucide-react';
import { COMPANY, VERIFY_LINKS } from '@/lib/site';
import { Section, Container, SectionHeading } from '@/components/ui/section';

const credentials = [
  {
    icon: ShieldCheck,
    title: '전기공사업 등록',
    number: COMPANY.license,
    description: '전기공사협회 종합정보시스템에서 등록번호로 업체·실적을 직접 확인하실 수 있습니다.',
    verify: { label: '전기공사협회 조회', href: VERIFY_LINKS.keca },
  },
  {
    icon: Stamp,
    title: '사업자 등록',
    number: COMPANY.bizNumber,
    description: '국세청 홈택스에서 로그인 없이 사업자 상태·진위 확인이 가능합니다.',
    verify: { label: '홈택스 사업자 조회', href: VERIFY_LINKS.hometax },
  },
  {
    icon: Landmark,
    title: '법인 등록',
    number: COMPANY.corpNumber,
    description: '대표 현장경력 20년 이상, 2023년 법인으로 출범해 오랜 현장 경험을 법인의 체계로 운영합니다.',
    verify: null,
  },
];

export default function Credentials() {
  return (
    <Section id="credentials" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="검증 가능한 자격"
          title="공적 자격은 공공기관에서 직접 확인하실 수 있습니다"
          lead="말이 아니라 조회로 검증되는 전기공사 법인입니다."
        />

        <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {credentials.map((cred) => {
            const Icon = cred.icon;
            return (
              <div
                key={cred.title}
                className="group bg-white border border-slate-200 rounded-xl p-6 flex flex-col hover:border-brand/30 hover:shadow-lg hover:shadow-slate-200/70 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-tint flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-base font-bold text-ink tracking-tight mb-1">{cred.title}</h3>
                <p className="font-mono tabular-nums text-lg text-brand tracking-wide mb-2">{cred.number}</p>
                <p className="text-[0.9375rem] text-slate-600 leading-relaxed flex-1">{cred.description}</p>
                {cred.verify && (
                  <a
                    href={cred.verify.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand rounded-lg border border-brand/25 px-3.5 py-2 hover:bg-brand-tint transition-colors"
                  >
                    {cred.verify.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
