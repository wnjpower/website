'use client';
import { HardHat, CircuitBoard, Lamp, CheckCircle2 } from 'lucide-react';
import { services } from '@/content/services';

const iconMap = { HardHat, CircuitBoard, Lamp } as const;
type IconKey = keyof typeof iconMap;

interface Props {
  onSelectCategory?: (cat: string) => void;
}

export default function Services({ onSelectCategory }: Props) {
  return (
    <section id="services" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            3대 전문 서비스
          </h2>
          <p className="text-lg text-gray-500">전기공사·분전함 자체 제작·인테리어 전기, 한 곳에서 해결</p>
        </div>

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => {
            const Icon = iconMap[svc.icon as IconKey];
            return (
              <div
                key={svc.id}
                className="group bg-white rounded-lg p-7 shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-[#0A3D91]/40 hover:-translate-y-1.5 flex flex-col"
              >
                {/* 번호 + 아이콘 */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-md bg-[#0A3D91]/8 group-hover:bg-[#0A3D91] flex items-center justify-center transition-colors duration-200">
                    <Icon className="w-7 h-7 text-[#0A3D91] group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="text-3xl font-bold text-gray-200 tabular-nums tracking-tight">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight mb-1">{svc.title}</h3>
                <p className="text-base text-gray-600 mb-1 font-medium">{svc.description}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{svc.detail}</p>

                {/* 상세 포인트 */}
                <ul className="space-y-1.5 flex-1 mb-5">
                  {svc.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-[#0A3D91] mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* 적합 대상 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {svc.audiences.map((a) => (
                    <span key={a} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0A3D91]/8 text-[#0A3D91]">
                      {a}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onSelectCategory?.(svc.id)}
                  className="mt-auto text-sm text-[#0A3D91] font-bold hover:underline text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D91] rounded"
                >
                  이 항목으로 문의하기 →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
