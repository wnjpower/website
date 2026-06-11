'use client';
import { useState } from 'react';
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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedCustomerType, setSelectedCustomerType] = useState<string | undefined>();

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSegment = (type: string) => {
    setSelectedCustomerType(type);
  };

  return (
    <main>
      <Header />
      <Hero />
      <CustomerSegments onSelectSegment={handleSelectSegment} />
      <Services onSelectCategory={handleSelectCategory} />
      <About />
      <Credentials />
      <WhyUs />
      <Process />
      <Pricing />
      <Portfolio />
      <Faq />
      <QuoteSection defaultCategory={selectedCategory} defaultCustomerType={selectedCustomerType} />
      <Contact />
      <Footer />
      <FloatingCta />
    </main>
  );
}
