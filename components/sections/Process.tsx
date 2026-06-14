const steps = [
  {
    step: '01',
    title: '문의 접수',
    duration: '즉시~1영업일',
    description: '폼, 전화, 카카오톡 중 편한 방법으로 문의주세요. 24시간 접수 가능합니다.',
  },
  {
    step: '02',
    title: '현장 실사·견적',
    duration: '고객 요청일 협의',
    description: '전문가가 직접 현장을 방문해 정확한 견적을 무료로 제공합니다. 방문 일정은 고객 요청일에 맞춰 신속히 협의합니다.',
  },
  {
    step: '03',
    title: '시공',
    duration: '규모별 1일~2주',
    description: '면허 보유 전문 인력이 안전하고 깔끔하게 시공합니다. 일정은 견적 시 확정됩니다.',
  },
  {
    step: '04',
    title: '사후관리·A/S',
    duration: '준공 후 1년 보증',
    description: '대구·경북 당일 출동 원칙으로 사후관리합니다.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            진행 프로세스
          </h2>
          <p className="text-base sm:text-lg text-gray-500">문의부터 사후관리까지, 각 단계 소요 기간을 미리 알려드립니다</p>
        </div>

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 border border-gray-200 hover:border-[#0A3D91]/40 border-t-4 border-t-[#0A3D91] h-full flex flex-col">
                <p className="text-sm font-bold text-gray-300 tracking-widest mb-2 tabular-nums">STEP {s.step}</p>
                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2">{s.title}</h3>
                <span className="inline-block w-fit text-sm font-bold text-[#0A3D91] bg-[#0A3D91]/8 rounded-md px-3 py-1 mb-3">
                  {s.duration}
                </span>
                <p className="text-base text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
