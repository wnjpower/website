import Link from 'next/link';
import { Calculator } from 'lucide-react';

// 가격 금액은 사장님 확정 후 priceLabel에 기입 (예: '5만원~'). 확정 전에는 '무료 견적' 표기.
const priceItems = [
  { work: '콘센트 추가·이동 (1개소)',          audience: '주택',       priceLabel: '무료 견적으로 확인' },
  { work: '조명 교체·설치 (1개소)',            audience: '주택',       priceLabel: '무료 견적으로 확인' },
  { work: '주택 분전함(두꺼비집) 교체',         audience: '주택',       priceLabel: '무료 견적으로 확인' },
  { work: '상가 전기 용량 증설',               audience: '상가',       priceLabel: '현장 견적' },
  { work: '상가 인테리어 전기 (33㎡ 기준)',     audience: '상가',       priceLabel: '무료 견적으로 확인' },
  { work: '태양광 발전설비 (3kW~)',            audience: '주택·건물',  priceLabel: '보조금 포함 상담' },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            비용이 궁금하신가요?
          </h2>
          <p className="text-lg text-gray-500">
            대표적인 작업 항목입니다. 현장 여건에 따라 달라지므로
            <br className="hidden sm:block" />
            정확한 금액은 <span className="font-semibold text-[#0F172A]">무료 현장 견적</span>으로 확인하세요.
          </p>
        </div>

        {/* 견적서 양식 스타일 표 */}
        <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white overflow-x-auto">
          <div className="bg-[#0A3D91] px-6 py-3.5 flex items-center justify-between">
            <span className="text-white font-bold text-base tracking-tight">표준 작업 항목표</span>
            <span className="text-blue-200 text-sm font-mono">주식회사 우앤주전력</span>
          </div>
          <table className="w-full text-sm sm:text-base min-w-[480px]">
            <thead>
              <tr className="bg-[#F8FAFC] text-left border-b-2 border-gray-200">
                <th className="px-4 py-4 font-bold text-[#0F172A] w-12 text-center">No.</th>
                <th className="px-4 py-4 font-bold text-[#0F172A]">작업 항목</th>
                <th className="px-4 py-4 font-bold text-[#0F172A] hidden sm:table-cell">대상</th>
                <th className="px-6 py-4 font-bold text-[#0F172A] text-right">비용</th>
              </tr>
            </thead>
            <tbody>
              {priceItems.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-5 text-gray-400 text-center font-mono tabular-nums">{i + 1}</td>
                  <td className="px-4 py-5 text-[#0F172A] font-medium">{item.work}</td>
                  <td className="px-4 py-5 text-gray-400 hidden sm:table-cell">{item.audience}</td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-[#0A3D91] font-semibold">{item.priceLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-400 text-center mt-4">
          * 자재 사양·현장 여건·공사 범위에 따라 비용이 달라질 수 있습니다. 견적·출장은 무료입니다.
        </p>

        <div className="text-center mt-8">
          <Link
            href="#quote"
            className="inline-flex items-center justify-center gap-2 bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-bold text-lg px-10 py-4 rounded-lg transition-all shadow-lg shadow-[#0A3D91]/20 hover:-translate-y-0.5"
          >
            <Calculator className="w-5 h-5" />
            무료 견적 받아보기
          </Link>
        </div>
      </div>
    </section>
  );
}
