import Link from 'next/link';
import { COMPANY } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* 회사 정보 */}
          <div className="md:col-span-1">
            <p className="text-white font-bold text-lg mb-4 tracking-tight">{COMPANY.name}</p>
            <div className="space-y-1.5 text-sm leading-relaxed">
              <p>대표자 {COMPANY.ceo}</p>
              <p>사업자등록번호 <span className="font-mono tabular-nums">{COMPANY.bizNumber}</span></p>
              <p>법인등록번호 <span className="font-mono tabular-nums">{COMPANY.corpNumber}</span></p>
              <p>전기공사업 등록 <span className="font-mono tabular-nums">{COMPANY.license}</span></p>
              <p className="break-keep">{COMPANY.address.full}</p>
            </div>
          </div>

          {/* 사업영역 */}
          <div>
            <p className="text-white font-bold mb-4">사업영역</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/factory" className="hover:text-white transition-colors">공장·산업 전기공사</Link></li>
              <li><Link href="/services/power" className="hover:text-white transition-colors">수전설비·계약전력 증설</Link></li>
              <li><Link href="/services/panel" className="hover:text-white transition-colors">배전반·분전반 자체 제작</Link></li>
              <li><Link href="/services/interior" className="hover:text-white transition-colors">인테리어·일반 전기</Link></li>
            </ul>
          </div>

          {/* 바로가기 + 연락 */}
          <div>
            <p className="text-white font-bold mb-4">바로가기</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/portfolio" className="hover:text-white transition-colors">시공 실적</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">회사소개</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
              <li>
                전화{' '}
                <a href={`tel:${COMPANY.phone}`} className="font-mono tabular-nums hover:text-white transition-colors">
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                이메일{' '}
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white transition-colors">
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {year} {COMPANY.name}. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  );
}
