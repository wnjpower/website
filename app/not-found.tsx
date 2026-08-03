import Link from 'next/link';
import { ArrowRight, Home, Phone } from 'lucide-react';
import { CornerMarks } from '@/components/redesign/Chrome';
import { COMPANY } from '@/lib/site';
import { blueprintFontClass } from '@/lib/fonts';
import '@/components/redesign/blueprint.css';

export const metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: '/#services', label: '사업영역' },
  { href: '/portfolio', label: '시공 실적' },
  { href: '/#pricing', label: '비용 안내' },
  { href: '/faq', label: '자주 묻는 질문' },
  { href: '/about', label: '회사소개' },
];

/**
 * 404 — 1b 블루프린트.
 * 검색으로 잘못 들어온 사람을 그냥 돌려보내지 않고 전환 경로로 잇는다.
 * 잘못된 주소로 들어왔더라도 찾는 것은 대개 "전기공사 업체"이기 때문이다.
 */
export default function NotFound() {
  return (
    <main
      className={`blueprint-theme ${blueprintFontClass}`}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <div
        className="grid-field"
        style={{ width: '100%', padding: 'clamp(48px,8vw,96px) clamp(16px,4vw,48px)' }}
      >
        <div
          className="blueprint"
          style={{
            position: 'relative',
            maxWidth: 620,
            margin: '0 auto',
            padding: 'clamp(28px,4vw,44px)',
            background: 'var(--color-bg)',
          }}
        >
          <CornerMarks />

          <p
            className="display mono-num"
            style={{
              fontSize: 'clamp(56px,10vw,88px)',
              lineHeight: 1,
              color: 'var(--color-accent)',
              margin: '0 0 14px',
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', margin: '0 0 10px' }}>
            페이지를 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, margin: '0 0 26px', opacity: 0.85 }}>
            주소가 바뀌었거나 삭제된 페이지입니다. 찾으시는 공사가 있다면 전화 주시면 바로 안내해
            드립니다.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            <Link
              href="/#quote"
              className="display blueprint btn-solid is-solid"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 16, padding: '13px 24px' }}
            >
              <CornerMarks />
              무료 견적문의
              <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
            <a
              href={`tel:${COMPANY.mobile}`}
              className="display btn-outline mono-num"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '13px 20px' }}
            >
              <Phone size={15} strokeWidth={1.5} />
              {COMPANY.mobile}
            </a>
            <Link
              href="/"
              className="display btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '13px 20px' }}
            >
              <Home size={15} strokeWidth={1.5} />
              홈으로
            </Link>
          </div>

          <nav
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 20px',
              paddingTop: 18,
              borderTop: '1px solid var(--color-divider)',
            }}
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted"
                style={{ fontSize: 13.5 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
