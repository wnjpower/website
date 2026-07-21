import Header from '@/components/Header';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import WhyUs from '@/components/sections/WhyUs';
import Process from '@/components/sections/Process';
import Portfolio from '@/components/sections/Portfolio';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import QuoteSection from '@/components/sections/QuoteSection';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingCta from '@/components/FloatingCta';
import ScrollReveal from '@/components/ScrollReveal';
import { QuotePrefillProvider } from '@/components/QuotePrefill';

/*
 * 원페이지 정보구조 (재구축) — 방문자의 질문 하나씩만 담당하도록 정리했다.
 *   Hero        무엇을 하는 회사인가 / 어떻게 연락하나
 *   Services    구체적으로 어떤 공사를 하나
 *   WhyUs       믿을 수 있나 (차별점 + 조회 가능한 자격)
 *   Process     어떻게 진행되나
 *   Portfolio   해본 적 있나 (실적 원장)
 *   Pricing     얼마인가
 *   Faq         자주 묻는 것들
 *   Quote       문의하기 (전환)
 *   Contact     찾아가기·연락
 *
 * 이전의 CustomerSegments·About·Credentials 섹션은 서로 내용이 겹쳐 스크롤만
 * 길게 만들었다. 고객 유형 안내는 Hero·Services로, 신뢰·자격은 WhyUs로,
 * 대표 인사말·연혁은 /about 페이지로 정리했다.
 */
export default function Home() {
  return (
    <QuotePrefillProvider>
      <main>
        <ScrollReveal />
        <Header />
        <Hero />
        <Services />
        <WhyUs />
        <Process />
        <Portfolio />
        <Pricing />
        <Faq />
        <QuoteSection source="main_form" />
        <Contact />
        <Footer />
        <FloatingCta />
      </main>
    </QuotePrefillProvider>
  );
}
