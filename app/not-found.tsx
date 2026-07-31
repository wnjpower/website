import Link from 'next/link';
import { Home, Phone, Search } from 'lucide-react';
import { COMPANY } from '@/lib/site';

export const metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: true },
};

/**
 * 404. 검색으로 잘못 들어온 사람을 그냥 돌려보내지 않고 전환 경로로 잇는다.
 * 잘못된 주소로 들어왔더라도 찾는 것은 대개 "전기공사 업체"이기 때문이다.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-20">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-brand tabular-nums mb-4">404</p>
        <h1 className="text-2xl font-bold text-ink mb-3">페이지를 찾을 수 없습니다</h1>
        <p className="text-slate-600 leading-relaxed mb-8 break-keep">
          주소가 바뀌었거나 삭제된 페이지입니다.
          찾으시는 공사가 있다면 전화 주시면 바로 안내해 드립니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a
            href={`tel:${COMPANY.mobile}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal hover:brightness-105 text-white font-bold px-6 py-3.5 transition-all"
          >
            <Phone className="w-5 h-5" />
            <span className="tabular-nums">{COMPANY.mobile}</span>
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand/25 text-brand font-bold px-6 py-3.5 hover:bg-brand-tint transition-colors"
          >
            <Home className="w-5 h-5" />
            홈으로
          </Link>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          <Link href="/#services" className="text-slate-500 hover:text-brand inline-flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            사업영역
          </Link>
          <Link href="/portfolio" className="text-slate-500 hover:text-brand">시공 실적</Link>
          <Link href="/#pricing" className="text-slate-500 hover:text-brand">비용 안내</Link>
          <Link href="/faq" className="text-slate-500 hover:text-brand">자주 묻는 질문</Link>
          <Link href="/#quote" className="text-slate-500 hover:text-brand">무료 견적문의</Link>
        </nav>
      </div>
    </main>
  );
}
