import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Benefits from '../components/Benefits';
import HowItWorks from '../components/HowItWorks';
import Integrations from '../components/Integrations';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Benefits />
      <HowItWorks />
      <Integrations />
    </>
  );
}
