'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/redesign/Chrome';
import type { SiteContent } from '@/lib/content/schema';

/**
 * FAQ — 답변을 접지 않고 노출한다.
 *
 * 아코디언은 답변이 DOM에는 있어도 사용자가 한 번 더 눌러야 보이고, AI 검색·스니펫
 * 인용에서도 접힌 답변은 불리하다. 이 업의 질문은 "출장비가 있나요" 같은 짧은
 * 확인이라 접어서 아낄 세로 공간보다 바로 읽히는 이점이 크다(P8).
 *
 * 핵심 6문항만 먼저 보이고 나머지는 버튼으로 펼친다 — 14개를 모두 펼쳐두면
 * 그 아래 견적폼까지 스크롤이 너무 길어진다.
 */

const CORE_COUNT = 6;

export default function HomeFaq({ content }: { content: SiteContent['faq'] }) {
  const [showAll, setShowAll] = useState(false);
  const items = content.items;
  const visible = showAll ? items : items.slice(0, CORE_COUNT);
  const hasMore = items.length > CORE_COUNT;

  return (
    <section id="faq" style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,48px)' }}>
        <SectionHead
          no="06"
          title={content.title}
          note={content.lead || '답변을 접지 않고 노출합니다'}
          gap={40}
          action={
            hasMore ? (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="display"
                style={{
                  fontSize: 15,
                  color: 'var(--color-accent-700)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                {showAll ? `핵심 ${CORE_COUNT}문항만 보기` : `전체 ${items.length}문항 보기 →`}
              </button>
            ) : undefined
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
            gap: '0 56px',
          }}
        >
          {visible.map((faq) => (
            <div
              key={faq.question}
              style={{ padding: '20px 0', borderTop: '1px solid var(--color-divider)' }}
            >
              <h3 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, margin: '0 0 6px', letterSpacing: 0 }}>
                <span className="display" style={{ color: 'var(--color-accent-700)', marginRight: 8 }}>
                  Q
                </span>
                {faq.question}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0, opacity: 0.8 }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
