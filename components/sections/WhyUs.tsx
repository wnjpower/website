import { Wrench, CircuitBoard, PhoneCall } from 'lucide-react';

const items = [
  {
    icon: Wrench,
    title: '원스톱 시공',
    description: '전기공사·분전함 제작·인테리어 전기를 한 업체에서. 아파트 인테리어부터 상가 창업, 상업건물 신축까지 협력업체 조율 스트레스 없이 한 번에 마무리합니다.',
    tags: ['주택', '상가', '상업건물'],
  },
  {
    icon: CircuitBoard,
    title: '분전함 자체 제작',
    description: '외주 없이 직접 제작하므로 중간 마진이 없습니다. 현장 규격·회로 수에 맞는 분전반·배전반을 합리적인 가격에 공급하고, 납기도 빠릅니다.',
    tags: ['주택', '상가', '상업건물', '공장'],
  },
  {
    icon: PhoneCall,
    title: '신속한 A/S',
    description: '대구·경북 지역 전담으로 문제 발생 시 당일 출동 원칙. 인테리어 완성 후, 가게 오픈 후, 건물 준공 후에도 사후관리까지 책임집니다.',
    tags: ['주택', '상가', '상업건물'],
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            왜 우앤주전력인가요?
          </h2>
          <p className="text-lg text-gray-500">어떤 고객이든 한 업체로 해결되는 이유</p>
        </div>

        <div data-reveal className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="group flex gap-5 p-7 rounded-lg border border-gray-200 hover:border-[#0A3D91]/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 bg-white">
                <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[#0A3D91] group-hover:bg-[#0A3D91]/90 flex items-center justify-center shadow-md shadow-[#0A3D91]/20 group-hover:shadow-lg group-hover:shadow-[#0A3D91]/30 transition-all duration-200">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2">{item.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-sm font-semibold text-[#0A3D91] bg-[#0A3D91]/8 px-2.5 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
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
