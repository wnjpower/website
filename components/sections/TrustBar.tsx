const items = [
  '사업자등록 637-81-02833',
  '전기공사업 등록업체',
  '2023년 설립',
  '대구광역시 서구 평리동',
];

export default function TrustBar() {
  return (
    <div className="bg-[#0A3D91] text-white py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* 모바일: 2열 그리드 */}
        <div className="grid grid-cols-2 sm:hidden gap-x-4 gap-y-1.5 text-sm font-medium">
          {items.map((item, i) => (
            <span key={i} className="text-center text-blue-100">{item}</span>
          ))}
        </div>
        {/* sm+: 한 줄 */}
        <div className="hidden sm:flex flex-wrap justify-center gap-x-6 text-sm font-medium">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-blue-200">·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
