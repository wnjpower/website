'use client';
import { HardHat } from 'lucide-react';
import CountUp from '@/components/CountUp';

const stats = [
  {
    value: <CountUp end={20} suffix="년+" className="text-3xl font-bold text-[#0A3D91]" />,
    label: '전기공사 업력',
    note: '법인 설립 2023년',
  },
  {
    value: <CountUp end={6} prefix="월 평균 " suffix="개 현장" className="text-3xl font-bold text-[#0A3D91]" />,
    label: '꾸준한 시공 실적',
    note: '대구·경북 지역',
  },
  {
    value: <span className="text-3xl font-bold text-[#0A3D91]">1년 보증</span>,
    label: '시공 후 사후관리',
    note: '당일 A/S 출동',
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">
            전기공사 전문 법인, 우앤주전력입니다
          </h2>
        </div>

        <div data-reveal className="bg-[#F8FAFC] rounded-3xl border border-gray-100 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* 대표 사진 자리 (placeholder) */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-28 h-28 rounded-2xl bg-[#0A3D91]/10 flex items-center justify-center">
                <HardHat className="w-12 h-12 text-[#0A3D91]" />
              </div>
            </div>

            {/* 인사말 */}
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl text-[#0F172A] font-medium leading-relaxed mb-4">
                &ldquo;전기는 보이지 않는 곳에서 안전을 지키는 일입니다.
                <br className="hidden sm:block" />
                한 건 한 건, 제 집 공사라는 마음으로 시공하겠습니다.&rdquo;
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-5">
                우앤주전력은 전기공사·분전함 자체 제작·인테리어 전기를 한 곳에서
                해결하는 대구·경북 지역 전문 전기공사 법인입니다.{' '}
                <span className="font-semibold text-[#0F172A]">20년 이상의 현장 경험</span>을 바탕으로
                직접 시공하기에 합리적인 가격과 책임 있는 사후관리를 약속드립니다.
              </p>
              <div className="text-base text-gray-400">
                <span className="font-semibold text-[#0F172A]">주식회사 우앤주전력 대표 임태훈</span>
              </div>
            </div>
          </div>

          {/* 수치 통계 행 */}
          <div data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-200">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-1">{stat.value}</div>
                <p className="text-sm font-semibold text-[#0F172A]">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
