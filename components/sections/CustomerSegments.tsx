'use client';
import { CheckCircle2, Home, Store, Building2, type LucideIcon } from 'lucide-react';

interface Segment {
  type: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  subtitle: string;
  pains: string[];
  solutions: string[];
  cta: string;
  barColor: string;
}

const segments: Segment[] = [
  {
    type: 'residential',
    icon: Home,
    tag: '개인 고객',
    title: '아파트·주택\n셀프 인테리어 중이신가요?',
    subtitle: '직접 인테리어를 계획하는 분들을 위해',
    pains: [
      '전기 작업은 자격증 없이 직접 할 수 없어요',
      '조명 위치 변경, 콘센트 추가·이동이 필요해요',
      '인테리어 공사 중 전기도 같이 정리하고 싶어요',
    ],
    solutions: [
      '인테리어 일정에 맞춘 유연한 공사 일정',
      '조명 설계·콘센트 배치 무료 상담',
      '안전하고 깔끔한 마감 처리',
    ],
    cta: '주택 전기공사 문의',
    barColor: 'bg-[#C8581F]',
  },
  {
    type: 'small_business',
    icon: Store,
    tag: '자영업 고객',
    title: '카페·식당·상가\n창업·리모델링 준비 중이신가요?',
    subtitle: '오픈 일정을 맞춰야 하는 분들을 위해',
    pains: [
      '오픈 일정이 정해져 있어 빠른 시공이 필요해요',
      '주방기기·에어컨·조명 등 전기 용량 설계가 막막해요',
      '인테리어 업체와 전기업체를 따로 조율하기 번거로워요',
    ],
    solutions: [
      '인테리어와 전기공사 원스톱 진행',
      '업종별 전기 용량 검토·증설 시공',
      '오픈 일정 역산한 공사 일정 보장',
    ],
    cta: '상가 전기공사 문의',
    barColor: 'bg-[#B58A00]',
  },
  {
    type: 'commercial',
    icon: Building2,
    tag: '법인·사업자',
    title: '상업건물·병원·공장\n신축·리모델링 계획 중이신가요?',
    subtitle: '전문성과 신뢰가 필요한 분들을 위해',
    pains: [
      '전기 면허·법적 요건을 완벽히 갖춘 업체가 필요해요',
      '건물 규모에 맞는 전기 설비 설계가 필요해요',
      '태양광 발전설비 연계 및 보조금 활용도 하고 싶어요',
    ],
    solutions: [
      '전기공사업 면허 보유·법적 요건 완비',
      '대규모 전기 설비 설계·시공 일괄 수행',
      '태양광 설비 설계·시공·보조금 신청 일괄 처리',
    ],
    cta: '상업건물 공사 문의',
    barColor: 'bg-[#0A3D91]',
  },
];

interface Props {
  onSelectSegment?: (type: string) => void;
}

export default function CustomerSegments({ onSelectSegment }: Props) {
  const handleCta = (type: string) => {
    onSelectSegment?.(type);
    const el = document.getElementById('quote');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="segments" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            어떤 공사를 계획하고 계신가요?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            고객 유형별로 딱 맞는 솔루션을 제공합니다. 해당하는 상황을 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.type}
                className="relative rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#0A3D91]/40"
              >
                {/* 상단 컬러 바 (배선 상색 모티프) */}
                <div className={`h-1.5 ${seg.barColor}`} />

                <div className="p-7 flex flex-col flex-1">
                  {/* 태그 + 아이콘 */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold px-3 py-1 rounded-md bg-[#0A3D91]/8 text-[#0A3D91]">
                      {seg.tag}
                    </span>
                    <div className="w-12 h-12 rounded-md bg-[#0A3D91]/8 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#0A3D91]" />
                    </div>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-xl font-bold text-[#0F172A] mb-1 whitespace-pre-line leading-snug tracking-tight">
                    {seg.title}
                  </h3>
                  <p className="text-base text-gray-400 mb-6">{seg.subtitle}</p>

                  {/* 페인포인트 */}
                  <div className="mb-5">
                    <p className="text-sm font-bold text-gray-400 mb-2.5">이런 고민이 있다면</p>
                    <ul className="space-y-2">
                      {seg.pains.map((pain, i) => (
                        <li key={i} className="flex items-start gap-2 text-base text-gray-600">
                          <span className="mt-1 text-gray-300 flex-shrink-0">·</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 솔루션 */}
                  <div className="mb-7">
                    <p className="text-sm font-bold text-[#0A3D91] mb-2.5">우앤주전력의 해결책</p>
                    <ul className="space-y-2">
                      {seg.solutions.map((sol, i) => (
                        <li key={i} className="flex items-start gap-2 text-base text-[#0F172A]">
                          <CheckCircle2 className="w-4 h-4 text-[#0A3D91] mt-1 flex-shrink-0" />
                          {sol}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleCta(seg.type)}
                      className="w-full bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-bold py-3.5 rounded-lg transition-all text-base hover:-translate-y-0.5"
                    >
                      {seg.cta} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
