'use client';
import { CheckCircle2, Factory, Lamp, type LucideIcon } from 'lucide-react';
import { useQuotePrefill } from '@/components/QuotePrefill';

interface Segment {
  type: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  subtitle: string;
  pains: string[];
  solutions: string[];
  cta: string;
}

const industrial: Segment = {
  type: 'industrial',
  icon: Factory,
  tag: '주력 분야',
  title: '공장·산업시설\n전기공사가 필요하신가요?',
  subtitle: '신축·증축·증설부터 수전·동력설비까지',
  pains: [
    '공장 신축·증축에 맞는 전기 설계·시공 업체가 필요해요',
    '계약전력 증설·수전설비 공사를 한 번에 맡기고 싶어요',
    '생산라인 증설로 동력 전원·배전반이 추가로 필요해요',
  ],
  solutions: [
    '전기공사업 면허 보유 법인이 설계부터 준공까지 직접 시공',
    '수전설비(수전반·계량·인입)·계약전력 증설 일괄 처리',
    '현장 규격 맞춤 배전반·분전반 자체 제작·설치',
  ],
  cta: '공장·산업 전기공사 문의',
};

const interior: Segment = {
  type: 'interior',
  icon: Lamp,
  tag: '주택·상가·병원',
  title: '주택·상가·병원\n인테리어 전기가 필요하신가요?',
  subtitle: '조명·콘센트·배선 원스톱 마감',
  pains: [
    '인테리어 일정에 맞춰 전기 작업을 끝내야 해요',
    '조명·콘센트 위치 변경, 노후 배선 교체가 필요해요',
    '상가·병원 오픈 전 전기 용량 점검이 필요해요',
  ],
  solutions: [
    '인테리어 업체 일정에 맞춘 유연한 공사 진행',
    '조명 설계·콘센트 배치 무료 상담',
    '안전하고 깔끔한 마감 + 1년 사후관리',
  ],
  cta: '인테리어·일반 전기 문의',
};

export default function CustomerSegments() {
  const { selectCustomerType } = useQuotePrefill();
  const handleCta = (type: string) => selectCustomerType(type);

  const MainIcon = industrial.icon;
  const SubIcon = interior.icon;

  return (
    <section id="segments" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest text-[#0A3D91] mb-2">WHAT WE DO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            공장 전기공사, 인테리어 전기 — 무엇을 계획 중이신가요?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            공장·산업 전기공사를 주력으로, 주택·상가·병원 인테리어 전기까지 한 업체에서 해결합니다.
          </p>
        </div>

        <div data-reveal className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 메인: 공장·산업 (사진 배경 + 흰 텍스트) */}
          <div
            className="relative lg:col-span-3 rounded-lg overflow-hidden bg-photo bg-photo-accent text-white flex flex-col shadow-xl transition-all duration-200 hover:-translate-y-1.5"
            style={{ ['--bg-photo-url' as string]: "url('/images/factory-electrical.jpg')" }}
          >
            <div className="p-8 sm:p-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold px-3 py-1 rounded-md bg-[#FF5500] text-[#0F172A]">
                  {industrial.tag}
                </span>
                <div className="w-14 h-14 rounded-md bg-white/15 flex items-center justify-center">
                  <MainIcon className="w-7 h-7 text-white" />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mb-2 whitespace-pre-line leading-snug tracking-tight">
                {industrial.title}
              </h3>
              <p className="text-base text-blue-100 mb-7">{industrial.subtitle}</p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8 flex-1">
                <div>
                  <p className="text-sm font-bold text-blue-200 mb-2.5">이런 고민이 있다면</p>
                  <ul className="space-y-2">
                    {industrial.pains.map((pain, i) => (
                      <li key={i} className="flex items-start gap-2 text-[15px] text-blue-50/90">
                        <span className="mt-1 text-white/40 flex-shrink-0">·</span>
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#FF5500] mb-2.5">우앤주전력의 해결책</p>
                  <ul className="space-y-2">
                    {industrial.solutions.map((sol, i) => (
                      <li key={i} className="flex items-start gap-2 text-[15px] text-white">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5500] mt-1 flex-shrink-0" />
                        {sol}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleCta(industrial.type)}
                className="mt-auto w-full bg-[#FF5500] hover:bg-[#FF5500]/90 text-[#0F172A] font-bold py-4 rounded-lg transition-all text-base hover:-translate-y-0.5"
              >
                {industrial.cta} →
              </button>
            </div>
          </div>

          {/* 서브: 인테리어·일반 (솔리드) */}
          <div className="lg:col-span-2 relative rounded-lg border border-gray-200 bg-[#F8FAFC] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-[#0A3D91]/40 hover:-translate-y-1.5">
            <div className="h-1.5 bg-[#0A3D91]" />
            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-bold px-3 py-1 rounded-md bg-[#0A3D91]/10 text-[#0A3D91]">
                  {interior.tag}
                </span>
                <div className="w-12 h-12 rounded-md bg-[#0A3D91]/10 flex items-center justify-center">
                  <SubIcon className="w-6 h-6 text-[#0A3D91]" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#0F172A] mb-1 whitespace-pre-line leading-snug tracking-tight">
                {interior.title}
              </h3>
              <p className="text-base text-gray-400 mb-6">{interior.subtitle}</p>

              <div className="mb-5">
                <p className="text-sm font-bold text-gray-400 mb-2.5">이런 고민이 있다면</p>
                <ul className="space-y-2">
                  {interior.pains.map((pain, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-gray-600">
                      <span className="mt-1 text-gray-300 flex-shrink-0">·</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-7">
                <p className="text-sm font-bold text-[#0A3D91] mb-2.5">우앤주전력의 해결책</p>
                <ul className="space-y-2">
                  {interior.solutions.map((sol, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-[#0F172A]">
                      <CheckCircle2 className="w-4 h-4 text-[#0A3D91] mt-1 flex-shrink-0" />
                      {sol}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCta(interior.type)}
                className="mt-auto w-full bg-white hover:bg-[#0A3D91] border-2 border-[#0A3D91] text-[#0A3D91] hover:text-white font-bold py-3.5 rounded-lg transition-all text-base hover:-translate-y-0.5"
              >
                {interior.cta} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
