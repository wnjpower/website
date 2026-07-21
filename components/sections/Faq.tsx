'use client';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqs, type FaqSegment } from '@/content/faq';
import FaqSchema from '@/components/FaqSchema';
import { Container, SectionHeading } from '@/components/ui/section';

const tabs: { value: FaqSegment; label: string }[] = [
  { value: 'all',        label: '전체' },
  { value: 'industrial', label: '공장·산업' },
  { value: 'interior',   label: '인테리어·일반' },
];

interface Props {
  /**
   * FAQPage 구조화 데이터를 함께 출력할지 여부.
   * 같은 내용의 FAQPage가 여러 URL에 중복 노출되지 않도록,
   * 정본인 /faq 페이지에서만 true로 둔다.
   */
  withSchema?: boolean;
}

export default function Faq({ withSchema = false }: Props) {
  const [activeTab, setActiveTab] = useState<FaqSegment>('all');

  const filtered = faqs.filter(
    (f) => f.segments.includes('all') || f.segments.includes(activeTab) || activeTab === 'all',
  );

  return (
    <section id="faq" className="py-20 sm:py-24 bg-slate-50 text-ink">
      {withSchema && <FaqSchema />}
      <Container size="reading">
        <SectionHeading
          eyebrow="자주 묻는 질문"
          title="궁금한 점을 먼저 확인하세요"
          lead="상황에 맞는 탭을 선택하면 관련 질문만 모아 보실 수 있습니다."
        />

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-lg text-[0.9375rem] font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Accordion className="space-y-3">
          {filtered.map((faq, i) => (
            <AccordionItem
              key={`${activeTab}-${i}`}
              value={i}
              className="bg-white rounded-xl border border-slate-200 px-5 sm:px-6 data-[state=open]:border-brand/30 data-[state=open]:shadow-sm transition-all"
            >
              <AccordionTrigger className="text-left text-base sm:text-[1.0625rem] font-semibold text-ink py-5 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[0.9375rem] text-slate-600 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
