import Link from 'next/link';
import { Megaphone, ArrowRight } from 'lucide-react';
import type { SiteContent } from '@/lib/content/schema';

/** 배너 높이. Header·본문 여백이 이 값을 --banner-h 로 함께 참조한다. */
export const BANNER_HEIGHT = '2.5rem'; // 40px

export function bannerIsOn(content: SiteContent['banner']): boolean {
  return Boolean(content.enabled && content.text);
}

/**
 * 최상단 공지 띠.
 *
 * 기본은 꺼져 있다. 휴무·이벤트·한시 프로모션처럼 "지금만 알릴 것"이 생겼을 때
 * 어드민에서 켜고 문구만 바꿔 바로 내보내는 자리다.
 *
 * 헤더가 fixed라서 배너를 그냥 문서 흐름에 두면 헤더 뒤로 숨는다. 그래서 배너도
 * fixed로 최상단에 두고, 헤더와 본문은 --banner-h 만큼 아래로 밀린다.
 * 배너가 꺼져 있으면 --banner-h가 0이라 기존 레이아웃과 완전히 동일해진다.
 *
 * [색 — 액센트 계열 중 700을 쓰는 이유]
 * 1b 이관 뒤에도 이 띠만 옛 강조색(번트 앰버 #C2620E)에 남아, 사이트에서 혼자
 * 다른 시스템의 색으로 떠 있었다. 블루프린트 액센트로 통일하되 단계는 700이다.
 * 채움 버튼(.btn-solid)이 쓰는 --color-accent는 이 띠의 13px 본문 크기에서
 * 대비가 3.7:1로 WCAG AA(4.5:1)에 못 미친다. --color-accent-700은 5.8:1이라
 * 통과한다. 버튼은 글자가 커서 문제가 없지만 이 띠는 작아서 단계를 내렸다.
 * (옛 앰버도 4.2:1로 실은 AA 미달이었다 — 색을 바꾸며 함께 고쳤다.)
 *
 * 이 컴포넌트는 .blueprint-theme 안에서 렌더된다 — 토큰이 그 아래 정의돼 있다.
 */
export default function Banner({ content }: { content: SiteContent['banner'] }) {
  if (!bannerIsOn(content)) return null;

  const hasLink = Boolean(content.linkLabel && content.linkHref);

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] flex items-center"
      style={{
        height: BANNER_HEIGHT,
        background: 'var(--color-accent-700)',
        color: 'var(--color-bg)',
      }}
      data-cta-scope="banner"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-center gap-3 text-center w-full">
        <Megaphone className="w-4 h-4 flex-shrink-0" aria-hidden />
        <p className="text-[0.8125rem] sm:text-sm font-semibold break-keep truncate">{content.text}</p>
        {hasLink && (
          <Link
            href={content.linkHref}
            className="inline-flex items-center gap-1 text-[0.8125rem] sm:text-sm font-bold underline underline-offset-4 whitespace-nowrap hover:no-underline"
          >
            {content.linkLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
