import { ShieldCheck, Stamp, Landmark, ExternalLink } from 'lucide-react';
import { COMPANY, VERIFY_LINKS } from '@/lib/site';

const credentials = [
  {
    icon: ShieldCheck,
    title: '전기공사업 등록',
    number: COMPANY.license,
    description:
      '전기공사협회 전기공사종합정보시스템에서 등록번호로 업체·실적을 직접 확인하실 수 있습니다.',
    verify: {
      label: '전기공사협회에서 조회',
      href: VERIFY_LINKS.keca,
    },
  },
  {
    icon: Stamp,
    title: '사업자등록',
    number: COMPANY.bizNumber,
    description: '국세청 홈택스에서 로그인 없이 사업자 상태·진위 확인이 가능합니다.',
    verify: {
      label: '홈택스 사업자등록상태 조회',
      href: VERIFY_LINKS.hometax,
    },
  },
  {
    icon: Landmark,
    title: '법인 등록',
    number: COMPANY.corpNumber,
    description:
      '대표 업력 20년 이상의 베테랑이 2023년 법인으로 출범. 오랜 현장 경험을 법인의 체계로 운영합니다.',
    verify: null,
  },
];

export default function Credentials() {
  return (
    <section id="credentials" className="py-20 bg-[#0B1220] bg-blueprint-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            믿고 맡길 수 있는 이유
          </h2>
          <p className="text-lg text-slate-400">모든 자격은 공공기관에서 직접 확인하실 수 있습니다</p>
        </div>

        <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {credentials.map((cred) => {
            const Icon = cred.icon;
            return (
              <div
                key={cred.title}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFB800]/40 rounded-lg p-7 flex flex-col backdrop-blur-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-md bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#FFB800]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-1">{cred.title}</h3>
                {cred.number && (
                  <p className="font-mono text-base text-[#FFB800] tracking-wide mb-2 tabular-nums">
                    {cred.number}
                  </p>
                )}
                <p className="text-base text-slate-400 leading-relaxed flex-1">{cred.description}</p>
                {cred.verify && (
                  <a
                    href={cred.verify.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-white hover:text-[#FFB800] transition-colors"
                  >
                    {cred.verify.label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
