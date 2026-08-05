import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SECTION_DEFS } from '@/lib/content/schema';
import { getAllSectionStates } from '@/lib/content/admin';
import PageHeader from '@/components/admin/PageHeader';
import { Chip, Notice } from '@/components/admin/ui';

export default async function ContentIndexPage() {
  const states = await getAllSectionStates();
  const pendingCount = Object.values(states).filter((s) => s.hasDraft).length;

  return (
    <div className="space-y-4">
      <PageHeader
        no="03"
        title="홈페이지 편집"
        description="바꾸고 싶은 영역을 고르세요. 문구를 고치면 오른쪽 미리보기에 바로 나타나고, [발행]을 눌러야 실제 사이트에 반영됩니다."
      />

      {pendingCount > 0 && (
        <Notice tone="warn">
          <span>
            발행되지 않은 수정이 <strong>{pendingCount}곳</strong> 있습니다. 해당 영역에 들어가 [발행]을
            눌러주세요.
          </span>
        </Notice>
      )}

      {/*
        카드는 홈의 순서 그대로 번호를 붙인다. 사장님이 화면을 위에서 아래로
        훑으며 "세 번째 영역"을 찾는 방식과 목록의 순서가 같아진다.
      */}
      {/* 정합 마크가 상자 바깥 6px에 그려진다. 사이트 카드 그리드와 같은 28px 간격을
          줘야 옆 카드의 마크와 겹치지 않는다. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        {SECTION_DEFS.map((section, i) => {
          const state = states[section.key];
          return (
            <Link
              key={section.key}
              href={`/admin/content/${section.key}`}
              className="a-panel post-card block"
              style={{ padding: '16px 18px' }}
            >
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="display" style={{ fontSize: 13, letterSpacing: '.12em', color: 'var(--color-accent-700)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="display truncate" style={{ fontSize: 18 }}>{section.label}</h2>
                {state?.hasDraft && <Chip tone="warn">발행 대기</Chip>}
                <ArrowRight
                  className="w-4 h-4 ml-auto flex-shrink-0"
                  strokeWidth={1.5}
                  style={{ color: 'var(--color-accent-700)' }}
                />
              </div>
              <p className="text-muted break-keep" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {section.summary}
              </p>
            </Link>
          );
        })}
      </div>

      <Notice title="여기서 못 바꾸는 것">
        <ul className="space-y-1">
          <li>
            <strong>사업자 정보</strong> — 등록번호·주소·전화·팩스·이메일. 실수로 바뀌면 공공기관 조회가
            어긋나 신뢰가 통째로 깨지는 값이라 코드에서 관리합니다.
          </li>
          <li>
            <strong>시공 실적 원장</strong> — 홈 «03 시공 실적» 표와 실적 상세 페이지. 발주처 확인이 끝난
            건만 올리는 자료라 개발자가 반영합니다.
          </li>
          <li>
            <strong>서비스 상세 페이지 본문</strong>과 <strong>푸터</strong> — 긴 기술 설명, 등록번호가
            들어가는 맨 아래 줄.
          </li>
        </ul>
        <p className="mt-2 opacity-80">수정이 필요하면 개발자에게 요청하세요.</p>
      </Notice>
    </div>
  );
}
