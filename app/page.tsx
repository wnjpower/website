import Header from '@/components/Header';
import Hero from '@/components/sections/Hero';
import CustomerSegments from '@/components/sections/CustomerSegments';
import Services from '@/components/sections/Services';
import About from '@/components/sections/About';
import Credentials from '@/components/sections/Credentials';
import WhyUs from '@/components/sections/WhyUs';
import Process from '@/components/sections/Process';
import Pricing from '@/components/sections/Pricing';
import Portfolio from '@/components/sections/Portfolio';
import Faq from '@/components/sections/Faq';
import QuoteSection from '@/components/sections/QuoteSection';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingCta from '@/components/FloatingCta';
import ScrollReveal from '@/components/ScrollReveal';
import { QuotePrefillProvider } from '@/components/QuotePrefill';

// 견적폼 프리필 상태는 QuotePrefillProvider가 들고 있으므로
// 이 페이지는 서버 컴포넌트로 남는다. (메타데이터는 app/layout.tsx)
export default function Home() {
  return (
    <QuotePrefillProvider>
      <main>
        <ScrollReveal />
        <Header />
        <Hero />
        <CustomerSegments />
        <Services />
        <Credentials />
        <About />
        <WhyUs />
        <Process />
        <Pricing />
        <Portfolio />
        <Faq />
        <QuoteSection source="main_form" />
        <Contact />
        <Footer />
        <FloatingCta />
      </main>
    </QuotePrefillProvider>
  );
}
