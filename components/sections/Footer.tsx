import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B1220] text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <p className="text-white font-bold text-lg mb-3">주식회사 우앤주전력</p>
            <div className="space-y-1 text-sm">
              <p>대표자: 임태훈</p>
              <p>사업자등록번호: <span className="font-mono tabular-nums">637-81-02833</span></p>
              <p>주소: 대구광역시 서구 문화로63길 19, 1층 (평리동)</p>
              <p>
                전화:{' '}
                <a href="tel:053-525-0424" className="hover:text-white transition-colors">
                  053-525-0424
                </a>
              </p>
              <p>
                이메일:{' '}
                <a href="mailto:wnj-2023@naver.com" className="hover:text-white transition-colors">
                  wnj-2023@naver.com
                </a>
              </p>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <p className="text-white font-bold mb-3">서비스</p>
            <ul className="space-y-1 text-sm">
              <li><Link href="#services" className="hover:text-white transition-colors">전기공사</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">태양광 발전설비</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">실내 인테리어 전기</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© 2025 주식회사 우앤주전력. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
