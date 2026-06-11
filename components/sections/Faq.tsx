'use client';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqs, type FaqSegment } from '@/content/faq';

const tabs: { value: FaqSegment; label: string }[] = [
  { value: 'all',            label: '전체' },
  { value: 'residential',    label: '주택·아파트' },
  { value: 'small_business', label: '카페·상가' },
  { value: 'commercial',     label: '상업건물' },
];

export default function Faq() {
  const [activeTab, setActiveTab] = useState<FaqSegment>('all');

  const filtered = faqs.filter(
    (f) => f.segments.includes('all') || f.segments.includes(activeTab) || activeTab === 'all',
  );

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            자주 묻는 질문
          </h2>
          <p className="text-lg text-gray-500">내 상황에 맞는 탭을 선택하세요</p>
        </div>

        {/* 탭 필터 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-md text-base font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0A3D91] hover:text-[#0A3D91]'
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-[#0F172A] py-6 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-500 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
