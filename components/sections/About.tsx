import { Quote } from 'lucide-react';
import { COMPANY } from '@/lib/site';
import { Section, Container } from '@/components/ui/section';

const stats = [
  { value: '20년+', label: '대표 현장경력', note: '2023년 법인 설립' },
  { value: '공장·산업', label: '전기공사 전문', note: '수전·동력·배전반 자체제작' },
  { value: '1년 보증', label: '시공 후 사후관리', note: '당일 A/S 출동 원칙' },
];

export default function About() {
  return (
    <Section id="about" tone="white">
      <Container size="narrow">
        <div data-reveal className="rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* 대표 인사말 — 사진 확보 전까지 인용부호 심볼로 대체(가짜 사진 대신) */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-16 h-16 rounded-xl bg-brand flex items-center justify-center">
                <Quote className="w-8 h-8 text-white" fill="currentColor" />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl text-ink font-semibold leading-relaxed tracking-tight mb-4">
                “전기는 보이지 않는 곳에서 안전을 지키는 일입니다.
                <br className="hidden sm:block" />
                한 건 한 건, 제 집 공사라는 마음으로 시공하겠습니다.”
              </p>
              <p className="text-[0.9375rem] text-slate-600 leading-relaxed mb-5">
                우앤주전력은 공장·산업시설 전기공사를 주력으로, 수전설비·계약전력 증설·배전반
                자체 제작까지 직접 시공하는 대구·경북 지역 전기공사 법인입니다.{' '}
                <span className="font-semibold text-ink">대표의 20년 이상 현장 경험</span>을 바탕으로
                주택·상가·병원 인테리어 전기까지 합리적인 가격과 책임 있는 사후관리로 시공합니다.
              </p>
              <p className="text-[0.9375rem] font-semibold text-ink">
                {COMPANY.name} 대표 {COMPANY.ceo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-200">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-2xl font-bold text-brand mb-1">{stat.value}</div>
                <p className="text-sm font-semibold text-ink">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
