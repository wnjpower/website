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
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:inline text-blue-200">·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
