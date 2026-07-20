import Link from 'next/link';
import { COMPANY } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1220] text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <p className="text-white font-bold text-lg mb-3">주식회사 우앤주전력</p>
            <div className="space-y-1 text-sm">
              <p>대표자: {COMPANY.ceo}</p>
              <p>사업자등록번호: <span className="font-mono tabular-nums">{COMPANY.bizNumber}</span></p>
              <p>법인등록번호: <span className="font-mono tabular-nums">{COMPANY.corpNumber}</span></p>
              <p>전기공사업 등록: <span className="font-mono tabular-nums">{COMPANY.license}</span></p>
              <p>주소: {COMPANY.address.full}</p>
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
              <li><Link href="#services" className="hover:text-white transition-colors">공장·산업 전기공사</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">수전설비·계약전력 증설</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">배전반·분전반 자체 제작</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">인테리어·일반 전기</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {year} {COMPANY.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
