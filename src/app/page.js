'use client';

import { useEffect } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/features/home/Hero';
import Features from '../components/features/home/Features';
import HowItWorks from '../components/features/home/HowItWorks';
import Testimonials from '../components/features/home/Testimonials';
import Pricing from '../components/features/home/Pricing';
import FAQ from '../components/features/home/FAQ';
import Footer from '../components/layout/Footer';
import BrokerLogos from '../components/features/home/BrokerLogos';

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />
      <Hero />
      <BrokerLogos />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
