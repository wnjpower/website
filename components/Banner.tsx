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
 */
export default function Banner({ content }: { content: SiteContent['banner'] }) {
  if (!bannerIsOn(content)) return null;

  const hasLink = Boolean(content.linkLabel && content.linkHref);

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] bg-signal text-white flex items-center"
      style={{ height: BANNER_HEIGHT }}
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
