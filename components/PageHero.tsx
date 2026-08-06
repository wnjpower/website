import Link from 'next/link';
import { Phone } from 'lucide-react';
import type { Crumb } from '@/components/Breadcrumbs';
import { COMPANY } from '@/lib/site';

/**
 * 서브페이지 공통 머리 — 1b 블루프린트.
 *
 * 홈 히어로가 다크 네이비였을 때는 서브페이지도 같은 톤을 썼지만, 이 시스템의
 * 지배색은 밝은 그라운드다. 흰 시트 위에 브레드크럼 → 제목 → 설명만
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

        {/*
          eyebrow는 제목 옆에 나란히 두지 않는다. 섹션 머리(SectionHead)와 같은
          "짧은 액센트 막대 + 작은 라벨" 형태로 제목 위에 얹는다.
          나란히 두던 때는 /portfolio처럼 라벨과 제목이 같은 말로 시작하는 곳에서
          큰 글씨가 두 번 반복돼 보였다. 위아래로 나누면 라벨은 분류, 제목은
          이름이라는 역할이 분명해진다.
        */}
        {eyebrow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span aria-hidden style={{ width: 30, height: 2, flex: 'none', background: 'var(--color-accent)' }} />
            <span
              className="display"
              style={{ fontSize: 12.5, letterSpacing: '.2em', color: 'var(--color-accent-700)' }}
            >
              {eyebrow}
            </span>
          </div>
        )}
        <h1 style={{ fontSize: 'clamp(30px,3.6vw,46px)', lineHeight: 1.1, marginBottom: lead ? 14 : 0 }}>
          {title}
        </h1>

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
