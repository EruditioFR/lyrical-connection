
import React from 'react';
import Hero from '@/components/home/Hero';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import CtaSection from '@/components/home/CtaSection';
import Layout from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedArtists />
      <UpcomingEvents />
      <Features />
      <Testimonials />
      <CtaSection />
    </Layout>
  );
};

export default Index;
