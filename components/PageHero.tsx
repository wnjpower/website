import Link from 'next/link';
import { Phone } from 'lucide-react';
import type { Crumb } from '@/components/Breadcrumbs';
import { COMPANY } from '@/lib/site';

/**
 * 서브페이지 공통 머리 — 1b 블루프린트.
 *
 * 홈 히어로가 다크 네이비였을 때는 서브페이지도 같은 톤을 썼지만, 이 시스템의
 * 지배색은 밝은 그라운드(#f2f2f3)다. 도면 격자 위에 브레드크럼 → 제목 → 설명만
 * 두고 높이를 낮춰 본문이 빨리 시작되게 한다.
 *
 * 전화·견적 버튼은 여기서 뺐다. 헤더에 항상 떠 있고 데스크톱 독·모바일 하단 바가
 * 스크롤 내내 따라다녀서, 같은 버튼이 화면에 세 번 겹치던 상태였다(P3와 같은 문제).
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  /** 하위 호환 — 사진 도입 전까지 쓰이지 않는다 */
  bgImage?: string;
}) {
  return (
    <section className="sheet" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,48px) clamp(28px,3.5vw,40px)',
        }}
      >
        <nav aria-label="위치" className="text-muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
          <Link href="/">홈</Link>
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`}>
              {' / '}
              {crumb.href ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span style={{ color: 'var(--color-text)' }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap', marginBottom: lead ? 14 : 0 }}>
          {eyebrow && (
            <span
              className="display"
              // 제목(clamp 30~46px)과 한 쌍으로 읽히도록 같이 늘고 줄게 한다
              style={{ fontSize: 'clamp(19px,2.2vw,28px)', letterSpacing: '.12em', color: 'var(--color-accent-700)' }}
            >
              {eyebrow}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(30px,3.6vw,46px)', lineHeight: 1.1 }}>{title}</h1>
        </div>

        {lead && (
          <p style={{ fontSize: 'clamp(14px,1.2vw,16px)', lineHeight: 1.7, maxWidth: 820, margin: 0 }}>
            {lead}
          </p>
        )}

        <p className="text-muted" style={{ fontSize: 12.5, margin: '18px 0 0' }}>
          전기공사업 등록 <span className="mono-num">{COMPANY.license}</span>
          {'  ·  '}사업자 <span className="mono-num">{COMPANY.bizNumber}</span>
          {'  ·  '}
          <a href={`tel:${COMPANY.mobile}`} className="mono-num" style={{ color: 'var(--color-accent-700)' }}>
            <Phone size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
            {COMPANY.mobile}
          </a>
        </p>
      </div>
    </section>
  );
}
